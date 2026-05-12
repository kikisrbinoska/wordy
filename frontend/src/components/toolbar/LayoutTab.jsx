/**
 * @param {{ editor: import('@tiptap/react').Editor|null }} props
 */
export default function LayoutTab({ editor }) {
  if (!editor) return null;

  const { chain } = editor;

  function setLineHeight(value) {
    // Tiptap doesn't ship a line-height extension; apply via textStyle.
    chain().focus().setMark('textStyle', { lineHeight: value }).run();
  }

  return (
    <div className="toolbar-tab toolbar-layout">
      {/* Indent / outdent */}
      <button
        className="toolbar-btn"
        onClick={() => chain().focus().sinkListItem('listItem').run()}
        title="Increase indent"
      >
        → Indent
      </button>
      <button
        className="toolbar-btn"
        onClick={() => chain().focus().liftListItem('listItem').run()}
        title="Decrease indent"
      >
        ← Outdent
      </button>

      <div className="toolbar-divider" />

      {/* Line spacing */}
      <label className="toolbar-label">Spacing</label>
      <select
        className="toolbar-select toolbar-select--sm"
        onChange={(e) => setLineHeight(e.target.value)}
        defaultValue="1.5"
        title="Line spacing"
      >
        {['1', '1.15', '1.5', '2', '2.5', '3'].map((v) => (
          <option key={v} value={v}>{v}</option>
        ))}
      </select>

      <div className="toolbar-divider" />

      {/* Page break */}
      <button
        className="toolbar-btn"
        onClick={() => chain().focus().setHardBreak().run()}
        title="Insert page break"
      >
        ⏎ Page break
      </button>
    </div>
  );
}
