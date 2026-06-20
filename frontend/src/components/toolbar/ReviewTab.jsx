/**
 * @param {{
 *   editor: import('@tiptap/react').Editor|null,
 *   showComments: boolean,
 *   onToggleComments: () => void,
 *   trackChanges: boolean,
 *   onToggleTrackChanges: () => void,
 * }} props
 */
export default function ReviewTab({ editor, showComments, onToggleComments, trackChanges, onToggleTrackChanges }) {

  function acceptAll() {
    if (!editor) return;
    const { from, to } = { from: 0, to: editor.state.doc.content.size };
    editor.commands.acceptChange(from, to);
  }

  function rejectAll() {
    if (!editor) return;
    const { from, to } = { from: 0, to: editor.state.doc.content.size };
    editor.commands.rejectChange(from, to);
  }

  return (
    <div className="toolbar-tab toolbar-review">
      <button
        className={`toolbar-btn${showComments ? ' toolbar-btn--active' : ''}`}
        onClick={onToggleComments}
        title="Toggle comments panel"
      >
        💬 Comments
      </button>

      <div className="toolbar-divider" />

      <button
        className={`toolbar-btn${trackChanges ? ' toolbar-btn--active' : ''}`}
        onClick={onToggleTrackChanges}
        title="Track Changes — when ON, typed text is highlighted green, deleted text stays visible in red strikethrough"
      >
        ✏ Track Changes {trackChanges ? '(ON)' : '(OFF)'}
      </button>

      {trackChanges && (
        <>
          <div className="toolbar-divider" />
          <button
            className="toolbar-btn toolbar-btn--accept"
            onClick={acceptAll}
            title="Accept all changes — keeps inserted text, removes deleted text"
          >
            ✓ Accept All
          </button>
          <button
            className="toolbar-btn toolbar-btn--reject"
            onClick={rejectAll}
            title="Reject all changes — removes inserted text, restores deleted text"
          >
            ✕ Reject All
          </button>
        </>
      )}
    </div>
  );
}
