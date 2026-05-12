/**
 * @param {{
 *   showComments: boolean,
 *   onToggleComments: () => void,
 *   trackChanges: boolean,
 *   onToggleTrackChanges: () => void,
 * }} props
 */
export default function ReviewTab({ showComments, onToggleComments, trackChanges, onToggleTrackChanges }) {
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
        title="Track changes"
      >
        ✏ Track Changes
      </button>
    </div>
  );
}
