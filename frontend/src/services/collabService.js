import { apiFetch } from '../lib/api.js';

/**
 * Publish a Tiptap change to the collaboration layer.
 *
 * @param {number|string} docId
 * @param {'text-change'|'cursor'|'presence'} type
 * @param {Object} content  - Tiptap JSON or cursor/presence payload
 */
export function publishUpdate(docId, type, content) {
  return apiFetch(`/api/collab/update/${docId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, content }),
  });
}
