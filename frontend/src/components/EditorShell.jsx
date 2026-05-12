import { useState, useEffect } from 'react';
import { useEditor } from '@tiptap/react';
import { tiptapExtensions } from '../lib/tiptapExtensions.js';
import { useDocumentCollab } from '../hooks/useDocumentCollab.js';
import { useDocument } from '../hooks/useDocument.js';

import EditorToolbar from './EditorToolbar.jsx';
import EditorCanvas from './EditorCanvas.jsx';
import EditorStatusBar from './EditorStatusBar.jsx';
import NavigatorPanel from './sidebar/NavigatorPanel.jsx';
import CommentsPanel from './sidebar/CommentsPanel.jsx';
import PresenceBar from './collab/PresenceBar.jsx';

/**
 * Full Word-like layout: toolbar + canvas + sidebars + statusbar.
 *
 * @param {{ docId: number|string, username: string }} props
 */
export default function EditorShell({ docId, username }) {
  const [zoom, setZoom] = useState(100);
  const [showNavigator, setShowNavigator] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [trackChanges, setTrackChanges] = useState(false);
  const [presenceUsers, setPresenceUsers] = useState([]);

  const { document: doc, loading, error, saveStatus, scheduleAutosave } = useDocument(docId);

  const editor = useEditor({
    extensions: tiptapExtensions,
    content: '',
    onUpdate: ({ editor }) => {
      scheduleAutosave(JSON.stringify(editor.getJSON()));
    },
  });

  // Populate editor once doc loads
  useEffect(() => {
    if (!doc?.content || !editor || editor.isDestroyed) return;
    try {
      editor.commands.setContent(JSON.parse(doc.content), false);
    } catch {
      editor.commands.setContent(doc.content, false);
    }
  }, [doc?.content, editor]);

  useDocumentCollab(docId, editor);

  if (loading) {
    return <div className="editor-shell editor-shell--loading">Loading document…</div>;
  }
  if (error) {
    return <div className="editor-shell editor-shell--error">Error: {error}</div>;
  }

  return (
    <div className="editor-shell">
      <div className="editor-shell__topbar">
        <span className="editor-shell__title">{doc?.title ?? 'Untitled'}</span>
        <PresenceBar users={presenceUsers} />
      </div>

      <EditorToolbar
        editor={editor}
        docId={docId}
        username={username}
        showComments={showComments}
        onToggleComments={() => setShowComments((v) => !v)}
        showNavigator={showNavigator}
        onToggleNavigator={() => setShowNavigator((v) => !v)}
        trackChanges={trackChanges}
        onToggleTrackChanges={() => setTrackChanges((v) => !v)}
        zoom={zoom}
        onZoomChange={setZoom}
      />

      <div className="editor-shell__body">
        {showNavigator && (
          <aside className="editor-shell__sidebar editor-shell__sidebar--left">
            <NavigatorPanel editor={editor} />
          </aside>
        )}

        <main className="editor-shell__main">
          <EditorCanvas editor={editor} zoom={zoom} cursors={[]} />
        </main>

        {showComments && (
          <aside className="editor-shell__sidebar editor-shell__sidebar--right">
            <CommentsPanel docId={docId} currentUsername={username} />
          </aside>
        )}
      </div>

      <EditorStatusBar editor={editor} saveStatus={saveStatus} zoom={zoom} />
    </div>
  );
}
