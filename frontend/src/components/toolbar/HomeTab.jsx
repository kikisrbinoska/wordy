const FONT_FAMILIES = ['Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana'];
const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];
const HEADING_LEVELS = [1, 2, 3, 4, 5, 6];

/**
 * @param {{ editor: import('@tiptap/react').Editor|null }} props
 */
export default function HomeTab({ editor }) {
  if (!editor) return null;

  const { chain, isActive } = editor;

  function setFontFamily(family) {
    chain().focus().setFontFamily(family).run();
  }

  function setFontSize(size) {
    chain().focus().setMark('textStyle', { fontSize: `${size}pt` }).run();
  }

  function setHeading(level) {
    if (isActive('heading', { level })) {
      chain().focus().setParagraph().run();
    } else {
      chain().focus().setHeading({ level }).run();
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
          className={`toolbar-btn${isActive('heading', { level }) ? ' toolbar-btn--active' : ''}`}
          onClick={() => setHeading(level)}
          title={`Heading ${level}`}
        >
          H{level}
        </button>
      ))}

      <div className="toolbar-divider" />

      {/* Inline formatting */}
      <button
        className={`toolbar-btn toolbar-btn--bold${isActive('bold') ? ' toolbar-btn--active' : ''}`}
        onClick={() => chain().focus().toggleBold().run()}
        title="Bold (Ctrl+B)"
      >B</button>

      <button
        className={`toolbar-btn toolbar-btn--italic${isActive('italic') ? ' toolbar-btn--active' : ''}`}
        onClick={() => chain().focus().toggleItalic().run()}
        title="Italic (Ctrl+I)"
      ><em>I</em></button>

      <button
        className={`toolbar-btn${isActive('underline') ? ' toolbar-btn--active' : ''}`}
        onClick={() => chain().focus().toggleUnderline().run()}
        title="Underline (Ctrl+U)"
      ><u>U</u></button>

      <button
        className={`toolbar-btn${isActive('strike') ? ' toolbar-btn--active' : ''}`}
        onClick={() => chain().focus().toggleStrike().run()}
        title="Strikethrough"
      ><s>S</s></button>

      <div className="toolbar-divider" />

      {/* Text color */}
      <label className="toolbar-color-label" title="Text color">
        A
        <input
          type="color"
          className="toolbar-color-input"
          onChange={(e) => chain().focus().setColor(e.target.value).run()}
        />
      </label>

      {/* Highlight */}
      <label className="toolbar-color-label toolbar-color-label--highlight" title="Highlight">
        ▌
        <input
          type="color"
          className="toolbar-color-input"
          onChange={(e) => chain().focus().setHighlight({ color: e.target.value }).run()}
        />
      </label>

      <div className="toolbar-divider" />

      {/* Alignment */}
      {['left', 'center', 'right', 'justify'].map((align) => (
        <button
          key={align}
          className={`toolbar-btn${isActive({ textAlign: align }) ? ' toolbar-btn--active' : ''}`}
          onClick={() => chain().focus().setTextAlign(align).run()}
          title={`Align ${align}`}
        >
          {align === 'left' ? '⬅' : align === 'center' ? '↔' : align === 'right' ? '➡' : '☰'}
        </button>
      ))}

      <div className="toolbar-divider" />

      {/* Lists */}
      <button
        className={`toolbar-btn${isActive('bulletList') ? ' toolbar-btn--active' : ''}`}
        onClick={() => chain().focus().toggleBulletList().run()}
        title="Bullet list"
      >• List</button>

      <button
        className={`toolbar-btn${isActive('orderedList') ? ' toolbar-btn--active' : ''}`}
        onClick={() => chain().focus().toggleOrderedList().run()}
        title="Numbered list"
      >1. List</button>

      <div className="toolbar-divider" />

      {/* Clear formatting */}
      <button
        className="toolbar-btn"
        onClick={() => chain().focus().clearNodes().unsetAllMarks().run()}
        title="Clear formatting"
      >Tx</button>
    </div>
  );
}
