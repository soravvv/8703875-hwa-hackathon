export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="logo">Scent<span className="logo-accent">Quest</span></span>
          <p className="footer-tagline">Scent-driven enrichment for curious dogs.</p>
        </div>
        <div className="footer-links">
          <a href="/">Shop</a>
          <a href="/cart">Cart</a>
          <a href="/checkout">Checkout</a>
        </div>
        <div className="footer-note">
          &copy; {new Date().getFullYear()} ScentQuest. Demo store.
        </div>
      </div>
    </footer>
  )
}