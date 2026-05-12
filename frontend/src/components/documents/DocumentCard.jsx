import { useNavigate } from 'react-router-dom';
import { Routes } from '../../lib/constants.js';
import { deleteDocument } from '../../services/documentService.js';

/**
 * @param {{ document: import('../../types/index.js').Document, onDeleted: () => void }} props
 */
export default function DocumentCard({ document, onDeleted }) {
  const navigate = useNavigate();

  async function handleDelete(e) {
    e.stopPropagation();
    if (!window.confirm(`Delete "${document.title}"?`)) return;
    try {
      await deleteDocument(document.id);
      onDeleted?.();
    } catch (err) {
      alert(`Could not delete document: ${err.message}`);
    }
  }

  return (
    <div
      className="document-card"
      onClick={() => navigate(Routes.EDITOR(document.id))}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(Routes.EDITOR(document.id))}
    >
      <div className="document-card__icon">📄</div>
      <div className="document-card__body">
        <h3 className="document-card__title">{document.title || 'Untitled'}</h3>
        <p className="document-card__meta">
          {document.owner?.displayName ?? document.owner?.username}
          {' · '}
          {new Date(document.updatedAt ?? document.createdAt).toLocaleDateString()}
        </p>
      </div>
      <button
        className="document-card__delete"
        onClick={handleDelete}
        title="Delete document"
        aria-label="Delete document"
      >
        🗑
      </button>
    </div>
  );
}
