import { Navigate, Outlet } from 'react-router-dom';
import { JWT_KEY, Routes } from '../lib/constants.js';

export default function ProtectedRoute() {
  const token = localStorage.getItem(JWT_KEY);
  if (!token) {
    // /login is owned by the auth team — show a placeholder until it exists.
    // Once auth is wired up, replace this with: return <Navigate to={Routes.LOGIN} replace />;
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 12, fontFamily: 'Arial, sans-serif', color: '#444' }}>
        <h2>Wordy</h2>
        <p>No session found. Please log in.</p>
        <p style={{ fontSize: 12, color: '#aaa' }}>Set <code>wordy_token</code> in localStorage to continue.</p>
      </div>
    );
  }
  return <Outlet />;
}
