import { apiFetch, apiUpload, BASE_URL, getToken } from '../lib/api.js';

export function getAssets(docId) {
  return apiFetch(`/api/documents/${docId}/assets`);
}

/**
 * @param {number|string} docId
 * @param {string} uploaderUsername
 * @param {File} file
 * @returns {Promise<import('../types/index.js').DocumentAsset>}
 */
export function uploadAsset(docId, uploaderUsername, file) {
  const formData = new FormData();
  formData.append('file', file);
  return apiUpload(`/api/documents/${docId}/assets`, formData, {
    'X-User-Username': uploaderUsername,
  });
}

export function deleteAsset(assetId, uploaderUsername) {
  return apiFetch(`/api/assets/${assetId}`, {
    method: 'POST',
    headers: { 'X-User-Username': uploaderUsername },
  });
}

export function getAssetDownloadUrl(assetId) {
  const token = getToken();
  // BASE_URL may be empty (relative) in dev — that's fine for <a href>
  return `${BASE_URL}/api/assets/${assetId}/download${token ? `?token=${encodeURIComponent(token)}` : ''}`;
}
