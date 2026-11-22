const year = new Date().getFullYear()

const shopLinks = [
  { to: 'shop', label: 'Shop' },
  { to: 'cart', label: 'Cart' },
  { to: 'checkout', label: 'Checkout' },
]

const companyLinks = [
  { to: 'about', label: 'About' },
  { to: 'faq', label: 'FAQ' },
  { to: 'safety', label: 'Safety' },
]

export default function Footer({ navigate, user }) {
  const accountLinks = user
    ? [
        { to: 'dashboard', label: 'My account' },
        { to: 'orders', label: 'My orders' },
        { to: 'shop', label: 'Shop again' },
      ]
    : [
        { to: 'sign-in', label: 'Sign in' },
        { to: 'signup', label: 'Create account' },
      ]

  return (
    <footer className="footer">
      <div className="section-inner footer-inner">
        <div className="footer-brand">
          <span className="logo">Scent<span className="logo-accent">Quest</span></span>
          <p className="footer-tagline">Scent-driven enrichment for curious dogs.</p>
          <ul className="footer-perks">
            <li>Free delivery over ₹4,999</li>
            <li>Cash on delivery</li>
            <li>Food-grade materials</li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Shop</h4>
          <ul>
            {shopLinks.map((l) => (
              <li key={l.to}>
                <button className="link-btn" onClick={() => navigate(l.to)}>
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="footer-col">
          <h4>Help</h4>
          <ul>
            {companyLinks.map((l) => (
              <li key={l.to}>
                <button className="link-btn" onClick={() => navigate(l.to)}>
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="footer-col">
          <h4>Account</h4>
          <ul>
            {accountLinks.map((l) => (
              <li key={l.to}>
                <button className="link-btn" onClick={() => navigate(l.to)}>
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <ul>
            <li><a href="mailto:hello@scentquest.example">hello@scentquest.example</a></li>
            <li>Dispatch in 2 working days</li>
            <li>India-wide delivery</li>
          </ul>
        </div>
      </div>
      <div className="footer-bar">
        <div className="section-inner footer-bar-inner">
          <span>&copy; {year} ScentQuest</span>
          <span>Built for dogs with a nose</span>
        </div>
      </div>
    </footer>
  )
}
