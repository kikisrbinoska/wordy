import { useState } from 'react';
import HomeTab from './toolbar/HomeTab.jsx';
import InsertTab from './toolbar/InsertTab.jsx';
import LayoutTab from './toolbar/LayoutTab.jsx';
import ReviewTab from './toolbar/ReviewTab.jsx';
import ViewTab from './toolbar/ViewTab.jsx';

const TABS = ['Home', 'Insert', 'Layout', 'Review', 'View'];

/**
 * @param {{
 *   editor: import('@tiptap/react').Editor|null,
 *   docId: number|string,
 *   username: string,
 *   showComments: boolean,
 *   onToggleComments: () => void,
 *   showNavigator: boolean,
 *   onToggleNavigator: () => void,
 *   trackChanges: boolean,
 *   onToggleTrackChanges: () => void,
 *   zoom: number,
 *   onZoomChange: (z: number) => void,
 * }} props
 */
export default function EditorToolbar({
  editor,
  docId,
  username,
  showComments,
  onToggleComments,
  showNavigator,
  onToggleNavigator,
  trackChanges,
  onToggleTrackChanges,
  zoom,
  onZoomChange,
}) {
  const [activeTab, setActiveTab] = useState('Home');

  return (
    <div className="editor-toolbar">
      <div className="editor-toolbar__tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`editor-toolbar__tab${activeTab === tab ? ' editor-toolbar__tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="editor-toolbar__ribbon">
        {activeTab === 'Home' && <HomeTab editor={editor} />}
        {activeTab === 'Insert' && <InsertTab editor={editor} docId={docId} username={username} />}
        {activeTab === 'Layout' && <LayoutTab editor={editor} />}
        {activeTab === 'Review' && (
          <ReviewTab
            showComments={showComments}
            onToggleComments={onToggleComments}
            trackChanges={trackChanges}
            onToggleTrackChanges={onToggleTrackChanges}
          />
        )}
        {activeTab === 'View' && (
          <ViewTab
            zoom={zoom}
            onZoomChange={onZoomChange}
            showNavigator={showNavigator}
            onToggleNavigator={onToggleNavigator}
            showComments={showComments}
            onToggleComments={onToggleComments}
          />
        )}
      </div>
    </div>
  );
}
