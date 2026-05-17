import { useState, useEffect } from 'react';
import { getDocumentsByOwner } from '../services/documentService.js';
import { logout } from '../services/authService.js';
import DocumentCard from '../components/documents/DocumentCard.jsx';
import NewDocumentButton from '../components/documents/NewDocumentButton.jsx';
import { JWT_KEY } from '../lib/constants.js';

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

export default function DashboardPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const username = getCurrentUsername();

  useEffect(() => {
    if (!username) return;
    loadDocuments();
  }, [username]);

  async function loadDocuments() {
    setLoading(true);
    setError(null);
    try {
      const docs = await getDocumentsByOwner(username);
      setDocuments(docs ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-page__header">
        <div>
          <h1 className="dashboard-page__title">My Documents</h1>
          {username && <span className="dashboard-page__username">Welcome, {username}</span>}
        </div>
        <div className="dashboard-page__header-actions">
          {username && <NewDocumentButton username={username} />}
          <button className="dashboard-page__logout" onClick={logout}>
            🚪 Logout
          </button>
        </div>
      </header>

      {error && <p className="dashboard-page__error">{error}</p>}

      {loading ? (
        <div className="dashboard-page__loading">Loading documents…</div>
      ) : documents.length === 0 ? (
        <div className="dashboard-page__empty">
          <p>No documents yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="dashboard-page__grid">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} document={doc} onDeleted={loadDocuments} />
          ))}
        </div>
      )}
    </div>
  );
}
