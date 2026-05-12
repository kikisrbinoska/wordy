/**
 * @param {{ editor: import('@tiptap/react').Editor|null, saveStatus: string, zoom: number }} props
 */
export default function EditorStatusBar({ editor, saveStatus, zoom }) {
  const words = editor?.storage?.characterCount?.words?.() ?? 0;
  const chars = editor?.storage?.characterCount?.characters?.() ?? 0;

  const statusLabel = {
    saved: '✓ Saved',
    saving: '↻ Saving…',
    unsaved: '● Unsaved',
    error: '⚠ Save failed',
  }[saveStatus] ?? saveStatus;

  const statusClass = {
    saved: 'statusbar__save--saved',
    saving: 'statusbar__save--saving',
    unsaved: 'statusbar__save--unsaved',
    error: 'statusbar__save--error',
  }[saveStatus] ?? '';

  return (
    <div className="editor-statusbar">
      <span className="statusbar__words">{words} words</span>
      <span className="statusbar__chars">{chars} characters</span>
      <span className="statusbar__divider">·</span>
      <span className={`statusbar__save ${statusClass}`}>{statusLabel}</span>
      <span className="statusbar__divider">·</span>
      <span className="statusbar__zoom">{zoom}%</span>
    </div>
  );
}
