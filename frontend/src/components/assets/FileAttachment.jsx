import { useRef, useState } from 'react';
import { uploadAsset, getAssetDownloadUrl, deleteAsset } from '../../services/assetService.js';

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * @param {{ docId: number|string, username: string, assets: import('../../types/index.js').DocumentAsset[], onChanged: () => void }} props
 */
export default function FileAttachment({ docId, username, assets = [], onChanged }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  async function handleFile(file) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      await uploadAsset(docId, username, file);
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(assetId) {
    try {
      await deleteAsset(assetId, username);
      onChanged();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="file-attachment">
      <div className="file-attachment__list">
        {assets.map((asset) => (
          <div key={asset.id} className="file-attachment__item">
            <a
              className="file-attachment__name"
              href={getAssetDownloadUrl(asset.id)}
              download={asset.fileName}
              target="_blank"
              rel="noreferrer"
            >
              📎 {asset.fileName}
            </a>
            <span className="file-attachment__size">{formatBytes(asset.sizeBytes)}</span>
            <button
              className="file-attachment__delete"
              onClick={() => handleDelete(asset.id)}
              title="Remove attachment"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        className="file-attachment__add"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? 'Uploading…' : '+ Attach file'}
      </button>
      <input
        ref={inputRef}
        type="file"
        className="file-attachment__input"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && <p className="file-attachment__error">{error}</p>}
    </div>
  );
}
