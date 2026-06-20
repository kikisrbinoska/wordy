const FONT_FAMILIES = ['Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana'];
const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];
const HEADING_LEVELS = [1, 2, 3, 4, 5, 6];

const BULLET_STYLES = [
  { value: 'disc',   label: '● Filled circle' },
  { value: 'circle', label: '○ Open circle' },
  { value: 'square', label: '■ Square' },
  { value: 'arrow',  label: '→ Arrow' },
  { value: 'check',  label: '✓ Check' },
];

/**
 * @param {{ editor: import('@tiptap/react').Editor|null }} props
 */
export default function HomeTab({ editor }) {
  if (!editor || !editor.state) return null;

  function setFontFamily(family) {
    editor.chain().focus().setFontFamily(family).run();
  }

  function setFontSize(size) {
    editor.chain().focus().setFontSize(`${size}pt`).run();
  }

  function setHeading(level) {
    if (editor.isActive('heading', { level })) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().setHeading({ level }).run();
    }
  }

  return (
    <div className="toolbar-tab toolbar-home">
      {/* Font family */}
      <select
        className="toolbar-select"
        onChange={(e) => setFontFamily(e.target.value)}
        defaultValue=""
        title="Font family"
      >
        <option value="" disabled>Font</option>
        {FONT_FAMILIES.map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>

      {/* Font size */}
      <select
        className="toolbar-select toolbar-select--sm"
        onChange={(e) => setFontSize(e.target.value)}
        defaultValue=""
        title="Font size"
      >
        <option value="" disabled>Size</option>
        {FONT_SIZES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <div className="toolbar-divider" />

      {/* Headings */}
      {HEADING_LEVELS.map((level) => (
        <button
          key={level}
          className={`toolbar-btn${editor.isActive('heading', { level }) ? ' toolbar-btn--active' : ''}`}
          onClick={() => setHeading(level)}
          title={`Heading ${level}`}
        >
          H{level}
        </button>
      ))}

      <div className="toolbar-divider" />

      {/* Inline formatting */}
      <button
        className={`toolbar-btn toolbar-btn--bold${editor.isActive('bold') ? ' toolbar-btn--active' : ''}`}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold (Ctrl+B)"
      >B</button>

      <button
        className={`toolbar-btn toolbar-btn--italic${editor.isActive('italic') ? ' toolbar-btn--active' : ''}`}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic (Ctrl+I)"
      ><em>I</em></button>

      <button
        className={`toolbar-btn${editor.isActive('underline') ? ' toolbar-btn--active' : ''}`}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline (Ctrl+U)"
      ><u>U</u></button>

      <button
        className={`toolbar-btn${editor.isActive('strike') ? ' toolbar-btn--active' : ''}`}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Strikethrough"
      ><s>S</s></button>

      <div className="toolbar-divider" />

      {/* Text color */}
      <label className="toolbar-color-label" title="Text color">
        A
        <input
          type="color"
          className="toolbar-color-input"
          onMouseDown={() => editor.commands.focus()}
          onInput={(e) => editor.chain().focus().setColor(e.target.value).run()}
        />
      </label>

      {/* Highlight */}
      <label className="toolbar-color-label toolbar-color-label--highlight" title="Highlight">
        ▌
        <input
          type="color"
          className="toolbar-color-input"
          onMouseDown={() => editor.commands.focus()}
          onInput={(e) => editor.chain().focus().setHighlight({ color: e.target.value }).run()}
        />
      </label>

      <div className="toolbar-divider" />

      {/* Alignment */}
      {['left', 'center', 'right', 'justify'].map((align) => (
        <button
          key={align}
          className={`toolbar-btn${editor.isActive({ textAlign: align }) ? ' toolbar-btn--active' : ''}`}
          onClick={() => editor.chain().focus().setTextAlign(align).run()}
          title={`Align ${align}`}
        >
          {align === 'left' ? '⬅' : align === 'center' ? '↔' : align === 'right' ? '➡' : '☰'}
        </button>
      ))}

      <div className="toolbar-divider" />

      {/* Lists */}
      <select
        className="toolbar-select"
        title="Bullet list style"
        value={editor.isActive('bulletList') ? (editor.getAttributes('bulletList').listStyle || 'disc') : ''}
        onChange={(e) => {
          const style = e.target.value;
          if (!style) return;
          const chain = editor.isActive('heading')
            ? editor.chain().focus().setParagraph()
            : editor.chain().focus();
          if (editor.isActive('bulletList')) {
            chain.updateAttributes('bulletList', { listStyle: style }).run();
          } else {
            chain.toggleBulletList().updateAttributes('bulletList', { listStyle: style }).run();
          }
        }}
      >
        <option value="">• Bullet</option>
        {BULLET_STYLES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      <button
        className={`toolbar-btn${editor.isActive('orderedList') ? ' toolbar-btn--active' : ''}`}
        onClick={() => {
          if (editor.isActive('heading')) {
            editor.chain().focus().setParagraph().toggleOrderedList().run();
          } else {
            editor.chain().focus().toggleOrderedList().run();
          }
        }}
        title="Numbered list"
      >1. List</button>

      <div className="toolbar-divider" />

      {/* Clear formatting */}
      <button
        className="toolbar-btn"
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        title="Clear formatting"
      >Tx</button>
    </div>
  );
}
