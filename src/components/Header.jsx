const navLinks = [
  { to: 'shop', label: 'Shop' },
  { to: 'about', label: 'About' },
  { to: 'faq', label: 'FAQ' },
  { to: 'safety', label: 'Safety' },
]

export default function Header({ cartCount, onCartClick }) {
  return (
    <header className="header">
      <div className="header-inner">
        <a href="/" className="logo" onClick={(e) => { e.preventDefault(); window.location.hash = ''; }}>
          Scent<span className="logo-accent">Quest</span>
        </a>
        <nav className="nav">
          {navLinks.map((link) => (
            <a
              key={link.to}
              href={`#${link.to}`}
              className="nav-link"
              onClick={(e) => { e.preventDefault(); window.location.hash = link.to }}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <button className="cart-btn" onClick={onCartClick} aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
          </div>
        </div>
      </header>
    )
  }