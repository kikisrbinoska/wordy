export const DocumentRole = /** @type {const} */ ({
  OWNER: 'OWNER',
  EDITOR: 'EDITOR',
  COMMENTER: 'COMMENTER',
  VIEWER: 'VIEWER',
});

export const SystemRole = /** @type {const} */ ({
  ADMIN: 'ROLE_ADMIN',
  USER: 'ROLE_USER',
  GUEST: 'ROLE_GUEST',
});

export const Routes = {
  LANDING: '/',
  DASHBOARD: '/dashboard',
  EDITOR: (id = ':id') => `/document/${id}`,
  LOGIN: '/login',
  REGISTER: '/register',
};

export const JWT_KEY = 'wordy_token';

export const COLLAB_DEBOUNCE_MS = 1500;
export const AUTOSAVE_DEBOUNCE_MS = 3000;
