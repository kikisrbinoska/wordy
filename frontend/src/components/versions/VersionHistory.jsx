import { useState, useEffect } from 'react';
import { getVersions, createSnapshot, restoreVersion } from '../../services/documentService.js';

/**
 * @param {{ docId: number|string, username: string, onRestored: () => void }} props
 */
export default function VersionHistory({ docId, username, onRestored }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newLabel, setNewLabel] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!docId) return;
    setLoading(true);
    getVersions(docId)
      .then(setVersions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [docId]);

  async function handleSnapshot(e) {
    e.preventDefault();
    const label = newLabel.trim() || `Snapshot ${new Date().toLocaleString()}`;
    setSaving(true);
    try {
      await createSnapshot(docId, username, label);
      setNewLabel('');
      const updated = await getVersions(docId);
      setVersions(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleRestore(versionId) {
    if (!window.confirm('Restore this version? Current content will be replaced.')) return;
    try {
      await restoreVersion(docId, versionId);
      onRestored?.();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="version-history__loading">Loading versions…</div>;

  return (
    <div className="version-history">
      <h3 className="version-history__title">Version History</h3>

      {error && <p className="version-history__error">{error}</p>}

      <form className="version-history__snapshot" onSubmit={handleSnapshot}>
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Snapshot label (optional)"
          className="version-history__label-input"
        />
        <button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save snapshot'}
        </button>
      </form>

      <ul className="version-history__list">
        {versions.map((v) => (
          <li key={v.id} className="version-history__item">
            <div className="version-history__item-info">
              <strong>v{v.versionNumber}</strong>
              {v.label && <span> — {v.label}</span>}
              <span className="version-history__item-date">
                {new Date(v.createdAt).toLocaleString()}
              </span>
              <span className="version-history__item-author">
                by {v.author?.displayName ?? v.author?.username}
              </span>
            </div>
            <button className="version-history__restore" onClick={() => handleRestore(v.id)}>
              Restore
            </button>
          </li>
        ))}
        {versions.length === 0 && (
          <li className="version-history__empty">No saved versions yet.</li>
        )}
      </ul>
    </div>
  );
}
