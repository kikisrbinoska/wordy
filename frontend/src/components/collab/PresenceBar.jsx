/**
 * Shows avatar bubbles for all users currently viewing the document.
 *
 * @param {{ users: Array<import('../../types/index.js').User> }} props
 */
export default function PresenceBar({ users = [] }) {
  const MAX_VISIBLE = 5;
  const visible = users.slice(0, MAX_VISIBLE);
  const overflow = users.length - MAX_VISIBLE;

  function initials(user) {
    if (user.displayName) return user.displayName.slice(0, 2).toUpperCase();
    return (user.name?.[0] ?? '') + (user.surname?.[0] ?? '');
  }

  return (
    <div className="presence-bar" title={users.map((u) => u.displayName ?? u.username).join(', ')}>
      {visible.map((user) => (
        <div key={user.username} className="presence-bar__avatar" title={user.displayName ?? user.username}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.displayName ?? user.username} />
          ) : (
            <span>{initials(user)}</span>
          )}
        </div>
      ))}
      {overflow > 0 && (
        <div className="presence-bar__overflow">+{overflow}</div>
      )}
    </div>
  );
}
