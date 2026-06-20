import { useEffect, useRef, useCallback } from 'react';
import { publishUpdate } from '../services/collabService.js';
import { BASE_URL, getToken } from '../lib/api.js';
import { COLLAB_DEBOUNCE_MS } from '../lib/constants.js';

/**
 * Wires a Tiptap editor to the backend SSE + Redis collaboration layer.
 *
 * Flow:
 *   User types → debounce 1500ms → PATCH /api/collab/update/{docId}
 *   Redis PUBLISH → Spring SSE → EventSource fires "doc-update" → applyUpdate
 *
 * @param {number|string} docId  - Document ID
 * @param {import('@tiptap/react').Editor|null} editor - Tiptap editor instance
 * @param {React.MutableRefObject<boolean>} [isRemoteUpdateRef] - Optional shared ref;
 *   set to true while applying a remote update so the caller's onUpdate can skip autosave.
 */
export function useDocumentCollab(docId, editor, isRemoteUpdateRef) {
  const debounceTimer = useRef(null);
  const eventSourceRef = useRef(null);
  // Keep a ref to the latest editor so the SSE handler always sees it
  // without needing to tear down and re-open the EventSource.
  const editorRef = useRef(editor);
  useEffect(() => { editorRef.current = editor; }, [editor]);

  // Fallback internal ref when the caller doesn't pass one in.
  const internalRemoteRef = useRef(false);
  const isRemoteUpdate = isRemoteUpdateRef ?? internalRemoteRef;

  // ── SSE subscription ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!docId) return;

    const token = getToken();
    // EventSource cannot set headers, so the JWT is sent as a query param.
    // Use BASE_URL when set (prod), otherwise a relative URL so Vite proxies it.
    const base = BASE_URL || '';
    const url = `${base}/api/collab/stream/${docId}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener('doc-update', (event) => {
      const currentEditor = editorRef.current;
      if (!currentEditor) return;
      try {
        const dto = JSON.parse(event.data);
        if (dto.type === 'text-change' && dto.content) {
          isRemoteUpdate.current = true;
          currentEditor.commands.setContent(dto.content, false);
          isRemoteUpdate.current = false;
        }
      } catch (err) {
        console.error('[useDocumentCollab] Failed to apply remote update:', err);
      }
    });

    es.addEventListener('connected', () => {
      console.debug('[useDocumentCollab] SSE connected for doc', docId);
    });

    es.onerror = (err) => {
      console.warn('[useDocumentCollab] SSE error, will auto-reconnect:', err);
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [docId]);

  // ── Outbound change publishing ────────────────────────────────────────────

  const sendUpdate = useCallback(
    (content) => {
      publishUpdate(docId, 'text-change', content).catch((err) => {
        console.error('[useDocumentCollab] Failed to publish update:', err);
      });
    },
    [docId]
  );

  // ── Tiptap editor listener ────────────────────────────────────────────────

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      if (isRemoteUpdate.current) return;

      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        const json = editor.getJSON();
        sendUpdate(json);
      }, COLLAB_DEBOUNCE_MS);
    };

    editor.on('update', handleUpdate);
    return () => {
      editor.off('update', handleUpdate);
      clearTimeout(debounceTimer.current);
    };
  }, [editor, sendUpdate]);

  return { sendUpdate };
}
