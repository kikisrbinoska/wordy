import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import EditorShell from '../components/EditorShell.jsx';
import ShareModal from '../components/documents/ShareModal.jsx';
import VersionHistory from '../components/versions/VersionHistory.jsx';
import FileAttachment from '../components/assets/FileAttachment.jsx';
import { getAssets } from '../services/assetService.js';
import { getDocumentById } from '../services/documentService.js';
import { exportToDocx } from '../lib/exportDocx.js';
import { JWT_KEY, Routes } from '../lib/constants.js';
import logo from '../components/assets/logo_wordy.png';

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
  const reloadDocRef = useRef(null);
  const editorRef = useRef(null);

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
    const contentEl = document.querySelector('.editor-canvas__content');
    if (!contentEl) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(contentEl, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const printW = pageW - margin * 2;
      const printH = (canvas.height * printW) / canvas.width;

      let yOffset = 0;
      let remainingH = printH;

      while (remainingH > 0) {
        const sliceH = Math.min(remainingH, pageH - margin * 2);
        const srcY = (yOffset / printH) * canvas.height;
        const srcH = (sliceH / printH) * canvas.height;

        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = srcH;
        sliceCanvas.getContext('2d').drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);

        if (yOffset > 0) pdf.addPage();
        pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', margin, margin, printW, sliceH);

        yOffset += sliceH;
        remainingH -= sliceH;
      }

      pdf.save(`${docTitle || 'document'}.pdf`);
    } catch (err) {
      alert('Failed to export as PDF: ' + err.message);
    } finally {
      setExporting(false);
    }
  }

  async function handleExportDocx() {
    if (!editorRef.current) return;
    setExporting(true);
    try {
      const json = editorRef.current.getJSON();
      await exportToDocx(json, docTitle || 'document');
    } catch (err) {
      alert('Failed to export as DOCX: ' + err.message);
    } finally {
      setExporting(false);
    }
  }

  function handleVersionRestored() {
    setShowVersions(false);
    reloadDocRef.current?.();
  }

  // Load document title on mount
  useEffect(() => {
    loadDocumentTitle();
  }, [id]);

  return (
    <div className="editor-page">
      <div className="editor-page__nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src={logo} alt="Wordy" className="editor-page__nav-logo" onClick={() => navigate(Routes.DASHBOARD)} style={{ cursor: 'pointer' }} />
          <button className="editor-page__back" onClick={() => navigate(Routes.DASHBOARD)}>
            ← Dashboard
          </button>
        </div>
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

      <EditorShell
        docId={id}
        username={username}
        onReloadDoc={(fn) => { reloadDocRef.current = fn; }}
        onEditorReady={(ed) => { editorRef.current = ed; }}
      />

      {showAttachments && (
        <div className="editor-page__panel">
          <FileAttachment
            docId={id}
            username={username}
            assets={assets}
            onChanged={loadAssets}
            onClose={() => setShowAttachments(false)}
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
