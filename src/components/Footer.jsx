const year = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="logo">Scent<span className="logo-accent">Quest</span></span>
          <p className="footer-tagline">Scent-driven enrichment for curious dogs.</p>
        </div>
        <div className="footer-links">
          <a href="#shop">Shop</a>
          <a href="#cart">Cart</a>
          <a href="#checkout">Checkout</a>
          <a href="#about">About</a>
          <a href="#faq">FAQ</a>
          <a href="#safety">Safety</a>
        </div>
        <div className="footer-note">
          &copy; {year} ScentQuest. Cash on delivery. Free shipping over ₹4,999.
        </div>
      </div>
    </footer>
  )
}