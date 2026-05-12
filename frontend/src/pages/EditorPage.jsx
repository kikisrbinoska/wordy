import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import EditorShell from '../components/EditorShell.jsx';
import ShareModal from '../components/documents/ShareModal.jsx';
import VersionHistory from '../components/versions/VersionHistory.jsx';
import FileAttachment from '../components/assets/FileAttachment.jsx';
import { getAssets } from '../services/assetService.js';
import { JWT_KEY, Routes } from '../lib/constants.js';

function getCurrentUsername() {
  const token = localStorage.getItem(JWT_KEY);
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub ?? payload.username ?? null;
  } catch {
    return null;
  }
}

export default function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const username = getCurrentUsername();

  const [showShare, setShowShare] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [assets, setAssets] = useState([]);

  async function loadAssets() {
    try {
      const data = await getAssets(id);
      setAssets(data ?? []);
    } catch {}
  }

  function handleVersionRestored() {
    setShowVersions(false);
    // EditorShell will re-fetch document via useDocument on next render
    window.location.reload();
  }

  return (
    <div className="editor-page">
      <div className="editor-page__nav">
        <button className="editor-page__back" onClick={() => navigate(Routes.DASHBOARD)}>
          ← Back
        </button>
        <div className="editor-page__nav-actions">
          <button onClick={() => { setShowAttachments((v) => !v); loadAssets(); }}>
            📎 Attachments
          </button>
          <button onClick={() => setShowVersions((v) => !v)}>
            🕓 History
          </button>
          <button onClick={() => setShowShare(true)}>
            🔗 Share
          </button>
        </div>
      </div>

      <EditorShell docId={id} username={username} />

      {showAttachments && (
        <div className="editor-page__panel">
          <FileAttachment
            docId={id}
            username={username}
            assets={assets}
            onChanged={loadAssets}
          />
        </div>
      )}

      {showVersions && (
        <div className="editor-page__panel">
          <VersionHistory
            docId={id}
            username={username}
            onRestored={handleVersionRestored}
          />
        </div>
      )}

      {showShare && (
        <ShareModal
          docId={id}
          ownerUsername={username}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
