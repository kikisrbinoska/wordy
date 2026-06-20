const LINE_SPACINGS = [
  { label: 'Single (1)',    value: '1' },
  { label: '1.15',          value: '1.15' },
  { label: '1.5',           value: '1.5' },
  { label: 'Double (2)',    value: '2' },
  { label: '2.5',           value: '2.5' },
  { label: 'Triple (3)',    value: '3' },
];

/**
 * @param {{ editor: import('@tiptap/react').Editor|null }} props
 */
export default function LayoutTab({ editor }) {
  if (!editor || !editor.state) return null;

  function indent() {
    editor.commands.focus();
    editor.commands.indent();
  }

  function outdent() {
    editor.commands.focus();
    editor.commands.outdent();
  }

  function setLineHeight(value) {
    // Select the whole current paragraph so the mark applies to the full line
    const { from, to } = editor.state.selection;
    const isEmpty = from === to;
    if (isEmpty) {
      const { $from } = editor.state.selection;
      const start = $from.start();
      const end = $from.end();
      editor.chain().focus().setTextSelection({ from: start, to: end }).setLineHeight(value).run();
    } else {
      editor.chain().focus().setLineHeight(value).run();
    }
  }

  return (
    <div className="toolbar-tab toolbar-layout">
      {/* Indent / outdent */}
      <button
        className="toolbar-btn"
        onClick={indent}
        title="Increase indent — moves the paragraph right by 40px. Works on plain paragraphs."
      >
        → Indent
      </button>
      <button
        className="toolbar-btn"
        onClick={outdent}
        title="Decrease indent — moves the paragraph left by 40px."
      >
        ← Outdent
      </button>

      <div className="toolbar-divider" />

      {/* Line spacing */}
      <label className="toolbar-label">Spacing</label>
      <select
        className="toolbar-select"
        onChange={(e) => setLineHeight(e.target.value)}
        defaultValue=""
        title="Line spacing — applies to selected text"
      >
        <option value="" disabled>Line height</option>
        {LINE_SPACINGS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      <div className="toolbar-divider" />

      {/* Page break */}
      <button
        className="toolbar-btn"
        onClick={() => editor.chain().focus().setHardBreak().run()}
        title="Insert a hard line break (Shift+Enter)"
      >
        ⏎ Line break
      </button>
    </div>
  );
}
