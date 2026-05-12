import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDocument } from '../../services/documentService.js';
import { Routes } from '../../lib/constants.js';

/**
 * @param {{ username: string }} props
 */
export default function NewDocumentButton({ username }) {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    setCreating(true);
    try {
      const doc = await createDocument({
        ownerUsername: username,
        title: 'Untitled Document',
        content: '',
      });
      navigate(Routes.EDITOR(doc.id));
    } catch (err) {
      alert(`Could not create document: ${err.message}`);
    } finally {
      setCreating(false);
    }
  }

  return (
    <button className="new-document-btn" onClick={handleCreate} disabled={creating}>
      {creating ? 'Creating…' : '+ New Document'}
    </button>
  );
}
