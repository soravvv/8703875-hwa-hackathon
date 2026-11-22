import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import ProductPage from './components/ProductPage.jsx'
import CheckoutForm from './components/CheckoutForm.jsx'
import { AboutPage, FaqPage, SafetyPage } from './components/InfoPages.jsx'
import { formatPrice } from './lib/format.js'

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

const levels = [
  { name: 'Beginner', desc: 'Easy finds for puppies and new sniffers.', badge: 'Puppy-friendly', image: '/images/scentquest-5-scent-capsules.png' },
  { name: 'Intermediate', desc: 'Multi-step puzzles for curious adult dogs.', badge: 'Best seller', image: '/images/scentquest-2-lifestyle-beagle.png' },
  { name: 'Advanced', desc: 'Complex trails and hidden compartments.', badge: 'For scent hounds', image: '/images/scentquest-3-inside-cutaway.png' },
]

const reviews = [
  { name: 'Maya & Luna', stars: 5, text: 'Luna is calmer after her scent sessions. Best purchase this year.' },
  { name: 'Carlos & Rex', stars: 5, text: 'The trail kit turned our backyard into a sniffing adventure.' },
  { name: 'Priya & Milo', stars: 5, text: 'Milo loves the puzzle box. Finally something that keeps him busy.' },
]

const PAGE_TITLES = {
  home: 'ScentQuest — Scent-led play for curious dogs',
  shop: 'Shop scent toys — ScentQuest',
  product: 'Product — ScentQuest',
  cart: 'Your cart — ScentQuest',
  checkout: 'Checkout — ScentQuest',
  'order-confirmed': 'Order confirmed — ScentQuest',
  faq: 'FAQ — ScentQuest',
  safety: 'Safety guide — ScentQuest',
  about: 'About ScentQuest',
  'not-found': 'Page not found — ScentQuest',
}

function routeFromHash(hash) {
  const h = String(hash || '').replace(/^#/, '')
  if (h.startsWith('product-')) return 'product'
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
    document.title = PAGE_TITLES[page] || PAGE_TITLES.home
  }, [page])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [page])

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
    setPlacedOrder(
      order || {
        id: orderId,
        items: [],
        subtotal: 0,
        delivery: 0,
        total: 0,
        customer: {},
      }
    )
    setCart([])
    navigate('order-confirmed')
  }

  const activeProduct = products.find((p) => p.id === productIdFromHash())

  return (
    <div className="app">
      <Header cartCount={cartCount} onNavigate={navigate} />

      {page === 'home' ? (
        <main className="landing">
          <LandingPage navigate={navigate} />
        </main>
      ) : (
        <main className="page">
          {page === 'shop' && <Shop products={products} navigate={navigate} />}
          {page === 'product' &&
            (activeProduct ? (
              <ProductPage product={activeProduct} onAddToCart={addToCart} navigate={navigate} />
            ) : (
              <NotFound navigate={navigate} />
            ))}
          {page === 'cart' && (
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
          {page === 'checkout' && (
            <CheckoutForm
              cart={cart}
              subtotal={subtotal}
              delivery={delivery}
              total={total}
              onBack={() => navigate('cart')}
              onSuccess={handleOrderPlaced}
            />
          )}
          {page === 'order-confirmed' && (
            <OrderConfirmed navigate={navigate} order={placedOrder} />
          )}
          {page === 'faq' && <FaqPage navigate={navigate} />}
          {page === 'safety' && <SafetyPage navigate={navigate} />}
          {page === 'about' && <AboutPage products={products} navigate={navigate} />}
          {page === 'not-found' && <NotFound navigate={navigate} />}
        </main>
      )}

      <Footer navigate={navigate} />
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
    <>
      <section className="hero">
        <div className="section-inner hero-inner">
          <div className="hero-content">
            <span className="hero-kicker">New for curious dogs</span>
            <h1>Scent-led play that tires them out.</h1>
            <p className="hero-tagline">
              ScentQuest turns sniffing into a rewarding game — mental enrichment,
              calmer dogs, happier homes.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={() => navigate('shop')}>
                Shop ScentQuest
              </button>
              <button className="btn btn-outline btn-lg" onClick={scrollToHow}>
                How it works
              </button>
            </div>
            <ul className="hero-trust">
              <li><span aria-hidden="true">✓</span> Free delivery over ₹4,999</li>
              <li><span aria-hidden="true">✓</span> Cash on delivery</li>
              <li><span aria-hidden="true">✓</span> Food-grade materials</li>
            </ul>
          </div>
          <div className="hero-visual">
            <div className="hero-image-wrap">
              <img
                src="/images/scentquest-1-hero.png"
                alt="A ScentQuest scent puzzle with capsules and compartments"
                className="hero-img"
              />
            </div>
            <div className="hero-badge">
              <span className="hero-badge-label">Best seller</span>
              <span className="hero-badge-price">From {formatPrice(products[0].basePrice)}</span>
            </div>
          </div>
        </div>
      </section>

      <section id="the-problem" className="problem">
        <div className="section-inner">
          <span className="section-kicker">The problem</span>
          <h2>Dogs are bored. Bored dogs misbehave.</h2>
          <div className="problem-grid">
            <div className="problem-card">
              <span className="problem-num">1</span>
              <h3>Too much energy</h3>
              <p>Walks alone don’t tire out a dog that was bred to sniff and hunt.</p>
            </div>
            <div className="problem-card">
              <span className="problem-num">2</span>
              <h3>Destructive habits</h3>
              <p>Chewed shoes, dug gardens, and barking often come from underused noses.</p>
            </div>
            <div className="problem-card">
              <span className="problem-num">3</span>
              <h3>Not enough mental work</h3>
              <p>Physical exercise isn’t enough — scent work is what genuinely settles them.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="how-it-works">
        <div className="section-inner">
          <span className="section-kicker">How it works</span>
          <h2>Sniff, find, reward. Repeat.</h2>
          <div className="steps">
            {steps.map((s) => (
              <div key={s.num} className="step">
                <span className="step-num">{s.num}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="levels">
        <div className="section-inner">
          <span className="section-kicker">Choose your level</span>
          <h2>Three difficulty levels</h2>
          <div className="level-grid">
            {levels.map((l) => (
              <div key={l.name} className="level-card">
                <span className="level-badge">{l.badge}</span>
                <img src={l.image} alt={l.name} className="level-img" loading="lazy" />
                <h3>{l.name}</h3>
                <p>{l.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="comparison">
        <div className="section-inner">
          <span className="section-kicker">Why ScentQuest</span>
          <h2>ScentQuest vs ordinary toys</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th aria-label="Feature" /><th>Ordinary toy</th><th>ScentQuest</th></tr>
              </thead>
              <tbody>
                <tr><td>Mental workout</td><td className="cell-no">Minimal</td><td className="cell-yes">Nose-led challenge</td></tr>
                <tr><td>Tires them out</td><td className="cell-no">Briefly</td><td className="cell-yes">Long-lasting calm</td></tr>
                <tr><td>Scales with skill</td><td className="cell-no">Fixed</td><td className="cell-yes">3 difficulty levels</td></tr>
                <tr><td>Keeps them busy</td><td className="cell-no">Short bursts</td><td className="cell-yes">Repeat engagement</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="reviews">
        <div className="section-inner">
          <span className="section-kicker">Fast reviews</span>
          <h2>What families say</h2>
          <div className="review-grid">
            {reviews.map((r, i) => (
              <figure key={i} className="review-card">
                <div className="stars" aria-label={`${r.stars} out of 5 stars`}>
                  {'★'.repeat(r.stars)}
                </div>
                <blockquote>{r.text}</blockquote>
                <figcaption className="review-author">— {r.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="section-inner">
          <div className="cta-card">
            <h2>Ready for a calmer dog?</h2>
            <p>Start with scent-led enrichment today. Free delivery over ₹4,999, cash on delivery, no advance payment.</p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('shop')}>
              Shop ScentQuest now
            </button>
            <div className="cta-links">
              <button className="link-btn" onClick={() => navigate('about')}>About us</button>
              <button className="link-btn" onClick={() => navigate('faq')}>FAQ</button>
              <button className="link-btn" onClick={() => navigate('safety')}>Safety guide</button>
            </div>
          </div>
        </div>
      </section>
    </>
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
