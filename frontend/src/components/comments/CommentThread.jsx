import { useState } from 'react';
import CommentInput from './CommentInput.jsx';

/**
 * @param {{ comment: import('../../types/index.js').Comment, onReply: Function, onResolve: Function }} props
 */
export default function CommentThread({ comment, onReply, onResolve }) {
  const [showReply, setShowReply] = useState(false);

  const replies = comment.replies ?? [];

  function handleReplySubmit(content) {
    onReply(comment.id, content);
    setShowReply(false);
  }

  return (
    <div className={`comment-thread${comment.resolved ? ' comment-thread--resolved' : ''}`}>
      <div className="comment-thread__main">
        <div className="comment-thread__header">
          <span className="comment-thread__author">
            {comment.author?.displayName ?? comment.author?.username}
          </span>
          <span className="comment-thread__date">
            {new Date(comment.createdAt).toLocaleString()}
          </span>
          {!comment.resolved && (
            <button
              className="comment-thread__resolve"
              onClick={() => onResolve(comment.id)}
              title="Resolve"
            >
              ✓
            </button>
          )}
        </div>
        <p className="comment-thread__body">{comment.content}</p>
        {!comment.resolved && (
          <button className="comment-thread__reply-toggle" onClick={() => setShowReply((v) => !v)}>
            Reply
          </button>
        )}
      </div>

      {replies.length > 0 && (
        <div className="comment-thread__replies">
          {replies.map((reply) => (
            <div key={reply.id} className="comment-thread__reply">
              <span className="comment-thread__author">
                {reply.author?.displayName ?? reply.author?.username}
              </span>
              <span className="comment-thread__date">
                {new Date(reply.createdAt).toLocaleString()}
              </span>
              <p className="comment-thread__body">{reply.content}</p>
            </div>
          ))}
        </div>
      )}

      {showReply && (
        <CommentInput onSubmit={handleReplySubmit} onCancel={() => setShowReply(false)} placeholder="Write a reply…" />
      )}
    </div>
  );
}
