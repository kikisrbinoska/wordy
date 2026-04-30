import { useEffect, useRef, useCallback } from 'react';

const API_BASE = 'http://localhost:9096/api/collab';
const DEBOUNCE_MS = 1500;

/**
 * Wires a Tiptap editor to the backend SSE + Redis collaboration layer.
 *
 * Flow:
 *   User types → debounce 1500ms → PATCH /api/collab/update/{docId}
 *   Redis PUBLISH → Spring SSE → EventSource fires "doc-update" → applyUpdate
 *
 * @param {number|string} docId  - Document ID
 * @param {import('@tiptap/react').Editor|null} editor - Tiptap editor instance
 * @param {string} token - JWT Bearer token for the authenticated user
 */
export function useDocumentCollab(docId, editor, token) {
  const debounceTimer = useRef(null);
  const eventSourceRef = useRef(null);
  // Tracks whether the next editor "update" event was caused by an incoming
  // remote change so we don't echo it back to the server.
  const isRemoteUpdate = useRef(false);

  // ── SSE subscription ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!docId || !token) return;

    // EventSource cannot set headers, so the JWT is sent as a query param.
    const url = `${API_BASE}/stream/${docId}?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener('doc-update', (event) => {
      if (!editor) return;
      try {
        const dto = JSON.parse(event.data);
        if (dto.type === 'text-change' && dto.content) {
          isRemoteUpdate.current = true;
          // Replace the whole document content from the remote JSON snapshot.
          // For a production app you'd apply incremental steps instead.
          editor.commands.setContent(dto.content, false);
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
  }, [docId, token]); // eslint-disable-line react-hooks/exhaustive-deps
  // editor is intentionally excluded — we only need it inside the callback,
  // not as a dep for opening/closing the EventSource.

  // ── Outbound change publishing ────────────────────────────────────────────

  const publishUpdate = useCallback(
    (content) => {
      fetch(`${API_BASE}/update/${docId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorizn
        }),
      }).catch((err) => {
        console.error('[useDocumentCollab] Failed to publish update:', err);
      });
    },
    [docId, token]
  );

  // ── Tiptap editor listener ────────────────────────────────────────────────

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      // Skip echoing remote changes back to the server.
      if (isRemoteUpdate.current) return;

      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        const json = editor.getJSON();
        publishUpdate(json);
      }, DEBOUNCE_MS);
    };

    editor.on('update', handleUpdate);
    return () => {
      editor.off('update', handleUpdate);
      clearTimeout(debounceTimer.current);
    };
  }, [editor, publishUpdate]);
}
