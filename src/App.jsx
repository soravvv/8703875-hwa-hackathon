import { useState } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'

const products = [
  {
    id: 'snuffle-mat',
    name: 'Snuffle Snack Mat',
    price: 24,
    desc: 'Hide treats in the fleece folds for nose-work fun.',
    image: '/images/scentquest-2-lifestyle-beagle.png',
  },
  {
    id: 'scent-puzzle',
    name: 'Scent Puzzle Box',
    price: 18,
    desc: 'Slide covers to reveal hidden scented compartments.',
    image: '/images/scentquest-3-inside-cutaway.png',
  },
  {
    id: 'trail-kit',
    name: 'Backyard Trail Kit',
    price: 32,
    desc: 'Scent markers to lay a tracking trail outdoors.',
    image: '/images/scentquest-4-colours.png',
  },
  {
    id: 'lick-mat',
    name: 'Calm Lick Mat',
    price: 12,
    desc: 'Spread peanut butter for a soothing lick session.',
    image: '/images/scentquest-5-scent-capsules.png',
  },
]

const steps = [
  { num: '01', title: 'Hide a scent', text: 'Tuck a treat or scent capsule into any ScentQuest toy.' },
  { num: '02', title: 'Let them sniff', text: 'Your dog uses their nose to track it down — mental exercise that tires them out.' },
  { num: '03', title: 'Reward the find', text: 'They get the treat and a confidence boost every time they solve it.' },
  { num: '04', title: 'Repeat & level up', text: 'Move to harder puzzles as their scenting skills grow.' },
]

const levels = [
  {
    name: 'Beginner',
    desc: 'Easy finds for puppies and new sniffers.',
    badge: 'Puppy-friendly',
    image: '/images/scentquest-5-scent-capsules.png',
  },
  {
    name: 'Intermediate',
    desc: 'Multi-step puzzles for curious adult dogs.',
    badge: 'Best seller',
    image: '/images/scentquest-2-lifestyle-beagle.png',
  },
  {
    name: 'Advanced',
    desc: 'Complex trails and hidden compartments.',
    badge: 'For scent hounds',
    image: '/images/scentquest-3-inside-cutaway.png',
  },
]

const reviews = [
  { name: 'Maya & Luna', stars: 5, text: 'Luna is calmer after her scent sessions. Best purchase this year.' },
  { name: 'Carlos & Rex', stars: 5, text: 'The trail kit turned our backyard into a sniffing adventure.' },
  { name: 'Priya & Milo', stars: 5, text: 'Milo loves the puzzle box. Finally something that keeps him busy.' },
]

export default function App() {
  const [cart, setCart] = useState([])
  const [page, setPage] = useState('home')

  const nav = (to) => { setPage(to); window.location.hash = to }

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)

  const addToCart = (id) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === id)
      if (existing) {
        return prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i))
      }
      return [...prev, { id, qty: 1 }]
    })
    setPage('cart')
    window.location.hash = 'cart'
  }

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id))
  }

  const changeQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
        .filter((i) => i.qty > 0)
    )
  }

  const subtotal = cart.reduce((sum, item) => {
    const p = products.find((p) => p.id === item.id)
    return sum + p.price * item.qty
  }, 0)

  const handleCheckout = async (e) => {
    e.preventDefault()
    const form = new FormData(e.target)
    const order = {
      items: cart,
      subtotal,
      customer: {
        name: form.get('name'),
        email: form.get('email'),
        address: form.get('address'),
      },
      createdAt: new Date().toISOString(),
    }
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      })
      const data = await res.json()
      if (res.ok) {
        setCart([])
        setPage('order-confirmed')
        window.location.hash = 'order-confirmed'
      } else {
        alert(data.error || 'Order failed. Try again.')
      }
    } catch (err) {
      alert('Could not reach the server.')
    }
  }

  return (
    <div className="app">
      <Header cartCount={cartCount} onCartClick={() => nav('cart')} />
      <main className="page">
        {page === 'home' && <LandingPage nav={nav} addToCart={addToCart} />}
        {page === 'shop' && <Shop products={products} addToCart={addToCart} nav={nav} />}
        {page === 'cart' && <Cart cart={cart} removeFromCart={removeFromCart} changeQty={changeQty} subtotal={subtotal} nav={nav} />}
        {page === 'checkout' && <Checkout cart={cart} subtotal={subtotal} onSubmit={handleCheckout} nav={nav} />}
        {page === 'order-confirmed' && <OrderConfirmed nav={nav} />}
      </main>
      <Footer />
    </div>
  )
}

function LandingPage({ nav, addToCart }) {
  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <span className="hero-kicker">New for curious dogs</span>
            <h1>Scent-led play that tires them out.</h1>
            <p className="hero-tagline">ScentQuest turns sniffing into a rewarding game — mental enrichment, calmer dogs, happier homes.</p>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={() => nav('shop')}>Shop ScentQuest</button>
              <button className="btn btn-outline" onClick={() => window.scrollTo({ top: document.getElementById('how-it-works')?.offsetTop || 0, behavior: 'smooth' })}>
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
          <button className="btn btn-primary" onClick={() => nav('shop')}>Shop ScentQuest now</button>
        </div>
      </section>
    </>
  )
}

function Shop({ products, addToCart, nav }) {
  return (
    <section className="shop">
      <div className="section-inner shop-header">
        <h1>Shop</h1>
        <button className="btn btn-outline" onClick={() => nav('home')}>← Back to home</button>
      </div>
      <p className="shop-intro">Scent-driven enrichment for curious dogs.</p>
      <div className="product-grid">
        {products.map((p) => (
          <article key={p.id} className="product-card">
            <img className="product-img" src={p.image} alt={p.name} />
            <h3>{p.name}</h3>
            <p className="product-desc">{p.desc}</p>
            <div className="product-footer">
              <span className="price">${p.price}</span>
              <button className="add-btn" onClick={() => addToCart(p.id)}>Add to cart</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Cart({ cart, removeFromCart, changeQty, subtotal, nav }) {
  return (
    <section className="cart">
      <div className="section-inner cart-header">
        <h1>Your Cart</h1>
        <button className="btn btn-outline" onClick={() => nav('shop')}>← Keep shopping</button>
      </div>
      {cart.length === 0 ? (
        <p className="empty">Your cart is empty. <span className="empty-link" onClick={() => nav('shop')}>Browse products</span></p>
      ) : (
        <>
          <div className="cart-list">
            {cart.map((item) => {
              const p = products.find((p) => p.id === item.id)
              return (
                <div key={item.id} className="cart-item">
                  <img className="cart-item-img" src={p.image} alt={p.name} />
                  <div className="cart-item-info">
                    <div className="cart-item-name">{p.name}</div>
                    <div className="cart-item-price">${p.price}</div>
                  </div>
                  <div className="cart-item-controls">
                    <button className="qty-btn" onClick={() => changeQty(item.id, -1)}>−</button>
                    <span className="qty">{item.qty}</span>
                    <button className="qty-btn" onClick={() => changeQty(item.id, 1)}>+</button>
                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}>Remove</button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="cart-total">
            <div className="total-row"><span>Subtotal</span><span>${subtotal}</span></div>
            <button className="checkout-btn" disabled={cart.length === 0} onClick={() => nav('checkout')}>
              Proceed to checkout
            </button>
          </div>
        </>
      )}
    </section>
  )
}

function Checkout({ cart, subtotal, onSubmit, nav }) {
  return (
    <section className="checkout">
      <div className="section-inner checkout-header">
        <h1>Checkout</h1>
        <button className="btn btn-outline" onClick={() => nav('cart')}>← Back to cart</button>
      </div>
      <form onSubmit={onSubmit} className="checkout-form">
        <div className="form-group">
          <label>Name</label>
          <input name="name" type="text" required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input name="email" type="email" required />
        </div>
        <div className="form-group">
          <label>Address</label>
          <textarea name="address" rows={3} required />
        </div>
        <div className="order-summary">
          <h3>Order Summary</h3>
          {cart.map((item) => {
            const p = products.find((p) => p.id === item.id)
            return (
              <div key={item.id} className="summary-item">
                <span>{p.name} × {item.qty}</span>
                <span>${p.price * item.qty}</span>
              </div>
            )
          })}
          <div className="summary-total"><span>Total</span><span>${subtotal}</span></div>
        </div>
        <button type="submit" className="place-order-btn">Place Order</button>
      </form>
    </section>
  )
}

function OrderConfirmed({ nav }) {
  return (
    <section className="confirmed">
      <div className="confirm-card">
        <span className="confirm-icon">✅</span>
        <h1>Order Confirmed!</h1>
        <p>Thank you. Your ScentQuest order has been placed.</p>
        <button className="continue-shopping" onClick={() => nav('home')}>Continue shopping</button>
      </div>
    </section>
  )
}
