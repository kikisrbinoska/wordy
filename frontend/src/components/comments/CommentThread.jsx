import { useState } from 'react';
import CommentInput from './CommentInput.jsx';

/**
 * @param {{ comment: object, currentUsername: string, onReply: Function, onResolve: Function, onDelete: Function }} props
 */
export default function CommentThread({ comment, currentUsername, onReply, onResolve, onDelete }) {
  const [showReply, setShowReply] = useState(false);

  const replies = comment.replies ?? [];
  const authorName = comment.author?.displayName ?? comment.author?.username ?? 'Unknown';
  const isOwn = comment.author?.username === currentUsername;

  function handleReplySubmit(content) {
    onReply(comment.id, content);
    setShowReply(false);
  }

  return (
    <div className={`comment-thread${comment.resolved ? ' comment-thread--resolved' : ''}`}>
      <div className="comment-thread__header">
        <span className="comment-thread__author">{authorName}</span>
        <span className="comment-thread__date">
          {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
        </span>
        <div className="comment-thread__actions">
          {!comment.resolved && (
            <button
              className="comment-thread__resolve"
              onClick={() => onResolve(comment.id)}
              title="Mark as resolved"
            >✓</button>
          )}
          {isOwn && (
            <button
              className="comment-thread__delete"
              onClick={() => onDelete(comment.id)}
              title="Delete comment"
            >✕</button>
          )}
        </div>
      </div>

      <p className="comment-thread__body">{comment.content}</p>

      {!comment.resolved && (
        <button className="comment-thread__reply-toggle" onClick={() => setShowReply((v) => !v)}>
          {showReply ? 'Cancel' : 'Reply'}
        </button>
      )}

      {replies.length > 0 && (
        <div className="comment-thread__replies">
          {replies.map((reply) => (
            <div key={reply.id} className="comment-thread__reply">
              <div className="comment-thread__header">
                <span className="comment-thread__author">
                  {reply.author?.displayName ?? reply.author?.username ?? 'Unknown'}
                </span>
                <span className="comment-thread__date">
                  {reply.createdAt ? new Date(reply.createdAt).toLocaleString() : ''}
                </span>
                {reply.author?.username === currentUsername && (
                  <button
                    className="comment-thread__delete"
                    onClick={() => onDelete(reply.id)}
                    title="Delete reply"
                  >✕</button>
                )}
              </div>
              <p className="comment-thread__body">{reply.content}</p>
            </div>
          ))}
        </div>
      )}

      {showReply && (
        <CommentInput
          onSubmit={handleReplySubmit}
          onCancel={() => setShowReply(false)}
          placeholder="Write a reply…"
        />
      )}
    </div>
  );
}
