import { useRef, useState } from 'react';
import { uploadAsset } from '../../services/assetService.js';

/**
 * @param {{ docId: number|string, username: string, onUploaded: (asset: import('../../types/index.js').DocumentAsset) => void }} props
 */
export default function ImageUpload({ docId, username, onUploaded }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  async function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const asset = await uploadAsset(docId, username, file);
      onUploaded(asset);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  }

  return (
    <div
      className={`image-upload${dragging ? ' image-upload--dragging' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="image-upload__input"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {uploading ? (
        <span>Uploading…</span>
      ) : (
        <span>Drop image here or click to upload</span>
      )}
      {error && <p className="image-upload__error">{error}</p>}
    </div>
  );
}
