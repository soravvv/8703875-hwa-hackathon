import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import ProductPage from './components/ProductPage.jsx'
import CheckoutForm from './components/CheckoutForm.jsx'
import {
  DashboardPage,
  OrderDetailsPage,
  OrdersPage,
  SignInPage,
  SignUpPage,
} from './components/AccountPages.jsx'
import { AboutPage, FaqPage, SafetyPage } from './components/InfoPages.jsx'
import { formatPrice } from './lib/format.js'
import {
  clearUserSession,
  getUserOrders,
  loadUserSession,
  saveUserOrder,
  saveUserSession,
} from './lib/account.js'

const FREE_DELIVERY_THRESHOLD = 4999
const DELIVERY_FEE = 199

const products = [
  {
    id: 'snuffle-mat',
    name: 'Snuffle Snack Mat',
    basePrice: 1299,
    desc: 'Hide treats in the fleece folds for nose-work fun.',
    images: [
      '/images/scentquest-2-lifestyle-beagle.png',
      '/images/scentquest-3-inside-cutaway.png',
      '/images/scentquest-5-scent-capsules.png',
    ],
    sizes: [
      { label: 'Small', priceMod: 0 },
      { label: 'Medium', priceMod: 300 },
      { label: 'Large', priceMod: 600 },
    ],
    colors: [
      { label: 'Forest', value: 'forest', hex: '#2d6a4f' },
      { label: 'Slate', value: 'slate', hex: '#6b7280' },
      { label: 'Sand', value: 'sand', hex: '#e7d6c6' },
    ],
    scents: [
      { label: 'Unscented', priceMod: 0 },
      { label: 'Bacon', priceMod: 99 },
      { label: 'Peanut Butter', priceMod: 99 },
    ],
    addOns: [
      { id: 'extra-treat', label: 'Extra treat pouch', price: 149 },
      { id: 'gift-wrap', label: 'Gift wrap', price: 199 },
      { id: 'guide', label: 'Scent training guide', price: 249 },
    ],
  },
  {
    id: 'scent-puzzle',
    name: 'Scent Puzzle Box',
    basePrice: 1899,
    desc: 'Slide covers to reveal hidden scented compartments.',
    images: [
      '/images/scentquest-3-inside-cutaway.png',
      '/images/scentquest-4-colours.png',
      '/images/scentquest-2-lifestyle-beagle.png',
    ],
    sizes: [
      { label: 'One size', priceMod: 0 },
    ],
    colors: [
      { label: 'Forest', value: 'forest', hex: '#2d6a4f' },
      { label: 'Slate', value: 'slate', hex: '#6b7280' },
    ],
    scents: [
      { label: 'Unscented', priceMod: 0 },
      { label: 'Bacon', priceMod: 99 },
    ],
    addOns: [
      { id: 'extra-treat', label: 'Extra treat pouch', price: 149 },
      { id: 'guide', label: 'Scent training guide', price: 249 },
    ],
  },
  {
    id: 'trail-kit',
    name: 'Backyard Trail Kit',
    basePrice: 2999,
    desc: 'Scent markers to lay a tracking trail outdoors.',
    images: [
      '/images/scentquest-4-colours.png',
      '/images/scentquest-5-scent-capsules.png',
      '/images/scentquest-6-app-screen.png',
    ],
    sizes: [
      { label: 'Starter', priceMod: 0 },
      { label: 'Full', priceMod: 1200 },
    ],
    colors: [
      { label: 'Forest', value: 'forest', hex: '#2d6a4f' },
      { label: 'Sand', value: 'sand', hex: '#e7d6c6' },
    ],
    scents: [
      { label: 'Unscented', priceMod: 0 },
      { label: 'Peanut Butter', priceMod: 99 },
    ],
    addOns: [
      { id: 'gift-wrap', label: 'Gift wrap', price: 199 },
      { id: 'guide', label: 'Scent training guide', price: 249 },
    ],
  },
]

const steps = [
  { num: '01', title: 'Hide a scent', text: 'Tuck a treat or scent capsule into any ScentQuest toy.' },
  { num: '02', title: 'Let them sniff', text: 'Your dog uses their nose to track it down — mental exercise that tires them out.' },
  { num: '03', title: 'Reward the find', text: 'They get the treat and a confidence boost every time they solve it.' },
  { num: '04', title: 'Repeat & level up', text: 'Move to harder puzzles as their scenting skills grow.' },
]

const reviews = [
  { name: 'Maya & Luna', initials: 'ML', stars: 5, text: 'Luna is calmer after her scent sessions. Best purchase this year.' },
  { name: 'Carlos & Rex', initials: 'CR', stars: 5, text: 'The trail kit turned our backyard into a sniffing adventure.' },
  { name: 'Priya & Milo', initials: 'PM', stars: 5, text: 'Milo loves the puzzle box. Finally something that keeps him busy.' },
]

const PAGE_TITLES = {
  home: 'ScentQuest — Scent-led play for curious dogs',
  shop: 'Shop scent toys — ScentQuest',
  product: 'Product — ScentQuest',
  cart: 'Your cart — ScentQuest',
  checkout: 'Checkout — ScentQuest',
  'order-confirmed': 'Order confirmed — ScentQuest',
  'sign-in': 'Sign in — ScentQuest',
  signup: 'Create your account — ScentQuest',
  dashboard: 'Your dashboard — ScentQuest',
  orders: 'My orders — ScentQuest',
  'order-details': 'Order details — ScentQuest',
  faq: 'FAQ — ScentQuest',
  safety: 'Safety guide — ScentQuest',
  about: 'About ScentQuest',
  'not-found': 'Page not found — ScentQuest',
}

function routeFromHash(hash) {
  const h = String(hash || '').replace(/^#/, '')
  if (h.startsWith('order-details-')) return 'order-details'
  if (h.startsWith('product-')) return 'product'
  if (h === 'sign-in') return 'sign-in'
  if (h === 'signup') return 'signup'
  if (h === 'dashboard') return 'dashboard'
  if (h === 'orders') return 'orders'
  if (h === 'cart') return 'cart'
  if (h === 'checkout') return 'checkout'
  if (h === 'order-confirmed') return 'order-confirmed'
  if (h === 'shop') return 'shop'
  if (h === 'faq') return 'faq'
  if (h === 'safety') return 'safety'
  if (h === 'about') return 'about'
  if (h === '') return 'home'
  return 'not-found'
}

export default function App() {
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem('scentquest-cart')
      const parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })
  const [page, setPage] = useState(() => routeFromHash(window.location.hash))
  const [placedOrder, setPlacedOrder] = useState(null)
  const [user, setUser] = useState(() => loadUserSession())
  const [userOrders, setUserOrders] = useState(() => {
    const session = loadUserSession()
    return session ? getUserOrders(session.email) : []
  })
  const protectedPages = ['dashboard', 'orders', 'order-details']
  const effectivePage = protectedPages.includes(page) && !user
    ? 'sign-in'
    : user && (page === 'sign-in' || page === 'signup')
      ? 'dashboard'
      : page

  useEffect(() => {
    try {
      localStorage.setItem('scentquest-cart', JSON.stringify(cart))
    } catch {
      /* storage full or unavailable — cart still works in memory */
    }
  }, [cart])

  useEffect(() => {
    const onHashChange = () => setPage(routeFromHash(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    document.title = PAGE_TITLES[effectivePage] || PAGE_TITLES.home
  }, [effectivePage])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [effectivePage])

  useEffect(() => {
    const revealSelector = [
      '.hero-content > *',
      '.hero-title-gradient',
      '.hero-visual',
      '.hero-proof-row',
      '.home-proof-grid > article',
      '.problem-card',
      '.problem-bento-card',
      '.step',
      '.level-card',
      '.how-visual-panel',
      '.showcase-card',
      '.why-visual',
      '.home-cta-card',
      '.review-card',
      '.product-card',
      '.product-gallery',
      '.product-info',
      '.about-kit',
      '.safety-card',
      '.about-value',
      '.faq-item',
      '.cart-item',
      '.cart-total',
      '.checkout-form',
      '.order-summary',
      '.auth-shell',
      '.account-sidebar',
      '.account-card',
      '.order-list-card',
      '.confirm-card',
      '.not-found-card',
    ].join(', ')
    const tiltSelector = [
      '.hero-visual',
      '.home-proof-grid > article',
      '.product-card',
      '.problem-card',
      '.problem-bento-card',
      '.step',
      '.level-card',
      '.how-visual-panel',
      '.showcase-card',
      '.why-visual',
      '.home-cta-visual',
      '.review-card',
      '.about-kit',
      '.safety-card',
      '.about-value',
      '.faq-item',
      '.cart-item',
      '.account-card',
      '.order-list-card',
      '.confirm-card',
      '.not-found-card',
      '.auth-shell',
    ].join(', ')

    const revealElements = [...document.querySelectorAll(revealSelector)]
    revealElements.forEach((element) => {
      element.classList.add('reveal')
      const siblings = element.parentElement ? [...element.parentElement.children] : []
      const localIndex = Math.max(0, siblings.indexOf(element))
      element.style.setProperty('--reveal-delay', `${(localIndex % 6) * 65}ms`)
    })

    let observer
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            entry.target.classList.add('is-visible')
            observer?.unobserve(entry.target)
          }
        },
        { threshold: 0.08, rootMargin: '0px 0px -7% 0px' }
      )
      revealElements.forEach((element) => observer.observe(element))
    } else {
      revealElements.forEach((element) => element.classList.add('is-visible'))
    }

    const finePointer = window.matchMedia('(pointer: fine)').matches
    const tiltElements = [...document.querySelectorAll(tiltSelector)]
    const cleanups = []

    for (const element of tiltElements) {
      element.classList.add('motion-tilt')
      const maxTilt = element.matches(
        '.hero-visual, .auth-shell, .how-visual-panel, .why-visual, .home-cta-visual'
      ) ? 3 : 6

      const handlePointerMove = (event) => {
        if (!finePointer) return
        const rect = element.getBoundingClientRect()
        const x = (event.clientX - rect.left) / rect.width - 0.5
        const y = (event.clientY - rect.top) / rect.height - 0.5
        element.style.setProperty('--tilt-x', `${(-y * maxTilt).toFixed(2)}deg`)
        element.style.setProperty('--tilt-y', `${(x * maxTilt).toFixed(2)}deg`)
        element.style.setProperty('--glow-x', `${((x + 0.5) * 100).toFixed(1)}%`)
        element.style.setProperty('--glow-y', `${((y + 0.5) * 100).toFixed(1)}%`)
      }

      const handlePointerLeave = () => {
        element.style.setProperty('--tilt-x', '0deg')
        element.style.setProperty('--tilt-y', '0deg')
        element.style.setProperty('--glow-x', '50%')
        element.style.setProperty('--glow-y', '50%')
      }

      element.addEventListener('pointermove', handlePointerMove, { passive: true })
      element.addEventListener('pointerleave', handlePointerLeave)
      cleanups.push(() => {
        element.removeEventListener('pointermove', handlePointerMove)
        element.removeEventListener('pointerleave', handlePointerLeave)
      })
    }

    return () => {
      observer?.disconnect()
      for (const cleanup of cleanups) cleanup()
    }
  }, [effectivePage])

  const navigate = useCallback((to) => {
    const target = !to || to === 'home' ? '' : to
    const current = window.location.hash.replace(/^#/, '')
    if (current === target) {
      setPage(routeFromHash(target))
      window.scrollTo(0, 0)
    } else {
      window.location.hash = target
    }
  }, [])

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0)
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const total = subtotal + delivery
  const amountToFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal)

  const productIdFromHash = () =>
    window.location.hash.replace(/^#/, '').replace(/^product-/, '')

  const orderIdFromHash = () =>
    window.location.hash.replace(/^#/, '').replace(/^order-details-/, '')

  const addToCart = (item) => {
    setCart((prev) => {
      const same = (i) =>
        i.productId === item.productId &&
        i.size === item.size &&
        i.color === item.color &&
        i.scent === item.scent &&
        JSON.stringify(i.addOns) === JSON.stringify(item.addOns)
      if (prev.some(same)) {
        return prev.map((i) => (same(i) ? { ...i, qty: i.qty + item.qty } : i))
      }
      return [...prev, item]
    })
  }

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index))
  }

  const changeQty = (index, delta) => {
    setCart((prev) =>
      prev.map((i, idx) => (idx === index ? { ...i, qty: Math.max(1, i.qty + delta) } : i))
    )
  }

  const handleOrderPlaced = ({ orderId, order }) => {
    const confirmedOrder = order || {
      id: orderId,
      items: [],
      subtotal: 0,
      delivery: 0,
      total: 0,
      customer: {},
    }
    setPlacedOrder(confirmedOrder)
    saveUserOrder(confirmedOrder)
    if (user) setUserOrders(getUserOrders(user.email))
    setCart([])
    navigate('order-confirmed')
  }

  const handleAuthenticated = (nextUser) => {
    saveUserSession(nextUser)
    setUser(nextUser)
    setUserOrders(getUserOrders(nextUser.email))
    navigate('dashboard')
  }

  const handleLogout = () => {
    clearUserSession()
    setUser(null)
    setUserOrders([])
    navigate('home')
  }

  const handleReorder = (order) => {
    for (const item of order?.items || []) {
      addToCart({ ...item, qty: 1 })
    }
    navigate('cart')
  }

  const activeProduct = products.find((p) => p.id === productIdFromHash())
  const selectedOrder = userOrders.find((order) => order.id === orderIdFromHash())

  return (
    <div className="app">
      <div className="motion-ambient" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <Header cartCount={cartCount} onNavigate={navigate} user={user} />

      {effectivePage === 'home' ? (
        <main className="landing page-enter" key={effectivePage}>
          <LandingPage navigate={navigate} />
        </main>
      ) : (
        <main className="page page-enter" key={effectivePage}>
          {effectivePage === 'sign-in' && (
            <SignInPage navigate={navigate} onAuthenticated={handleAuthenticated} />
          )}
          {effectivePage === 'signup' && (
            <SignUpPage navigate={navigate} onAuthenticated={handleAuthenticated} />
          )}
          {effectivePage === 'dashboard' && user && (
            <DashboardPage
              user={user}
              orders={userOrders}
              navigate={navigate}
              onLogout={handleLogout}
              onReorder={handleReorder}
            />
          )}
          {effectivePage === 'orders' && user && (
            <OrdersPage
              user={user}
              orders={userOrders}
              navigate={navigate}
              onLogout={handleLogout}
              onReorder={handleReorder}
            />
          )}
          {effectivePage === 'order-details' && user && (
            <OrderDetailsPage
              user={user}
              order={selectedOrder}
              navigate={navigate}
              onLogout={handleLogout}
              onReorder={handleReorder}
            />
          )}
          {effectivePage === 'shop' && <Shop products={products} navigate={navigate} />}
          {effectivePage === 'product' &&
            (activeProduct ? (
              <ProductPage product={activeProduct} onAddToCart={addToCart} navigate={navigate} />
            ) : (
              <NotFound navigate={navigate} />
            ))}
          {effectivePage === 'cart' && (
            <Cart
              cart={cart}
              removeFromCart={removeFromCart}
              changeQty={changeQty}
              subtotal={subtotal}
              delivery={delivery}
              total={total}
              amountToFreeDelivery={amountToFreeDelivery}
              navigate={navigate}
            />
          )}
          {effectivePage === 'checkout' && (
            <CheckoutForm
              cart={cart}
              subtotal={subtotal}
              delivery={delivery}
              total={total}
              onBack={() => navigate('cart')}
              onSuccess={handleOrderPlaced}
            />
          )}
          {effectivePage === 'order-confirmed' && (
            <OrderConfirmed navigate={navigate} order={placedOrder} />
          )}
          {effectivePage === 'faq' && <FaqPage navigate={navigate} />}
          {effectivePage === 'safety' && <SafetyPage navigate={navigate} />}
          {effectivePage === 'about' && <AboutPage products={products} navigate={navigate} />}
          {effectivePage === 'not-found' && <NotFound navigate={navigate} />}
        </main>
      )}

      <Footer navigate={navigate} user={user} />
    </div>
  )
}

function NotFound({ navigate }) {
  return (
    <section className="not-found">
      <div className="not-found-card">
        <span className="not-found-code">404</span>
        <h1>We could not find that page</h1>
        <p>
          The link may be old or the product may have been renamed. Everything we
          make is one click away.
        </p>
        <div className="not-found-actions">
          <button className="btn btn-primary" onClick={() => navigate('shop')}>
            Browse the kits
          </button>
          <button className="btn btn-outline" onClick={() => navigate('home')}>
            Back to home
          </button>
        </div>
      </div>
    </section>
  )
}

function LandingPage({ navigate }) {
  const scrollToHow = () => {
    const el = document.getElementById('how-it-works')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="home-page">
      <section className="hero hero-cinematic">
        <div className="hero-grid-lines" aria-hidden="true" />
        <div className="hero-aurora hero-aurora-one" aria-hidden="true" />
        <div className="hero-aurora hero-aurora-two" aria-hidden="true" />
        <div className="section-inner hero-inner">
          <div className="hero-content">
            <span className="hero-kicker hero-kicker-live">
              <span className="hero-live-dot" aria-hidden="true" />
              New · India’s smarter dog toys
            </span>
            <h1>
              Turn their nose into
              <span className="hero-title-gradient">their superpower.</span>
            </h1>
            <p className="hero-tagline">
              Hide the scent. Let their instincts do the rest. ScentQuest turns
              everyday sniffing into focused, rewarding play that leaves dogs calmer
              and homes happier.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-lg hero-primary-cta" onClick={() => navigate('shop')}>
                Explore the kits
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
              <button className="btn btn-outline btn-lg" onClick={scrollToHow}>
                See how it works
                <span className="hero-play-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="m9 7 8 5-8 5z" /></svg>
                </span>
              </button>
            </div>
            <div className="hero-proof-row">
              <div className="hero-proof-avatars" aria-hidden="true">
                <span>ML</span><span>CR</span><span>PM</span><span>+</span>
              </div>
              <div>
                <strong>Loved by curious dogs</strong>
                <small>Join 2,000+ Indian pet parents</small>
              </div>
            </div>
            <ul className="hero-trust">
              <li><span aria-hidden="true">✓</span> Free delivery over ₹4,999</li>
              <li><span aria-hidden="true">✓</span> Cash on delivery</li>
              <li><span aria-hidden="true">✓</span> Food-grade materials</li>
            </ul>
          </div>

          <div className="hero-visual hero-stage">
            <div className="hero-stage-floor" aria-hidden="true" />
            <div className="hero-orbit hero-orbit-one" aria-hidden="true">
              <span className="hero-orbit-dot" />
            </div>
            <div className="hero-orbit hero-orbit-two" aria-hidden="true">
              <span className="hero-orbit-dot" />
            </div>
            <div className="hero-image-wrap hero-image-frame">
              <img
                src="/images/scentquest-1-hero.png"
                alt="A ScentQuest scent puzzle with capsules and compartments"
                className="hero-img"
              />
              <span className="hero-image-shine" aria-hidden="true" />
            </div>
            <div className="hero-badge">
              <span className="hero-badge-label">Best seller</span>
              <span className="hero-badge-price">From {formatPrice(products[0].basePrice)}</span>
            </div>
            <div className="hero-float-card hero-float-card-top">
              <span className="hero-float-icon hero-float-icon-green" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M9.5 4.5A3.5 3.5 0 0 0 6 8v1.5A3.5 3.5 0 0 0 9.5 13H10v2.5A4.5 4.5 0 0 0 14.5 20H15a3 3 0 0 0 3-3v-3.5a4.5 4.5 0 0 0-4.5-4.5H12V7.5A3 3 0 0 0 9.5 4.5Z" />
                  <path d="M5 12.5a3 3 0 0 0 0 6h1.5a3 3 0 0 0 3-3v-1.5a3 3 0 0 0-3-3H5Z" />
                </svg>
              </span>
              <span>
                <small>Mental enrichment</small>
                <strong>Built for curious noses</strong>
              </span>
            </div>
            <div className="hero-float-card hero-float-card-bottom">
              <span className="hero-play-ring" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="8" />
                  <path d="M12 8v4l3 2" />
                </svg>
              </span>
              <span>
                <small>Focused play</small>
                <strong>15–20 minute sessions</strong>
              </span>
            </div>
            <span className="hero-material-chip hero-material-chip-one">Food-grade</span>
            <span className="hero-material-chip hero-material-chip-two">No essential oils</span>
          </div>
        </div>
        <div className="hero-marquee" aria-hidden="true">
          <div className="hero-marquee-track">
            <span>Nose-led play</span><i /><span>Mental enrichment</span><i /><span>Food-grade materials</span><i /><span>Calmer dogs</span><i /><span>Cash on delivery</span><i />
            <span>Nose-led play</span><i /><span>Mental enrichment</span><i /><span>Food-grade materials</span><i /><span>Calmer dogs</span><i /><span>Cash on delivery</span><i />
          </div>
        </div>
      </section>

      <section className="home-proof-strip" aria-label="ScentQuest highlights">
        <div className="section-inner home-proof-grid">
          <article>
            <span className="home-proof-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M4 17h16M6 13h12M8 9h8M10 5h4" />
              </svg>
            </span>
            <span><strong>3 levels</strong><small>Grow with their skills</small></span>
          </article>
          <article>
            <span className="home-proof-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M12 3 4 7v5c0 4.8 3.4 7.8 8 9 4.6-1.2 8-4.2 8-9V7z" />
                <path d="m9 12 2 2 4-5" />
              </svg>
            </span>
            <span><strong>Food-grade</strong><small>Made for safe play</small></span>
          </article>
          <article>
            <span className="home-proof-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v10M15 9.5c0-1.2-1.1-2-2.5-2S10 8.3 10 9.5 11 12 13 12s3 .9 3 2.2-1.3 2.3-3 2.3-3-.8-3-2" />
              </svg>
            </span>
            <span><strong>Cash on delivery</strong><small>Pay when it arrives</small></span>
          </article>
          <article>
            <span className="home-proof-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z" />
                <circle cx="7" cy="19" r="2" /><circle cx="18" cy="19" r="2" />
              </svg>
            </span>
            <span><strong>Free delivery</strong><small>On orders over ₹4,999</small></span>
          </article>
        </div>
      </section>

      <section id="the-problem" className="problem home-problem">
        <div className="section-inner">
          <div className="home-section-heading">
            <div>
              <span className="section-kicker">The nose knows</span>
              <h2>A bored nose is a problem.<br />A scent game is the answer.</h2>
            </div>
            <p>
              Dogs were built to track. When that instinct has no job, energy turns
              into chewing, barking and restless behaviour. Scent work gives it a
              purpose.
            </p>
          </div>
          <div className="problem-bento">
            <article className="problem-bento-card problem-bento-energy">
              <span className="bento-index">01 / Energy</span>
              <div className="bento-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M13 2 5 13h6l-1 9 8-12h-6z" />
                </svg>
              </div>
              <h3>Too much pent-up energy</h3>
              <p>A long walk may still leave a scent-driven dog searching for more to do.</p>
              <div className="energy-bars" aria-hidden="true">
                <span /><span /><span /><span /><span />
              </div>
            </article>

            <article className="problem-bento-card problem-bento-habits">
              <span className="bento-index">02 / Habits</span>
              <div className="bento-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M8 11V6a2 2 0 0 1 4 0v4-2a2 2 0 0 1 4 0v3-1a2 2 0 0 1 4 0v5c0 4-3 7-7 7h-1c-2 0-3.5-1-5-2.5L4 15a2 2 0 0 1 3-2l1 1v-3Z" />
                </svg>
              </div>
              <h3>Destructive habits begin</h3>
              <p>Chewed shoes, dug gardens and restless barking often start with an underused nose.</p>
            </article>

            <article className="problem-bento-card problem-bento-focus">
              <span className="bento-index">03 / Focus</span>
              <div className="bento-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <circle cx="12" cy="12" r="8" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                </svg>
              </div>
              <h3>Physical play is not enough</h3>
              <p>Focused scent challenges give the brain a focused, rewarding task.</p>
              <div className="focus-radar" aria-hidden="true">
                <span /><span /><span /><i />
              </div>
            </article>

            <article className="problem-bento-card problem-bento-solution">
              <span className="bento-index">The smart swap</span>
              <div>
                <span className="solution-chip">One small game</span>
                <h3>A calmer dog starts with a better outlet.</h3>
                <p>Hide a treat, let them search, then celebrate the find.</p>
              </div>
              <button className="solution-arrow" onClick={() => navigate('shop')} aria-label="Explore ScentQuest kits">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </article>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="how-it-works home-how">
        <div className="section-inner">
          <div className="home-section-heading home-how-heading">
            <div>
              <span className="section-kicker">How it works</span>
              <h2>Four steps. One very happy nose.</h2>
            </div>
            <p>
              Each session follows the same simple rhythm, so your dog always knows
              what to do next—and feels brilliant when they solve it.
            </p>
          </div>

          <div className="how-layout">
            <div className="how-visual-panel">
              <div className="how-panel-label">
                <span className="how-panel-live" aria-hidden="true" />
                Live scent tracking
              </div>
              <div className="how-radar" aria-hidden="true">
                <span className="how-radar-ring radar-ring-one" />
                <span className="how-radar-ring radar-ring-two" />
                <span className="how-radar-ring radar-ring-three" />
                <span className="how-radar-sweep" />
                <span className="how-radar-core">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path d="M8 11V6a2 2 0 0 1 4 0v4-2a2 2 0 0 1 4 0v3-1a2 2 0 0 1 4 0v5c0 4-3 7-7 7h-1c-2 0-3.5-1-5-2.5L4 15a2 2 0 0 1 3-2l1 1v-3Z" />
                  </svg>
                </span>
                <i className="how-scent-particle particle-one" />
                <i className="how-scent-particle particle-two" />
                <i className="how-scent-particle particle-three" />
              </div>
              <div className="how-session-card">
                <span>
                  <small>Typical session</small>
                  <strong>15–20 minutes</strong>
                </span>
                <span className="how-session-wave" aria-hidden="true">
                  <i /><i /><i /><i /><i />
                </span>
              </div>
            </div>

            <div className="steps steps-timeline">
              {steps.map((s, index) => (
                <article
                  key={s.num}
                  className="step"
                  style={{ '--step-progress': `${(index + 1) * 25}%` }}
                >
                  <div className="step-timeline-node">
                    <span className="step-num">{s.num}</span>
                  </div>
                  <div className="step-copy">
                    <span className="step-label">Step {index + 1}</span>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                    <span className="step-progress" aria-hidden="true"><i /></span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="levels home-showcase">
        <div className="section-inner">
          <div className="home-section-heading showcase-heading">
            <div>
              <span className="section-kicker">Choose your adventure</span>
              <h2>Three kits. Endless discoveries.</h2>
            </div>
            <button className="btn btn-outline" onClick={() => navigate('shop')}>
              View the full collection
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>

          <div className="showcase-grid">
            {products.map((product, index) => (
              <article
                key={product.id}
                className={`showcase-card showcase-card-${index + 1}`}
                style={{
                  '--float-delay': `${index * -1.8}s`,
                  '--float-distance': `${9 + index * 4}px`,
                }}
              >
                <button
                  className="showcase-media"
                  onClick={() => navigate(`product-${product.id}`)}
                  aria-label={`View ${product.name}`}
                >
                  <span className="showcase-number" aria-hidden="true">0{index + 1}</span>
                  <span className="showcase-orbit showcase-orbit-one" aria-hidden="true" />
                  <span className="showcase-orbit showcase-orbit-two" aria-hidden="true" />
                  <img src={product.images[0]} alt={product.name} loading="lazy" />
                  <span className="showcase-cta">
                    View kit
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </button>
                <div className="showcase-body">
                  <div className="showcase-meta">
                    <span>{product.sizes[0].label}</span>
                    <span>{product.scents[0].label}</span>
                  </div>
                  <h3>{product.name}</h3>
                  <p>{product.desc}</p>
                  <div className="showcase-footer">
                    <strong>From {formatPrice(product.basePrice)}</strong>
                    <button onClick={() => navigate(`product-${product.id}`)} aria-label={`Shop ${product.name}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="comparison home-why">
        <div className="section-inner why-layout">
          <div className="why-copy">
            <span className="section-kicker">Why ScentQuest</span>
            <h2>Not another toy.<br />A daily brain gym.</h2>
            <p>
              ScentQuest combines play, problem-solving and instinct into one simple
              ritual that keeps curious minds engaged.
            </p>
            <ul className="why-list">
              <li>
                <span aria-hidden="true">01</span>
                <div><strong>One scent at a time</strong><p>Simple rules make every session easy to understand.</p></div>
              </li>
              <li>
                <span aria-hidden="true">02</span>
                <div><strong>Progress that scales</strong><p>Move from easy finds to advanced scent trails.</p></div>
              </li>
              <li>
                <span aria-hidden="true">03</span>
                <div><strong>Reward built in</strong><p>The hidden treat turns searching into a satisfying game.</p></div>
              </li>
              <li>
                <span aria-hidden="true">04</span>
                <div><strong>Made for real homes</strong><p>Durable, food-grade materials for everyday play.</p></div>
              </li>
            </ul>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('shop')}>
              Start a scent session
            </button>
          </div>

          <div className="why-visual" aria-hidden="true">
            <div className="why-device">
              <div className="why-device-bar">
                <span><i /><i /><i /></span>
                <small>ScentQuest session</small>
                <em>Live</em>
              </div>
              <div className="why-device-main">
                <div className="why-score-ring">
                  <span><strong>Focus</strong><small>Engaged</small></span>
                </div>
                <div className="why-device-stats">
                  <span><small>Level</small><strong>02</strong></span>
                  <span><small>Reward</small><strong>Find</strong></span>
                  <span><small>Mode</small><strong>Scent</strong></span>
                </div>
              </div>
              <div className="why-device-chart">
                <span><i /><i /><i /><i /><i /><i /><i /></span>
                <small>Mental activity</small>
              </div>
            </div>
            <div className="why-float-chip why-float-chip-one">
              <span className="why-chip-dot" />
              Nose-led challenge
            </div>
            <div className="why-float-chip why-float-chip-two">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 12 4 4L19 6" /></svg>
              Food-grade
            </div>
            <div className="why-orbit-shadow" />
          </div>
        </div>
      </section>

      <section className="reviews home-reviews">
        <div className="section-inner">
          <div className="home-section-heading reviews-heading">
            <div>
              <span className="section-kicker">Tail-wag approved</span>
              <h2>What families say</h2>
            </div>
            <div className="review-rating">
              <strong>4.9</strong>
              <span>
                <i>★★★★★</i>
                <small>Loved by Indian dog parents</small>
              </span>
            </div>
          </div>
          <div className="review-grid">
            {reviews.map((r, i) => (
              <figure key={i} className="review-card" style={{ '--review-delay': `${i * 0.25}s` }}>
                <div className="review-card-top">
                  <span className="review-avatar">{r.initials}</span>
                  <div>
                    <div className="stars" aria-label={`${r.stars} out of 5 stars`}>
                      {'★'.repeat(r.stars)}
                    </div>
                    <span className="review-verified">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 12 4 4L19 6" /></svg>
                      Verified buyer
                    </span>
                  </div>
                </div>
                <blockquote>“{r.text}”</blockquote>
                <figcaption className="review-author">{r.name}</figcaption>
                <span className="review-card-glow" aria-hidden="true" />
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="cta home-cta">
        <div className="section-inner">
          <div className="cta-card home-cta-card">
            <div className="home-cta-copy">
              <span className="home-cta-kicker">Your dog’s next favourite game</span>
              <h2>Ready for a calmer, more curious dog?</h2>
              <p>
                Start with scent-led enrichment today. Free delivery over ₹4,999,
                cash on delivery, and no advance payment.
              </p>
              <div className="home-cta-actions">
                <button className="btn btn-primary btn-lg" onClick={() => navigate('shop')}>
                  Shop ScentQuest now
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
                <button className="btn btn-outline btn-lg" onClick={() => navigate('faq')}>
                  Talk to a scent guide
                </button>
              </div>
              <div className="cta-links">
                <button className="link-btn" onClick={() => navigate('about')}>About us</button>
                <button className="link-btn" onClick={() => navigate('faq')}>FAQ</button>
                <button className="link-btn" onClick={() => navigate('safety')}>Safety guide</button>
              </div>
            </div>
            <div className="home-cta-visual" aria-hidden="true">
              <span className="cta-orbit cta-orbit-one" />
              <span className="cta-orbit cta-orbit-two" />
              <span className="cta-orbit cta-orbit-three" />
              <div className="cta-product-frame">
                <img src="/images/scentquest-1-hero.png" alt="" loading="lazy" />
              </div>
              <span className="cta-float-label cta-float-label-one">New skill unlocked</span>
              <span className="cta-float-label cta-float-label-two">Happy nose</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function Shop({ products, navigate }) {
  return (
    <section className="shop">
      <div className="page-head">
        <div>
          <span className="section-kicker">All kits</span>
          <h1>Shop scent toys</h1>
          <p className="page-sub">Scent-driven enrichment for curious dogs. Choose a kit, then pick your size, colour and scent.</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('home')}>
          ← Back to home
        </button>
      </div>
      <div className="product-grid">
        {products.map((p) => (
          <article key={p.id} className="product-card">
            <button
              className="product-card-media"
              onClick={() => navigate(`product-${p.id}`)}
              aria-label={`View ${p.name}`}
            >
              <img className="product-img" src={p.images[0]} alt={p.name} loading="lazy" />
              <span className="product-card-cta">View kit</span>
            </button>
            <div className="product-card-body">
              <h3>{p.name}</h3>
              <p className="product-desc">{p.desc}</p>
              <ul className="product-tags">
                {p.sizes.slice(0, 3).map((s) => (
                  <li key={s.label}>{s.label}</li>
                ))}
              </ul>
              <div className="product-footer">
                <span className="price">From {formatPrice(p.basePrice)}</span>
                <button className="add-btn" onClick={() => navigate(`product-${p.id}`)}>
                  Choose options
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Cart({
  cart,
  removeFromCart,
  changeQty,
  subtotal,
  delivery,
  total,
  amountToFreeDelivery,
  navigate,
}) {
  const freeDelivery = delivery === 0
  return (
    <section className="cart">
      <div className="page-head">
        <div>
          <span className="section-kicker">Your basket</span>
          <h1>Your cart</h1>
          <p className="page-sub">
            {cart.length === 0
              ? 'Nothing here yet.'
              : `${cartCountLabel(cart)} in your basket.`}
          </p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('shop')}>
          ← Keep shopping
        </button>
      </div>

      {cart.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
            </svg>
          </span>
          <h2>Your cart is empty</h2>
          <p>Pick a kit and we will get it on its way to your dog.</p>
          <button className="btn btn-primary" onClick={() => navigate('shop')}>
            Browse the kits
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {cart.map((item, i) => {
              const p = products.find((p) => p.id === item.productId)
              const img = item.image || (p ? p.images[0] : '/images/scentquest-1-hero.png')
              const colorLabel = p?.colors.find((c) => c.value === item.color)?.label || item.color
              return (
                <article key={i} className="cart-item">
                  <img className="cart-item-img" src={img} alt={item.name} loading="lazy" />
                  <div className="cart-item-info">
                    <h3 className="cart-item-name">{item.name}</h3>
                    <p className="cart-item-meta">
                      Size: {item.size} · Colour: {colorLabel} · Scent: {item.scent}
                    </p>
                    {item.addOns.length > 0 && (
                      <p className="cart-item-addons">+ {item.addOns.join(', ')}</p>
                    )}
                    <p className="cart-item-price">{formatPrice(item.unitPrice)}</p>
                  </div>
                  <div className="cart-item-controls">
                    <div className="qty-picker">
                      <button
                        onClick={() => changeQty(i, -1)}
                        disabled={item.qty <= 1}
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        −
                      </button>
                      <span className="qty" aria-live="polite">{item.qty}</span>
                      <button
                        onClick={() => changeQty(i, 1)}
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                    <button className="remove-btn" onClick={() => removeFromCart(i)}>
                      Remove
                    </button>
                  </div>
                </article>
              )
            })}
          </div>

          <aside className="cart-total">
            <h3 className="cart-total-title">Order summary</h3>
            <div className={`delivery-note ${freeDelivery ? 'is-free' : ''}`}>
              {freeDelivery ? (
                <>
                  <span className="delivery-check" aria-hidden="true">✓</span>
                  <span>Free delivery unlocked on this order</span>
                </>
              ) : (
                <span>
                  Add <strong>{formatPrice(amountToFreeDelivery)}</strong> more for free delivery
                </span>
              )}
            </div>
            <div className="total-row">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="total-row">
              <span>Delivery</span>
              <span className={freeDelivery ? 'free-text' : ''}>
                {freeDelivery ? 'FREE' : formatPrice(delivery)}
              </span>
            </div>
            <div className="total-row total-grand">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <button className="checkout-btn" onClick={() => navigate('checkout')}>
              Checkout · {formatPrice(total)}
            </button>
            <p className="cart-footnote">Cash on delivery · Free delivery over ₹4,999</p>
          </aside>
        </div>
      )}
    </section>
  )
}

function cartCountLabel(cart) {
  const count = cart.reduce((sum, i) => sum + i.qty, 0)
  return `${count} item${count === 1 ? '' : 's'}`
}

function OrderConfirmed({ navigate, order }) {
  const items = order?.items || []
  const customer = order?.customer || {}

  const optionLabel = (item, kind, raw) => {
    if (!raw) return null
    const product = products.find((p) => p.id === item.productId)
    if (kind === 'color') {
      return product?.colors.find((c) => c.value === raw)?.label || raw
    }
    return raw
  }

  const addOnLabels = (item) => {
    const product = products.find((p) => p.id === item.productId)
    return (item.addOns || [])
      .map((id) => product?.addOns.find((a) => a.id === id)?.label || id)
      .join(', ')
  }

  return (
    <section className="confirmed">
      <div className="confirm-card wide">
        <span className="confirm-icon" aria-hidden="true">✓</span>
        <h1>Order confirmed</h1>
        {order?.id && (
          <p className="confirm-order-id">
            Order ID <strong>{order.id}</strong>
          </p>
        )}

        {items.length > 0 && (
          <div className="confirm-details">
            <div className="confirm-block">
              <h4>Items</h4>
              <ul className="confirm-items">
                {items.map((item, i) => (
                  <li key={i}>
                    <div className="confirm-item-info">
                      <span className="confirm-item-name">{item.name}</span>
                      <span className="confirm-item-meta">
                        {[
                          optionLabel(item, 'size', item.size),
                          optionLabel(item, 'color', item.color),
                          optionLabel(item, 'scent', item.scent),
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                      {addOnLabels(item) && (
                        <span className="confirm-item-addons">+ {addOnLabels(item)}</span>
                      )}
                    </div>
                    <span className="confirm-item-price">
                      {formatPrice(item.unitPrice)} × {item.qty}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="confirm-block">
              <h4>Delivery address</h4>
              <p className="confirm-address">
                <strong>{customer.name}</strong>
                <br />
                {customer.address}
                <br />
                Pincode {customer.pincode}
                <br />
                {customer.phone}
                <br />
                {customer.email}
              </p>
            </div>
          </div>
        )}

        <div className="confirm-total">
          <div className="total-row">
            <span>Subtotal</span>
            <span>{formatPrice(order?.subtotal || 0)}</span>
          </div>
          <div className="total-row">
            <span>Delivery</span>
            <span className={order?.delivery === 0 ? 'free-text' : ''}>
              {order?.delivery === 0 ? 'FREE' : formatPrice(order?.delivery || 0)}
            </span>
          </div>
          <div className="total-row total-grand">
            <span>Total</span>
            <span>{formatPrice(order?.total || 0)}</span>
          </div>
        </div>

        <p className="confirm-cod">
          Paying with Cash on Delivery. We will call you on your phone number to confirm delivery.
        </p>
        <button className="continue-shopping" onClick={() => navigate('home')}>
          Continue shopping
        </button>
      </div>
    </section>
  )
}
