import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'

/**
 * Wraps routes that require authentication.
 * Redirects to /login with a "return-to" state if the user isn't logged in.
 * If allowedRoles is provided, checks if the user's role is in the array.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="protected-loading">
        <div className="protected-spinner" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // If user is a restaurant owner but trying to access customer dashboard, redirect them
    if (role === 'restaurant_owner') return <Navigate to="/owner/dashboard" replace />
    // Default redirect to customer dashboard
    return <Navigate to="/dashboard" replace />
  }

  return children
}
