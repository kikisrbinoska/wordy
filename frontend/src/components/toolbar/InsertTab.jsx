import { useRef, useState } from 'react';
import ImageUpload from '../assets/ImageUpload.jsx';

/**
 * @param {{ editor: import('@tiptap/react').Editor|null, docId: number|string, username: string }} props
 */
export default function InsertTab({ editor, docId, username }) {
  if (!editor) return null;

  const [showImageUpload, setShowImageUpload] = useState(false);
  const { chain } = editor;

  function insertTable() {
    chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }

  function insertHorizontalRule() {
    chain().focus().setHorizontalRule().run();
  }

  function insertCodeBlock() {
    chain().focus().toggleCodeBlock().run();
  }

  function handleImageUploaded(asset) {
    const url = `${import.meta.env.VITE_API_URL ?? 'http://localhost:9096'}/api/assets/${asset.id}/download`;
    chain().focus().setImage({ src: url, alt: asset.fileName }).run();
    setShowImageUpload(false);
  }

  return (
    <div className="toolbar-tab toolbar-insert">
      <button className="toolbar-btn" onClick={insertTable} title="Insert table">
        ⊞ Table
      </button>

      <button
        className="toolbar-btn"
        onClick={() => setShowImageUpload((v) => !v)}
        title="Insert image"
      >
        🖼 Image
      </button>

      <button className="toolbar-btn" onClick={insertHorizontalRule} title="Horizontal rule">
        — Rule
      </button>

      <button className="toolbar-btn" onClick={insertCodeBlock} title="Code block">
        {'</>'}  Code
      </button>

      {showImageUpload && (
        <div className="insert-tab__image-popup">
          <ImageUpload
            docId={docId}
            username={username}
            onUploaded={handleImageUploaded}
          />
          <button className="toolbar-btn" onClick={() => setShowImageUpload(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
