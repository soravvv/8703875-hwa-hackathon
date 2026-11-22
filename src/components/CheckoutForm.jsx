import { useState } from 'react'
import { formatPrice } from '../lib/format.js'
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  normalizePhone,
  validateField,
  validateItems,
} from '../lib/validate.js'

const initialValues = {
  name: '',
  phone: '',
  email: '',
  address: '',
  pincode: '',
}

export default function CheckoutForm({
  cart,
  subtotal,
  delivery,
  total,
  onBack,
  onSuccess,
}) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.COD)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const itemsError = validateItems(cart)

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((t) => ({ ...t, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
  }

  const validateAll = () => {
    const next = {}
    for (const key of Object.keys(initialValues)) {
      const message = validateField(key, values[key])
      if (message) next[key] = message
    }
    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')

    const nextErrors = validateAll()
    setTouched(Object.fromEntries(Object.keys(initialValues).map((k) => [k, true])))
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      const first = Object.keys(nextErrors)[0]
      document.querySelector(`[name="${first}"]`)?.focus()
      return
    }

    if (itemsError) {
      setServerError(itemsError)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          customer: {
            ...values,
            phone: normalizePhone(values.phone),
            paymentMethod,
          },
        }),
      })

      let data = {}
      try {
        data = await res.json()
      } catch {
        data = {}
      }

      if (!res.ok) {
        if (data.errors && typeof data.errors === 'object') {
          setErrors((prev) => ({ ...prev, ...data.errors }))
          setTouched((prev) => ({
            ...prev,
            ...Object.fromEntries(Object.keys(data.errors).map((k) => [k, true])),
          }))
        }
        setServerError(data.error || `Could not place your order (error ${res.status})`)
        return
      }

      onSuccess({ orderId: data.orderId, order: data.order || null })
    } catch {
      setServerError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (cart.length === 0) {
    return (
      <section className="checkout">
        <div className="page-head">
          <div>
            <span className="section-kicker">Checkout</span>
            <h1>Checkout</h1>
          </div>
          <button className="btn btn-outline" onClick={onBack} type="button">
            ← Back to cart
          </button>
        </div>
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
            </svg>
          </span>
          <h2>There is nothing to check out</h2>
          <p>Your cart is empty. Add a kit and come back here to place your order.</p>
          <button className="btn btn-primary" onClick={onBack}>
            Return to cart
          </button>
        </div>
      </section>
    )
  }

  const showError = (name) => (touched[name] ? errors[name] : '')

  return (
    <section className="checkout">
      <div className="page-head">
        <div>
          <span className="section-kicker">Checkout</span>
          <h1>Checkout</h1>
          <p className="page-sub">Pay in cash when your order arrives. No advance payment needed.</p>
        </div>
        <button className="btn btn-outline" onClick={onBack} type="button">
          ← Back to cart
        </button>
      </div>

      {serverError && (
        <div className="form-error-banner" role="alert">
          <strong>We could not place your order.</strong>
          <span>{serverError}</span>
        </div>
      )}

      <div className="checkout-grid">
        <form onSubmit={handleSubmit} className="checkout-form" noValidate>
          <div className="field-row-2">
            <div className={`field ${showError('name') ? 'invalid' : ''}`}>
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Priya Sharma"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={Boolean(showError('name'))}
              />
              {showError('name') && <span className="field-error">{showError('name')}</span>}
            </div>

            <div className={`field ${showError('phone') ? 'invalid' : ''}`}>
              <label htmlFor="phone">Phone number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="9876543210"
                value={values.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={Boolean(showError('phone'))}
              />
              {showError('phone') && <span className="field-error">{showError('phone')}</span>}
            </div>
          </div>

          <div className={`field ${showError('email') ? 'invalid' : ''}`}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="priya@example.com"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={Boolean(showError('email'))}
            />
            {showError('email') && <span className="field-error">{showError('email')}</span>}
          </div>

          <div className={`field ${showError('address') ? 'invalid' : ''}`}>
            <label htmlFor="address">Delivery address</label>
            <textarea
              id="address"
              name="address"
              rows={3}
              autoComplete="street-address"
              placeholder="Flat 4B, Green Residency, 12 MG Road"
              value={values.address}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={Boolean(showError('address'))}
            />
            {showError('address') && <span className="field-error">{showError('address')}</span>}
          </div>

          <div className={`field field-pincode ${showError('pincode') ? 'invalid' : ''}`}>
            <label htmlFor="pincode">Pincode</label>
            <input
              id="pincode"
              name="pincode"
              type="text"
              inputMode="numeric"
              maxLength={6}
              autoComplete="postal-code"
              placeholder="560001"
              value={values.pincode}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={Boolean(showError('pincode'))}
            />
            {showError('pincode') && <span className="field-error">{showError('pincode')}</span>}
          </div>

          <div className="field">
            <label>Payment method</label>
            <label className={`cod-option ${paymentMethod === PAYMENT_METHODS.COD ? 'active' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value={PAYMENT_METHODS.COD}
                checked={paymentMethod === PAYMENT_METHODS.COD}
                onChange={() => setPaymentMethod(PAYMENT_METHODS.COD)}
              />
              <span>
                <span className="cod-title">{PAYMENT_METHOD_LABELS[PAYMENT_METHODS.COD]}</span>
                <span className="cod-hint">Pay the delivery partner when your order arrives.</span>
              </span>
            </label>
          </div>

          <button type="submit" className="place-order-btn" disabled={submitting}>
            {submitting ? 'Placing order…' : `Place Order · ${formatPrice(total)}`}
          </button>
        </form>

        <div className="order-summary">
          <h3>Order Summary</h3>
          {cart.map((item, i) => (
            <div key={i} className="summary-item">
              <span>{item.name} × {item.qty}</span>
              <span>{formatPrice(item.unitPrice * item.qty)}</span>
            </div>
          ))}
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <span className={delivery === 0 ? 'free-text' : ''}>
              {delivery === 0 ? 'FREE' : formatPrice(delivery)}
            </span>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
