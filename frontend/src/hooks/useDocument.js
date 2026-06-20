import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getDocumentById,
  patchDocumentContent,
  patchDocumentTitle,
} from '../services/documentService.js';
import { AUTOSAVE_DEBOUNCE_MS } from '../lib/constants.js';

/**
 * Loads a single document and exposes save / autosave helpers.
 *
 * @param {number|string} docId
 */
export function useDocument(docId) {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'unsaved' | 'error'

  const autosaveTimer = useRef(null);
  const pendingContentRef = useRef(null);

  // ── Load ──────────────────────────────────────────────────────────────────

  const loadDoc = useCallback(() => {
    if (!docId) return;
    setLoading(true);
    setError(null);
    clearTimeout(autosaveTimer.current);
    getDocumentById(docId)
      .then((doc) => {
        setDocument(doc);
        setSaveStatus('saved');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [docId]);

  useEffect(() => {
    loadDoc();
  }, [loadDoc]);

  // ── Save content ──────────────────────────────────────────────────────────

  const saveContent = useCallback(
    async (content) => {
      if (!docId) return;
      setSaveStatus('saving');
      try {
        const updated = await patchDocumentContent(
          docId,
          typeof content === 'string' ? content : JSON.stringify(content)
        );
        setDocument(updated);
        setSaveStatus('saved');
      } catch (err) {
        setSaveStatus('error');
        console.error('[useDocument] Save failed:', err);
      }
    },
    [docId]
  );

  // ── Save title ────────────────────────────────────────────────────────────

  const saveTitle = useCallback(
    async (title) => {
      if (!docId) return;
      try {
        const updated = await patchDocumentTitle(docId, title);
        setDocument(updated);
      } catch (err) {
        console.error('[useDocument] Title save failed:', err);
      }
    },
    [docId]
  );

  // ── Autosave (debounced) ──────────────────────────────────────────────────

  const scheduleAutosave = useCallback(
    (content) => {
      pendingContentRef.current = content;
      setSaveStatus('unsaved');
      clearTimeout(autosaveTimer.current);
      autosaveTimer.current = setTimeout(() => {
        pendingContentRef.current = null;
        saveContent(content);
      }, AUTOSAVE_DEBOUNCE_MS);
    },
    [saveContent]
  );

  // Flush any pending autosave synchronously when the component unmounts
  // so navigating away before the debounce fires doesn't lose content.
  useEffect(() => {
    return () => {
      clearTimeout(autosaveTimer.current);
      if (pendingContentRef.current !== null) {
        patchDocumentContent(
          docId,
          typeof pendingContentRef.current === 'string'
            ? pendingContentRef.current
            : JSON.stringify(pendingContentRef.current)
        ).catch(() => {});
      }
    };
  }, [docId]);

  return { document, loading, error, saveStatus, saveContent, saveTitle, scheduleAutosave, reloadDoc: loadDoc };
}
