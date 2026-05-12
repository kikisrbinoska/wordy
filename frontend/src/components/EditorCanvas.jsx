import { EditorContent } from '@tiptap/react';
import CollabCursors from './collab/CollabCursors.jsx';

/**
 * @param {{ editor: import('@tiptap/react').Editor|null, zoom: number, cursors: Array }} props
 */
export default function EditorCanvas({ editor, zoom, cursors = [] }) {
  return (
    <div className="editor-canvas-wrapper">
      <div
        className="editor-canvas"
        style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
      >
        <EditorContent editor={editor} className="editor-canvas__content" />
        <CollabCursors cursors={cursors} />
      </div>
    </div>
  );
}
