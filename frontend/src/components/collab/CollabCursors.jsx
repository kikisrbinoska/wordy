/**
 * Renders colored remote-user cursor labels on top of the editor canvas.
 * Cursor positions are tracked as {username, x, y, color} objects.
 *
 * @param {{ cursors: Array<{username: string, displayName: string, x: number, y: number, color: string}> }} props
 */
export default function CollabCursors({ cursors = [] }) {
  if (!cursors.length) return null;

  return (
    <div className="collab-cursors" aria-hidden="true">
      {cursors.map((cursor) => (
        <div
          key={cursor.username}
          className="collab-cursor"
          style={{ left: cursor.x, top: cursor.y, '--cursor-color': cursor.color }}
        >
          <div className="collab-cursor__caret" />
          <span className="collab-cursor__label">{cursor.displayName ?? cursor.username}</span>
        </div>
      ))}
    </div>
  );
}
