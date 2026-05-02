import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect to the page user was trying to access, or home
  const redirectTo = location.state?.from || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await signIn({ email, password })
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      navigate(redirectTo)
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
        Welcome back
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
        Sign in to your Cravour account
      </p>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid var(--color-error)',
          color: 'var(--color-error)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1rem',
          fontSize: '0.875rem',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          id="login-email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          id="login-password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />
        <button
          id="login-submit"
          type="submit"
          disabled={loading}
          style={btnStyle}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign up</Link>
      </p>
    </div>
  )
}

const inputStyle = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: '0.75rem 1rem',
  color: 'var(--color-text)',
  fontSize: '0.95rem',
  outline: 'none',
}

const btnStyle = {
  background: 'var(--color-primary)',
  color: '#fff',
  padding: '0.75rem',
  borderRadius: 'var(--radius-md)',
  fontWeight: 600,
  fontSize: '1rem',
  cursor: 'pointer',
  border: 'none',
  transition: 'background 0.2s',
}
