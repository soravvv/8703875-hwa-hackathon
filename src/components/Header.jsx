import { useEffect, useRef } from 'react'

const navLinks = [
  { to: 'shop', label: 'Shop' },
  { to: 'about', label: 'About' },
  { to: 'faq', label: 'FAQ' },
  { to: 'safety', label: 'Safety' },
]

export default function Header({ cartCount, onNavigate, user }) {
  const progressRef = useRef(null)
  const accountInitials = String(user?.name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')

  useEffect(() => {
    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`
      }
    }

    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)
    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [])

  return (
    <header className="header">
      <span className="scroll-progress" aria-hidden="true">
        <span ref={progressRef} />
      </span>
      <div className="header-inner">
        <button
          className="logo"
          onClick={() => onNavigate('home')}
          aria-label="ScentQuest home"
        >
          Scent<span className="logo-accent">Quest</span>
        </button>
        <nav className="nav" aria-label="Main">
          {navLinks.map((link) => (
            <button
              key={link.to}
              className="nav-link"
              onClick={() => onNavigate(link.to)}
            >
              {link.label}
            </button>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className={`account-btn ${user ? 'is-signed-in' : ''}`}
            onClick={() => onNavigate(user ? 'dashboard' : 'sign-in')}
            aria-label={user ? `Your account, ${user.name}` : 'Sign in to your account'}
            title={user ? 'Your account' : 'Sign in'}
          >
            {user ? (
              <span className="header-avatar">{accountInitials}</span>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
              </svg>
            )}
          </button>
          <button
            className="cart-btn"
            onClick={() => onNavigate('cart')}
            aria-label={`Cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            {cartCount > 0 && (
              <span key={cartCount} className="cart-badge">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
