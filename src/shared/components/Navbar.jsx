import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useCart } from '@/features/cart/hooks/useCart'
import './Navbar.css'

export default function Navbar() {
  const { user, displayName, role, signOut } = useAuth()
  const { items } = useCart()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0)

  // Get user initials for avatar
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSignOut = async () => {
    setDropdownOpen(false)
    await signOut()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          🍽️ Cravour
        </Link>

        <div className="navbar-links">
          <Link to="/discover" className="navbar-link" style={{ color: 'var(--color-primary)' }}>✨ Discover</Link>
          <Link to="/explore" className="navbar-link">Explore</Link>

          <Link to="/cart" className="navbar-link navbar-cart">
            🛒
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {user ? (
            <div className="navbar-user" ref={dropdownRef}>
              <button
                className="navbar-avatar-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                id="navbar-user-menu"
              >
                <span className="navbar-avatar">{initials}</span>
                <span className="navbar-username">{displayName.split(' ')[0]}</span>
                <span className={`navbar-chevron ${dropdownOpen ? 'open' : ''}`}>▾</span>
              </button>

              {dropdownOpen && (
                <div className="navbar-dropdown">
                  <div className="navbar-dropdown-header">
                    <span className="navbar-dropdown-name">{displayName}</span>
                    <span className="navbar-dropdown-email">{user.email}</span>
                  </div>
                  <div className="navbar-dropdown-divider" />
                  
                  {role === 'admin' ? (
                    <Link to="/admin/dashboard" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                      👑 Admin Dashboard
                    </Link>
                  ) : role === 'restaurant_owner' ? (
                    <Link to="/owner/dashboard" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                      🏪 Owner Dashboard
                    </Link>
                  ) : (
                    <Link to="/dashboard" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                      📊 Dashboard
                    </Link>
                  )}

                  {role === 'customer' && (
                    <Link to="/orders" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                      📦 My Orders
                    </Link>
                  )}

                  <Link to="/profile" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    👤 Profile
                  </Link>
                  <div className="navbar-dropdown-divider" />
                  <button className="navbar-dropdown-item navbar-dropdown-logout" onClick={handleSignOut}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="navbar-link navbar-btn-primary">Login</Link>
          )}
        </div>
      </div>
    </nav>
  )
}
