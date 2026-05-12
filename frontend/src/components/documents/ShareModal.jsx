import { useState, useEffect } from 'react';
import {
  getCollaborators,
  inviteCollaborator,
  changeCollaboratorRole,
  removeCollaborator,
} from '../../services/documentService.js';
import { DocumentRole } from '../../lib/constants.js';

const ROLES = Object.values(DocumentRole);

/**
 * @param {{ docId: number|string, ownerUsername: string, onClose: () => void }} props
 */
export default function ShareModal({ docId, ownerUsername, onClose }) {
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invitee, setInvitee] = useState('');
  const [inviteRole, setInviteRole] = useState(DocumentRole.EDITOR);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadCollaborators();
  }, [docId]);

  async function loadCollaborators() {
    setLoading(true);
    try {
      const data = await getCollaborators(docId);
      setCollaborators(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(e) {
    e.preventDefault();
    if (!invitee.trim()) return;
    setInviting(true);
    setError(null);
    try {
      await inviteCollaborator(docId, ownerUsername, {
        inviteeUsername: invitee.trim(),
        role: inviteRole,
      });
      setInvitee('');
      await loadCollaborators();
    } catch (err) {
      setError(err.message);
    } finally {
      setInviting(false);
    }
  }

  async function handleRoleChange(targetUsername, role) {
    try {
      await changeCollaboratorRole(docId, ownerUsername, { targetUsername, role });
      await loadCollaborators();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemove(targetUsername) {
    if (!window.confirm(`Remove ${targetUsername} from this document?`)) return;
    try {
      await removeCollaborator(docId, ownerUsername, targetUsername);
      await loadCollaborators();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal__header">
          <h2>Share Document</h2>
          <button className="share-modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {error && <p className="share-modal__error">{error}</p>}

        <form className="share-modal__invite" onSubmit={handleInvite}>
          <input
            value={invitee}
            onChange={(e) => setInvitee(e.target.value)}
            placeholder="Username to invite"
            className="share-modal__input"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="share-modal__role-select"
          >
            {ROLES.filter((r) => r !== DocumentRole.OWNER).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <button type="submit" disabled={inviting || !invitee.trim()}>
            {inviting ? 'Inviting…' : 'Invite'}
          </button>
        </form>

        {loading ? (
          <p>Loading collaborators…</p>
        ) : (
          <ul className="share-modal__list">
            {collaborators.map((perm) => (
              <li key={perm.id} className="share-modal__item">
                <span className="share-modal__username">
                  {perm.user?.displayName ?? perm.user?.username}
                </span>
                {perm.role === DocumentRole.OWNER ? (
                  <span className="share-modal__owner-badge">Owner</span>
                ) : (
                  <>
                    <select
                      value={perm.role}
                      onChange={(e) => handleRoleChange(perm.user.username, e.target.value)}
                      className="share-modal__role-select"
                    >
                      {ROLES.filter((r) => r !== DocumentRole.OWNER).map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <button
                      className="share-modal__remove"
                      onClick={() => handleRemove(perm.user.username)}
                    >
                      Remove
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
