import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <span style={{ fontSize: '4rem' }}>🍕</span>
      <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>404 — Page Not Found</h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        Looks like this dish isn't on the menu.
      </p>
      <Link
        to="/"
        style={{
          marginTop: '0.5rem',
          background: 'var(--color-primary)',
          color: '#fff',
          padding: '0.6rem 1.5rem',
          borderRadius: 'var(--radius-full)',
          fontWeight: 600,
        }}
      >
        Back to Home
      </Link>
    </div>
  )
}
