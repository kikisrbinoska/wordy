import { useState, useEffect } from 'react';
import { getDocumentsByOwner, getSharedDocuments } from '../services/documentService.js';
import { logout } from '../services/authService.js';
import DocumentCard from '../components/documents/DocumentCard.jsx';
import NewDocumentButton from '../components/documents/NewDocumentButton.jsx';
import { JWT_KEY } from '../lib/constants.js';
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

export default function DashboardPage() {
  const [documents, setDocuments] = useState([]);
  const [sharedDocuments, setSharedDocuments] = useState([]);
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
      const [owned, shared] = await Promise.all([
        getDocumentsByOwner(username),
        getSharedDocuments(username),
      ]);
      setDocuments(owned ?? []);
      setSharedDocuments(shared ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-page__header">
        <img src={logo} alt="Wordy" className="dashboard-page__logo" />
        <div className="dashboard-page__header-actions">
          <span className="dashboard-page__username">Welcome back, <strong>{username}</strong></span>
          {username && <NewDocumentButton username={username} />}
          <button className="dashboard-page__logout" onClick={logout}>
            Sign Out
          </button>
        </div>
      </header>

      <div className="dashboard-page__body">
        <h1 className="dashboard-page__title">My Workspace</h1>

        {error && <p className="dashboard-page__error">{error}</p>}

        {loading ? (
          <div className="dashboard-page__loading">Loading documents…</div>
        ) : (
          <>
            {documents.length === 0 && sharedDocuments.length === 0 ? (
              <div className="dashboard-page__empty">
                <div className="dashboard-page__empty-icon">✍️</div>
                <p>No documents yet.</p>
                <p className="dashboard-page__empty-sub">Create your first document to get started.</p>
              </div>
            ) : (
              <>
                {documents.length > 0 && (
                  <section className="dashboard-page__section">
                    <h2 className="dashboard-page__section-title">My Documents</h2>
                    <div className="dashboard-page__grid">
                      {documents.map((doc) => (
                        <DocumentCard key={doc.id} document={doc} onDeleted={loadDocuments} />
                      ))}
                    </div>
                  </section>
                )}
                {sharedDocuments.length > 0 && (
                  <section className="dashboard-page__section">
                    <h2 className="dashboard-page__section-title">Shared with Me</h2>
                    <div className="dashboard-page__grid">
                      {sharedDocuments.map((doc) => (
                        <DocumentCard key={doc.id} document={doc} onDeleted={loadDocuments} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
