import { apiFetch } from '../lib/api.js';

// ── Documents ─────────────────────────────────────────────────────────────────

export function getAllDocuments() {
  return apiFetch('/api/documents');
}

export function getDocumentById(docId) {
  return apiFetch(`/api/documents/${docId}`);
}

export function getDocumentsByOwner(username) {
  return apiFetch(`/api/documents/owner/${encodeURIComponent(username)}`);
}

export function getDocumentContent(docId) {
  return apiFetch(`/api/documents/${docId}/content`);
}

/**
 * @param {{ ownerUsername: string, title: string, content?: string, isTemplate?: boolean }} data
 */
export function createDocument(data) {
  return apiFetch('/api/documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

/**
 * @param {number|string} docId
 * @param {{ title: string, content: string }} data
 */
export function updateDocument(docId, data) {
  return apiFetch(`/api/documents/${docId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function patchDocumentContent(docId, content) {
  return apiFetch(`/api/documents/${docId}/content`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
}

export function patchDocumentTitle(docId, title) {
  return apiFetch(`/api/documents/${docId}/title`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
}

export function deleteDocument(docId) {
  return apiFetch(`/api/documents/${docId}`, { method: 'DELETE' });
}

// ── Permissions / Collaborators ───────────────────────────────────────────────

export function getCollaborators(docId) {
  return apiFetch(`/api/documents/${docId}/collab`);
}

/**
 * @param {number|string} docId
 * @param {string} ownerUsername  sent in X-User-Username header
 * @param {{ inviteeUsername: string, role: import('../types/index.js').DocumentRole }} data
 */
export function inviteCollaborator(docId, ownerUsername, data) {
  return apiFetch(`/api/documents/${docId}/collab/invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Username': ownerUsername,
    },
    body: JSON.stringify(data),
  });
}

/**
 * @param {number|string} docId
 * @param {string} ownerUsername
 * @param {{ targetUsername: string, role: import('../types/index.js').DocumentRole }} data
 */
export function changeCollaboratorRole(docId, ownerUsername, data) {
  return apiFetch(`/api/documents/${docId}/collab/change-role`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Username': ownerUsername,
    },
    body: JSON.stringify(data),
  });
}

export function removeCollaborator(docId, ownerUsername, targetUsername) {
  return apiFetch(
    `/api/documents/${docId}/collab/${encodeURIComponent(targetUsername)}`,
    {
      method: 'DELETE',
      headers: { 'X-User-Username': ownerUsername },
    }
  );
}

// ── Versions ──────────────────────────────────────────────────────────────────

export function getVersions(docId) {
  return apiFetch(`/api/documents/${docId}/versions`);
}

export function createSnapshot(docId, authorUsername, label) {
  return apiFetch(`/api/documents/${docId}/versions/snapshot`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Username': authorUsername,
    },
    body: JSON.stringify({ label }),
  });
}

export function restoreVersion(docId, versionId) {
  return apiFetch(`/api/documents/${docId}/versions/${versionId}/restore`, {
    method: 'POST',
  });
}
