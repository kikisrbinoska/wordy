import { useRef, useState } from 'react';
import { uploadAsset, getAssetDownloadUrl, getAssetPreviewUrl, deleteAsset } from '../../services/assetService.js';

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(name) {
  const ext = name.split('.').pop().toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return '🖼';
  if (ext === 'pdf') return '📄';
  if (['doc', 'docx'].includes(ext)) return '📝';
  if (['xls', 'xlsx'].includes(ext)) return '📊';
  if (['zip', 'rar', '7z'].includes(ext)) return '🗜';
  if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) return '🎬';
  if (['mp3', 'wav', 'ogg'].includes(ext)) return '🎵';
  return '📎';
}

function isImage(name) {
  return /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(name);
}

function isPdf(name) {
  return /\.pdf$/i.test(name);
}

function isVideo(name) {
  return /\.(mp4|mov|avi|webm|ogg)$/i.test(name);
}

function PreviewModal({ asset, onClose }) {
  const url = getAssetPreviewUrl(asset.id);
  const downloadUrl = getAssetDownloadUrl(asset.id);

  return (
    <div className="asset-preview-overlay" onClick={onClose}>
      <div className="asset-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="asset-preview-modal__header">
          <span className="asset-preview-modal__title">
            {fileIcon(asset.fileName)} {asset.fileName}
          </span>
          <div className="asset-preview-modal__actions">
            <a
              className="asset-preview-modal__download"
              href={downloadUrl}
              download={asset.fileName}
              title="Download"
            >
              ⬇ Download
            </a>
            <button className="asset-preview-modal__close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="asset-preview-modal__body">
          {isImage(asset.fileName) && (
            <img
              className="asset-preview-modal__img"
              src={url}
              alt={asset.fileName}
            />
          )}
          {isPdf(asset.fileName) && (
            <iframe
              className="asset-preview-modal__iframe"
              src={url}
              title={asset.fileName}
            />
          )}
          {isVideo(asset.fileName) && (
            <video
              className="asset-preview-modal__video"
              src={url}
              controls
              autoPlay={false}
            />
          )}
          {!isImage(asset.fileName) && !isPdf(asset.fileName) && !isVideo(asset.fileName) && (
            <div className="asset-preview-modal__unsupported">
              <div className="asset-preview-modal__unsupported-icon">{fileIcon(asset.fileName)}</div>
              <p>Preview not available for this file type.</p>
              <a
                className="asset-preview-modal__download-btn"
                href={downloadUrl}
                download={asset.fileName}
              >
                ⬇ Download {asset.fileName}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * @param {{ docId: number|string, username: string, assets: import('../../types/index.js').DocumentAsset[], onChanged: () => void, onClose: () => void }} props
 */
export default function FileAttachment({ docId, username, assets = [], onChanged, onClose }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

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
      inputRef.current.value = '';
    }
  }

  async function handleDelete(e, assetId) {
    e.stopPropagation();
    try {
      await deleteAsset(assetId, username);
      onChanged();
      if (preview?.id === assetId) setPreview(null);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <div className="file-attachment">
        <div className="file-attachment__header">
          <span className="file-attachment__heading">Attachments</span>
          <button className="file-attachment__close" onClick={onClose} title="Close">✕</button>
        </div>

        <div className="file-attachment__list">
          {assets.length === 0 && (
            <p className="file-attachment__empty">No attachments yet.</p>
          )}
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="file-attachment__item"
              onClick={() => setPreview(asset)}
              title="Click to preview"
            >
              <span className="file-attachment__icon">{fileIcon(asset.fileName)}</span>
              <span className="file-attachment__name">{asset.fileName}</span>
              <span className="file-attachment__size">{formatBytes(asset.sizeBytes)}</span>
              <button
                className="file-attachment__delete"
                onClick={(e) => handleDelete(e, asset.id)}
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

      {preview && (
        <PreviewModal asset={preview} onClose={() => setPreview(null)} />
      )}
    </>
  );
}
