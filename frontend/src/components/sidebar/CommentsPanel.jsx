import { useState, useEffect } from 'react';
import CommentThread from '../comments/CommentThread.jsx';
import CommentInput from '../comments/CommentInput.jsx';
import { apiFetch } from '../../lib/api.js';

/**
 * @param {{ docId: number|string, currentUsername: string }} props
 */
export default function CommentsPanel({ docId, currentUsername }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!docId) return;
    loadComments();
  }, [docId]);

  async function loadComments() {
    setLoading(true);
    try {
      const data = await apiFetch(`/api/documents/${docId}/comments`);
      setComments(data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(content) {
    try {
      await apiFetch(`/api/documents/${docId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, authorUsername: currentUsername }),
      });
      await loadComments();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleReply(parentId, content) {
    try {
      await apiFetch(`/api/documents/${docId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, authorUsername: currentUsername, parentCommentId: parentId }),
      });
      await loadComments();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleResolve(commentId) {
    try {
      await apiFetch(`/api/documents/${docId}/comments/${commentId}/resolve`, {
        method: 'PATCH',
      });
      await loadComments();
    } catch (err) {
      setError(err.message);
    }
  }

  const topLevel = comments.filter((c) => !c.parentComment);

  return (
    <div className="comments-panel">
      <h3 className="comments-panel__title">Comments</h3>
      {error && <p className="comments-panel__error">{error}</p>}

      <CommentInput onSubmit={handleAdd} placeholder="Add a comment to this document…" />

      {loading ? (
        <p className="comments-panel__loading">Loading comments…</p>
      ) : topLevel.length === 0 ? (
        <p className="comments-panel__empty">No comments yet.</p>
      ) : (
        <div className="comments-panel__list">
          {topLevel.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={{
                ...comment,
                replies: comments.filter((c) => c.parentComment?.id === comment.id),
              }}
              onReply={handleReply}
              onResolve={handleResolve}
            />
          ))}
        </div>
      )}
    </div>
  );
}
