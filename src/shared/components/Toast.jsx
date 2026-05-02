import { createContext, useContext, useState, useCallback, useRef } from 'react'
import './Toast.css'

const ToastContext = createContext(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const show = useCallback((message, { type = 'info', duration = 3000 } = {}) => {
    const id = ++idRef.current
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const success = useCallback((msg, opts) => show(msg, { ...opts, type: 'success' }), [show])
  const error = useCallback((msg, opts) => show(msg, { ...opts, type: 'error' }), [show])
  const info = useCallback((msg, opts) => show(msg, { ...opts, type: 'info' }), [show])

  return (
    <ToastContext.Provider value={{ show, success, error, info }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`}>
            <span className="toast__icon">
              {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
            </span>
            <span className="toast__message">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
