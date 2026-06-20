import { useState, useRef } from 'react';

const MAX_ROWS = 8;
const MAX_COLS = 8;

function TablePicker({ onPick, onClose }) {
  const [hovered, setHovered] = useState({ rows: 0, cols: 0 });

  return (
    <div className="insert-popup" onMouseLeave={() => setHovered({ rows: 0, cols: 0 })}>
      <div className="insert-popup__label">
        {hovered.rows > 0
          ? `${hovered.rows} × ${hovered.cols} table`
          : 'Select table size'}
      </div>
      <div className="table-picker">
        {Array.from({ length: MAX_ROWS }, (_, r) =>
          Array.from({ length: MAX_COLS }, (_, c) => (
            <div
              key={`${r}-${c}`}
              className={`table-picker__cell${
                r < hovered.rows && c < hovered.cols ? ' table-picker__cell--active' : ''
              }`}
              onMouseEnter={() => setHovered({ rows: r + 1, cols: c + 1 })}
              onClick={() => { onPick(r + 1, c + 1); onClose(); }}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ImagePickerPopup({ onInsertUrl, onInsertFile, onClose }) {
  const [url, setUrl] = useState('');
  const fileRef = useRef(null);
  const [error, setError] = useState(null);

  function handleUrl() {
    if (!url.trim()) return;
    onInsertUrl(url.trim());
    onClose();
  }

  function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      onInsertFile(e.target.result, file.name);
      onClose();
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="insert-popup insert-popup--image">
      <div className="insert-popup__section">
        <label className="insert-popup__label">From URL</label>
        <div className="insert-popup__row">
          <input
            className="insert-popup__input"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUrl()}
          />
          <button className="toolbar-btn" onClick={handleUrl}>Insert</button>
        </div>
      </div>
      <div className="insert-popup__divider">or</div>
      <div className="insert-popup__section">
        <label className="insert-popup__label">From computer</label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <button
          className="toolbar-btn"
          style={{ width: '100%' }}
          onClick={() => fileRef.current?.click()}
        >
          Choose file…
        </button>
        {error && <p className="insert-popup__error">{error}</p>}
      </div>
      <button className="insert-popup__close" onClick={onClose}>✕</button>
    </div>
  );
}

/**
 * @param {{ editor: import('@tiptap/react').Editor|null, docId: number|string, username: string }} props
 */
export default function InsertTab({ editor, docId, username }) {
  const [popup, setPopup] = useState(null); // 'table' | 'image' | null

  if (!editor || !editor.state) return null;

  function closePopup() { setPopup(null); }

  function insertTable(rows, cols) {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
  }

  function insertImageUrl(src) {
    editor.chain().focus().setImage({ src }).run();
  }

  function insertImageBase64(src, name) {
    editor.chain().focus().setImage({ src, alt: name }).run();
  }

  function insertHorizontalRule() {
    editor.chain().focus().setHorizontalRule().run();
  }

  function insertCodeBlock() {
    editor.chain().focus().toggleCodeBlock().run();
  }

  return (
    <div className="toolbar-tab toolbar-insert" style={{ position: 'relative' }}>
      {/* Table */}
      <div style={{ position: 'relative' }}>
        <button
          className={`toolbar-btn${popup === 'table' ? ' toolbar-btn--active' : ''}`}
          onClick={() => setPopup(popup === 'table' ? null : 'table')}
          title="Insert table"
        >
          ⊞ Table
        </button>
        {popup === 'table' && (
          <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 100 }}>
            <TablePicker onPick={insertTable} onClose={closePopup} />
          </div>
        )}
      </div>

      {/* Image */}
      <div style={{ position: 'relative' }}>
        <button
          className={`toolbar-btn${popup === 'image' ? ' toolbar-btn--active' : ''}`}
          onClick={() => setPopup(popup === 'image' ? null : 'image')}
          title="Insert image"
        >
          🖼 Image
        </button>
        {popup === 'image' && (
          <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 100 }}>
            <ImagePickerPopup
              onInsertUrl={insertImageUrl}
              onInsertFile={insertImageBase64}
              onClose={closePopup}
            />
          </div>
        )}
      </div>

      <button className="toolbar-btn" onClick={insertHorizontalRule} title="Horizontal rule">
        — Rule
      </button>

      <button className="toolbar-btn" onClick={insertCodeBlock} title="Code block">
        {'</>'} Code
      </button>
    </div>
  );
}
