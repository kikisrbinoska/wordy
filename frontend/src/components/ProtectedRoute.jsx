import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Routes } from '../lib/constants.js';
import { isAuthenticated } from '../services/authService.js';

export default function ProtectedRoute() {
  const location = useLocation();
  
  if (!isAuthenticated()) {
    return <Navigate to={Routes.LANDING} state={{ from: location }} replace />;
  }
  return <Outlet />;
}
