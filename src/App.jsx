import { useState, useEffect } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import ProductPage from './components/ProductPage.jsx'
import CheckoutForm from './components/CheckoutForm.jsx'
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

export default function App() {
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem('scentquest-cart')
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })
  const [page, setPage] = useState('home')
  const [placedOrder, setPlacedOrder] = useState(null)

  useEffect(() => {
    localStorage.setItem('scentquest-cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    const onHashChange = () => {
      const h = window.location.hash.replace(/^#/, '')
      if (h.startsWith('product-')) setPage('product')
      else if (h === 'cart') setPage('cart')
      else if (h === 'checkout') setPage('checkout')
      else if (h === 'order-confirmed') setPage('order-confirmed')
      else if (h === 'shop') setPage('shop')
      else setPage('home')
    }
    window.addEventListener('hashchange', onHashChange)
    onHashChange()
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const nav = (to) => { setPage(to); window.location.hash = to }

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0)
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const total = subtotal + delivery
  const amountToFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal)

  const productIdFromHash = () => {
    const h = window.location.hash.replace(/^#/, '')
    return h.replace(/^product-/, '')
  }

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) =>
          i.productId === item.productId &&
          i.size === item.size &&
          i.color === item.color &&
          i.scent === item.scent &&
          JSON.stringify(i.addOns) === JSON.stringify(item.addOns)
      )
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId &&
          i.size === item.size &&
          i.color === item.color &&
          i.scent === item.scent &&
          JSON.stringify(i.addOns) === JSON.stringify(item.addOns)
            ? { ...i, qty: i.qty + item.qty }
            : i
        )
      }
      return [...prev, item]
    })
    nav('cart')
  }

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index))
  }

  const changeQty = (index, delta) => {
    setCart((prev) =>
      prev
        .map((i, idx) =>
          idx === index ? { ...i, qty: Math.max(0, i.qty + delta) } : i
        )
        .filter((_, idx) => idx === index ? prev[idx].qty + delta > 0 : true)
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
    nav('order-confirmed')
  }

  const activeProduct = products.find((p) => p.id === productIdFromHash())

  return (
    <div className="app">
      <Header cartCount={cartCount} onCartClick={() => nav('cart')} />
      <main className="page">
        {page === 'home' && <LandingPage nav={nav} />}
        {page === 'shop' && <Shop products={products} nav={nav} />}
        {page === 'product' && activeProduct && (
          <ProductPage product={activeProduct} onAddToCart={addToCart} />
        )}
        {page === 'cart' && (
          <Cart
            cart={cart}
            removeFromCart={removeFromCart}
            changeQty={changeQty}
            subtotal={subtotal}
            delivery={delivery}
            total={total}
            amountToFreeDelivery={amountToFreeDelivery}
            nav={nav}
          />
        )}
        {page === 'checkout' && (
          <CheckoutForm
            cart={cart}
            subtotal={subtotal}
            delivery={delivery}
            total={total}
            onBack={() => nav('cart')}
            onSuccess={handleOrderPlaced}
          />
        )}
        {page === 'order-confirmed' && <OrderConfirmed nav={nav} order={placedOrder} />}
      </main>
      <Footer />
    </div>
  )
}

function LandingPage({ nav }) {
  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <span className="hero-kicker">New for curious dogs</span>
            <h1>Scent-led play that tires them out.</h1>
            <p className="hero-tagline">
              ScentQuest turns sniffing into a rewarding game — mental enrichment,
              calmer dogs, happier homes.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={() => nav('shop')}>
                Shop ScentQuest
              </button>
              <button className="btn btn-outline">
                How it works
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <img src="/images/scentquest-1-hero.png" alt="ScentQuest hero" className="hero-img" />
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
                <img src={l.image} alt={l.name} className="level-img" />
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
          <table>
            <thead>
              <tr><th></th><th>Ordinary toy</th><th>ScentQuest</th></tr>
            </thead>
            <tbody>
              <tr><td>Mental workout</td><td>❌ Minimal</td><td>✅ Nose-led challenge</td></tr>
              <tr><td>Tires them out</td><td>❌ Briefly</td><td>✅ Long-lasting calm</td></tr>
              <tr><td>Scales with skill</td><td>❌ Fixed</td><td>✅ 3 difficulty levels</td></tr>
              <tr><td>Keeps them busy</td><td>❌ Short bursts</td><td>✅ Repeat engagement</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="reviews">
        <div className="section-inner">
          <span className="section-kicker">Fast reviews</span>
          <h2>What families say</h2>
          <div className="review-grid">
            {reviews.map((r, i) => (
              <div key={i} className="review-card">
                <div className="stars">{'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div>
                <p>{r.text}</p>
                <span className="review-author">— {r.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="cta-card">
          <h2>Ready for a calmer dog?</h2>
          <p>Start with scent-led enrichment today.</p>
          <button className="btn btn-primary" onClick={() => nav('shop')}>
            Shop ScentQuest now
          </button>
        </div>
      </section>
    </>
  )
}

function Shop({ products, nav }) {
  return (
    <section className="shop">
      <div className="section-inner shop-header">
        <h1>Shop</h1>
        <button className="btn btn-outline" onClick={() => nav('home')}>
          ← Back to home
        </button>
      </div>
      <p className="shop-intro">Scent-driven enrichment for curious dogs.</p>
      <div className="product-grid">
        {products.map((p) => (
          <article key={p.id} className="product-card">
            <img className="product-img" src={p.images[0]} alt={p.name} />
            <h3>{p.name}</h3>
            <p className="product-desc">{p.desc}</p>
            <div className="product-footer">
              <span className="price">From {formatPrice(p.basePrice)}</span>
              <button className="add-btn" onClick={() => nav(`product-${p.id}`)}>
                Choose options
              </button>
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
  nav,
}) {
  const freeDelivery = delivery === 0
  return (
    <section className="cart">
      <div className="section-inner cart-header">
        <h1>Your Cart</h1>
        <button className="btn btn-outline" onClick={() => nav('shop')}>
          ← Keep shopping
        </button>
      </div>
      {cart.length === 0 ? (
        <p className="empty">
          Your cart is empty.{' '}
          <span className="empty-link" onClick={() => nav('shop')}>
            Browse products
          </span>
        </p>
      ) : (
        <>
          <div className="cart-list">
            {cart.map((item, i) => {
              const p = products.find((p) => p.id === item.productId)
              const img = item.image || (p ? p.images[0] : '/images/scentquest-1-hero.png')
              const colorLabel = p?.colors.find((c) => c.value === item.color)?.label || item.color
              return (
                <div key={i} className="cart-item">
                  <img className="cart-item-img" src={img} alt={item.name} />
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-meta">
                      Size: {item.size} · Color: {colorLabel} · Scent: {item.scent}
                    </div>
                    {item.addOns.length > 0 && (
                      <div className="cart-item-addons">
                        + {item.addOns.join(', ')}
                      </div>
                    )}
                    <div className="cart-item-price">{formatPrice(item.unitPrice)}</div>
                  </div>
                  <div className="cart-item-controls">
                    <div className="qty-picker">
                      <button
                        onClick={() => changeQty(i, -1)}
                        disabled={item.qty <= 1}
                      >
                        −
                      </button>
                      <span className="qty">{item.qty}</span>
                      <button onClick={() => changeQty(i, 1)}>+</button>
                    </div>
                    <button className="remove-btn" onClick={() => removeFromCart(i)}>
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="cart-total">
            <div className={`delivery-note ${freeDelivery ? 'is-free' : ''}`}>
              {freeDelivery ? (
                <>
                  <span className="delivery-check">✓</span>
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
            <button className="checkout-btn" onClick={() => nav('checkout')}>
              Checkout · {formatPrice(total)}
            </button>
          </div>
        </>
      )}
    </section>
  )
}

function OrderConfirmed({ nav, order }) {
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
        <span className="confirm-icon">✅</span>
        <h1>Order Confirmed!</h1>
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
        <button className="continue-shopping" onClick={() => nav('home')}>
          Continue shopping
        </button>
      </div>
    </section>
  )
}
