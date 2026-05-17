import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import EditorShell from '../components/EditorShell.jsx';
import ShareModal from '../components/documents/ShareModal.jsx';
import VersionHistory from '../components/versions/VersionHistory.jsx';
import FileAttachment from '../components/assets/FileAttachment.jsx';
import { getAssets } from '../services/assetService.js';
import { exportDocumentAsPdf, exportDocumentAsDocx, getDocumentById } from '../services/documentService.js';
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
  const [docTitle, setDocTitle] = useState('');
  const [exporting, setExporting] = useState(false);

  async function loadAssets() {
    try {
      const data = await getAssets(id);
      setAssets(data ?? []);
    } catch {}
  }

  async function loadDocumentTitle() {
    try {
      const doc = await getDocumentById(id);
      if (doc?.title) {
        setDocTitle(doc.title);
      }
    } catch {}
  }

  async function handleExportPdf() {
    setExporting(true);
    try {
      await exportDocumentAsPdf(id, docTitle);
    } catch (err) {
      alert('Failed to export as PDF: ' + err.message);
    } finally {
      setExporting(false);
    }
  }

  async function handleExportDocx() {
    setExporting(true);
    try {
      await exportDocumentAsDocx(id, docTitle);
    } catch (err) {
      alert('Failed to export as DOCX: ' + err.message);
    } finally {
      setExporting(false);
    }
  }

  function handleVersionRestored() {
    setShowVersions(false);
    // EditorShell will re-fetch document via useDocument on next render
    window.location.reload();
  }

  // Load document title on mount
  useEffect(() => {
    loadDocumentTitle();
  }, [id]);

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
          <div className="editor-page__export-group">
            <button onClick={handleExportPdf} disabled={exporting} title="Export as PDF">
              📄 PDF
            </button>
            <button onClick={handleExportDocx} disabled={exporting} title="Export as DOCX">
              📝 DOCX
            </button>
          </div>
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
