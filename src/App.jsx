import { useState, useEffect } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'

const products = [
  {
    id: 'snuffle-mat',
    name: 'Snuffle Snack Mat',
    price: 24,
    desc: 'Hide treats in the fleece folds for nose-work fun.',
    image: '🧺',
  },
  {
    id: 'scent-puzzle',
    name: 'Scent Puzzle Box',
    price: 18,
    desc: 'Slide covers to reveal hidden scented compartments.',
    image: '🧩',
  },
  {
    id: 'trail-kit',
    name: 'Backyard Trail Kit',
    price: 32,
    desc: 'Scent markers to lay a tracking trail outdoors.',
    image: '🏞️',
  },
  {
    id: 'lick-mat',
    name: 'Calm Lick Mat',
    price: 12,
    desc: 'Spread peanut butter for a soothing lick session.',
    image: '🐾',
  },
]

export default function App() {
  const [cart, setCart] = useState([])
  const [page, setPage] = useState('shop')

  useEffect(() => {
    const onHashChange = () => {
      const h = window.location.hash.replace(/^#/, '')
      if (h === 'cart') setPage('cart')
      else if (h === 'checkout') setPage('checkout')
      else setPage('shop')
    }
    window.addEventListener('hashchange', onHashChange)
    onHashChange()
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)

  const addToCart = (id) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === id)
      if (existing) {
        return prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i))
      }
      return [...prev, { id, qty: 1 }]
    })
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
      <Header cartCount={cartCount} onCartClick={() => (window.location.hash = 'cart')} />
      <main className="page">
        {page === 'shop' && <Shop products={products} addToCart={addToCart} />}
        {page === 'cart' && <Cart cart={cart} removeFromCart={removeFromCart} changeQty={changeQty} subtotal={subtotal} />}
        {page === 'checkout' && <Checkout cart={cart} subtotal={subtotal} onSubmit={handleCheckout} />}
        {page === 'order-confirmed' && <OrderConfirmed />}
      </main>
      <Footer />
    </div>
  )
}

function Shop({ products, addToCart }) {
  return (
    <section className="shop">
      <h1>Shop</h1>
      <p className="shop-intro">Scent-driven enrichment for curious dogs.</p>
      <div className="product-grid">
        {products.map((p) => (
          <article key={p.id} className="product-card">
            <div className="product-image">{p.image}</div>
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

function Cart({ cart, removeFromCart, changeQty, subtotal }) {
  return (
    <section className="cart">
      <h1>Your Cart</h1>
      {cart.length === 0 ? (
        <p className="empty">Your cart is empty. <span className="empty-link" onClick={() => (window.location.hash = '')}>Browse products</span></p>
      ) : (
        <>
          <div className="cart-list">
            {cart.map((item) => {
              const p = products.find((p) => p.id === item.id)
              return (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <span className="cart-item-image">{p.image}</span>
                    <div>
                      <div className="cart-item-name">{p.name}</div>
                      <div className="cart-item-price">${p.price}</div>
                    </div>
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
            <button className="checkout-btn" disabled={cart.length === 0} onClick={() => (window.location.hash = 'checkout')}>
              Proceed to checkout
            </button>
          </div>
        </>
      )}
    </section>
  )
}

function Checkout({ cart, subtotal, onSubmit }) {
  return (
    <section className="checkout">
      <h1>Checkout</h1>
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

function OrderConfirmed() {
  return (
    <section className="confirmed">
      <div className="confirm-card">
        <span className="confirm-icon">✅</span>
        <h1>Order Confirmed!</h1>
        <p>Thank you. Your ScentQuest order has been placed.</p>
        <button className="continue-shopping" onClick={() => (window.location.hash = '')}>Continue shopping</button>
      </div>
    </section>
  )
}