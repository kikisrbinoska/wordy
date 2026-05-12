import { useState } from 'react';

/**
 * @param {{ onSubmit: (content: string) => void, onCancel?: () => void, placeholder?: string }} props
 */
export default function CommentInput({ onSubmit, onCancel, placeholder = 'Add a comment…' }) {
  const [value, setValue] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue('');
  }

  return (
    <form className="comment-input" onSubmit={handleSubmit}>
      <textarea
        className="comment-input__textarea"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        rows={3}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit(e);
        }}
      />
      <div className="comment-input__actions">
        {onCancel && (
          <button type="button" className="comment-input__cancel" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="comment-input__submit" disabled={!value.trim()}>
          Comment
        </button>
      </div>
    </form>
  );
}
