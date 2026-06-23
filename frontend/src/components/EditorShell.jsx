import { useState, useEffect, useRef } from 'react';
import { useEditor } from '@tiptap/react';
import { buildExtensions } from '../lib/tiptapExtensions.js';
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
export default function EditorShell({ docId, username, onReloadDoc, onEditorReady }) {
  const [zoom, setZoom] = useState(100);
  const [showNavigator, setShowNavigator] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [trackChanges, setTrackChanges] = useState(false);
  const [presenceUsers, setPresenceUsers] = useState([]);

  const { document: doc, loading, error, saveStatus, scheduleAutosave, saveTitle, reloadDoc } = useDocument(docId);

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const titleInputRef = useRef(null);

  const { ydoc, provider, user } = useDocumentCollab(docId, username);

  const editor = useEditor({
    extensions: buildExtensions(ydoc, provider, user),
    onUpdate: ({ editor }) => {
      scheduleAutosave(JSON.stringify(editor.getJSON()));
    },
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed || !provider || !doc) return;

    const loadFromDb = () => {
      const isEmpty = editor.isEmpty;
      if (isEmpty && doc.content) {
        try {
          editor.commands.setContent(JSON.parse(doc.content), false);
        } catch {
          editor.commands.setContent(doc.content, false);
        }
      }
    };

    provider.on('synced', loadFromDb);
    return () => provider.off('synced', loadFromDb);
  }, [editor, provider, doc]);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    editor.commands.setTrackChanges(trackChanges);
  }, [trackChanges, editor]);

  useEffect(() => {
    onReloadDoc?.(reloadDoc);
  }, [reloadDoc]);

  useEffect(() => {
    if (editor) onEditorReady?.(editor);
  }, [editor]);

  function startEditingTitle() {
    setTitleValue(doc?.title ?? 'Untitled');
    setEditingTitle(true);
    setTimeout(() => titleInputRef.current?.select(), 0);
  }

  function commitTitle() {
    const trimmed = titleValue.trim() || 'Untitled';
    saveTitle(trimmed);
    setEditingTitle(false);
  }

  function onTitleKeyDown(e) {
    if (e.key === 'Enter') commitTitle();
    if (e.key === 'Escape') setEditingTitle(false);
  }

  if (loading) {
    return <div className="editor-shell editor-shell--loading">Loading document…</div>;
  }
  if (error) {
    return <div className="editor-shell editor-shell--error">Error: {error}</div>;
  }

  return (
    <div className="editor-shell">
      <div className="editor-shell__topbar">
        {editingTitle ? (
          <input
            ref={titleInputRef}
            className="editor-shell__title-input"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={onTitleKeyDown}
          />
        ) : (
          <span
            className="editor-shell__title editor-shell__title--editable"
            onClick={startEditingTitle}
            title="Click to rename"
          >
            {doc?.title ?? 'Untitled'}
          </span>
        )}
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
            <CommentsPanel
              docId={docId}
              currentUsername={username}
              onClose={() => setShowComments(false)}
            />
          </aside>
        )}
      </div>

      <EditorStatusBar editor={editor} saveStatus={saveStatus} zoom={zoom} />
    </div>
  );
}
