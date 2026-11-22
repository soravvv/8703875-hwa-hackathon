import { useMemo, useState } from 'react'
import { formatPrice } from '../lib/format.js'
import {
  authenticate,
  createAccount,
  DEMO_CREDENTIALS,
} from '../lib/account.js'

const PRODUCT_IMAGES = {
  'snuffle-mat': '/images/scentquest-2-lifestyle-beagle.png',
  'scent-puzzle': '/images/scentquest-3-inside-cutaway.png',
  'trail-kit': '/images/scentquest-4-colours.png',
}

const STATUS_LABELS = {
  confirmed: 'Order confirmed',
  processing: 'Processing',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const COLOR_LABELS = {
  forest: 'Forest',
  slate: 'Slate',
  sand: 'Sand',
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function getInitials(name) {
  return String(name || 'User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

function getProductImage(productId) {
  return PRODUCT_IMAGES[productId] || '/images/scentquest-1-hero.png'
}

function getItemOptions(item) {
  return [
    item.size,
    COLOR_LABELS[item.color] || item.color,
    item.scent,
  ]
    .filter(Boolean)
    .join(' · ')
}

function StatusBadge({ status }) {
  return (
    <span className={`order-status status-${status || 'confirmed'}`}>
      <span aria-hidden="true" />
      {STATUS_LABELS[status] || 'Order confirmed'}
    </span>
  )
}

function AuthVisual({ mode = 'signin' }) {
  return (
    <div className="auth-visual">
      <img
        src="/images/scentquest-2-lifestyle-beagle.png"
        alt="A dog enjoying a ScentQuest scent game"
      />
      <div className="auth-visual-overlay">
        <span className="auth-visual-badge">ScentQuest members</span>
        <h2>
          {mode === 'signup'
            ? 'More curious days start here.'
            : 'Welcome back to better sniffers.'}
        </h2>
        <p>
          Track every scent kit, reorder in a tap, and keep your dog’s enrichment
          journey in one happy place.
        </p>
        <div className="auth-visual-proof">
          <div className="proof-avatars" aria-hidden="true">
            <span>PS</span>
            <span>MR</span>
            <span>CK</span>
          </div>
          <span>Loved by 2,000+ Indian dog parents</span>
        </div>
      </div>
    </div>
  )
}

export function SignInPage({ navigate, onAuthenticated }) {
  const [values, setValues] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')

    if (!values.email.trim()) {
      setError('Enter your email address.')
      return
    }
    if (!values.password) {
      setError('Enter your password.')
      return
    }

    setLoading(true)
    try {
      const user = await authenticate(values.email, values.password)
      onAuthenticated(user)
    } catch (authError) {
      setError(authError.message || 'We could not sign you in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const useDemoAccount = () => {
    setValues(DEMO_CREDENTIALS)
    setError('')
    setNotice('Demo details added. Sign in to explore the account area.')
  }

  return (
    <section className="auth-page">
      <div className="auth-shell">
        <AuthVisual />
        <div className="auth-form-panel">
          <div className="auth-form-heading">
            <span className="section-kicker">Your ScentQuest</span>
            <h1>Sign in</h1>
            <p>Welcome back. Your dog’s next adventure is waiting.</p>
          </div>

          {error && (
            <div className="form-error-banner auth-message" role="alert">
              {error}
            </div>
          )}
          {notice && (
            <div className="auth-success-message" role="status">
              {notice}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="signin-email">Email address</label>
              <input
                id="signin-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={values.email}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <div className="field-label-row">
                <label htmlFor="signin-password">Password</label>
                <button
                  className="field-action"
                  type="button"
                  onClick={() => setNotice('Password reset support is ready at hello@scentquest.example.')}
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="signin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={values.password}
                onChange={handleChange}
              />
            </div>

            <label className="auth-check-row">
              <input type="checkbox" defaultChecked />
              <span>Keep me signed in on this device</span>
            </label>

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in to my account'}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <button className="demo-login-btn" type="button" onClick={useDemoAccount}>
            <span className="demo-login-icon" aria-hidden="true">SQ</span>
            <span>
              <strong>Use the demo account</strong>
              <small>Explore with sample orders and a complete dashboard</small>
            </span>
          </button>

          <p className="auth-switch">
            New to ScentQuest?{' '}
            <button type="button" onClick={() => navigate('signup')}>
              Create an account
            </button>
          </p>
        </div>
      </div>
    </section>
  )
}

export function SignUpPage({ navigate, onAuthenticated }) {
  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setFormError('')
  }

  const validate = () => {
    const nextErrors = {}
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    const digits = values.phone.replace(/\D/g, '')

    if (values.name.trim().length < 2) nextErrors.name = 'Enter your full name.'
    if (!emailPattern.test(values.email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (digits.length !== 10) {
      nextErrors.phone = 'Enter a 10-digit phone number.'
    }
    if (values.password.length < 8) {
      nextErrors.password = 'Use at least 8 characters.'
    } else if (!/[A-Za-z]/.test(values.password) || !/[0-9]/.test(values.password)) {
      nextErrors.password = 'Include at least one letter and one number.'
    }
    if (values.confirmPassword !== values.password) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }
    if (!termsAccepted) nextErrors.terms = 'Accept the terms to continue.'

    return nextErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setFormError('Please fix the highlighted fields and try again.')
      return
    }

    setLoading(true)
    try {
      const user = await createAccount(values)
      onAuthenticated(user)
    } catch (error) {
      setFormError(error.message || 'We could not create your account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const passwordScore = [values.password.length >= 8, /[A-Z]/.test(values.password), /[0-9]/.test(values.password)].filter(Boolean).length

  return (
    <section className="auth-page">
      <div className="auth-shell signup-shell">
        <AuthVisual mode="signup" />
        <div className="auth-form-panel signup-panel">
          <div className="auth-form-heading">
            <span className="section-kicker">Join the pack</span>
            <h1>Create your account</h1>
            <p>Save your orders, track deliveries, and make every play session count.</p>
          </div>

          {formError && (
            <div className="form-error-banner auth-message" role="alert">
              {formError}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="signup-name">Full name</label>
              <input
                id="signup-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                value={values.name}
                onChange={handleChange}
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="signup-field-row">
              <div className="field">
                <label htmlFor="signup-email">Email address</label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={values.email}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="field">
                <label htmlFor="signup-phone">Phone number</label>
                <input
                  id="signup-phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="9876543210"
                  value={values.phone}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.phone)}
                />
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>
            </div>

            <div className="signup-field-row">
              <div className="field">
                <label htmlFor="signup-password">Password</label>
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={values.password}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.password)}
                />
                {values.password && (
                  <div className={`password-strength strength-${passwordScore}`}>
                    <span /><span /><span />
                    <small>{passwordScore === 3 ? 'Strong password' : 'Add uppercase and a number'}</small>
                  </div>
                )}
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              <div className="field">
                <label htmlFor="signup-confirm">Confirm password</label>
                <input
                  id="signup-confirm"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.confirmPassword)}
                />
                {errors.confirmPassword && (
                  <span className="field-error">{errors.confirmPassword}</span>
                )}
              </div>
            </div>

            <label className="auth-check-row terms-check">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(event) => {
                  setTermsAccepted(event.target.checked)
                  setErrors((current) => ({ ...current, terms: '' }))
                }}
              />
              <span>I agree to the Terms of Use and Privacy Policy.</span>
            </label>
            {errors.terms && <span className="field-error terms-error">{errors.terms}</span>}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? 'Creating your account…' : 'Create my account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <button type="button" onClick={() => navigate('sign-in')}>
              Sign in
            </button>
          </p>
        </div>
      </div>
    </section>
  )
}

function AccountLayout({
  active,
  user,
  navigate,
  onLogout,
  eyebrow,
  title,
  children,
}) {
  return (
    <section className="account-page">
      <div className="account-shell-layout">
        <aside className="account-sidebar">
          <div className="account-user">
            <span className="account-avatar">{getInitials(user.name)}</span>
            <span className="account-user-copy">
              <strong>{user.name}</strong>
              <small>{user.email}</small>
            </span>
          </div>

          <nav className="account-nav" aria-label="Account navigation">
            <button
              className={active === 'dashboard' ? 'active' : ''}
              onClick={() => navigate('dashboard')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" rx="2" />
                <rect x="14" y="3" width="7" height="7" rx="2" />
                <rect x="3" y="14" width="7" height="7" rx="2" />
                <rect x="14" y="14" width="7" height="7" rx="2" />
              </svg>
              Overview
            </button>
            <button
              className={active === 'orders' ? 'active' : ''}
              onClick={() => navigate('orders')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
              </svg>
              My orders
            </button>
          </nav>

          <div className="account-sidebar-foot">
            <div className="account-help-card">
              <span aria-hidden="true">?</span>
              <strong>Need a hand?</strong>
              <p>Our scent guides are happy to help.</p>
              <a href="mailto:hello@scentquest.example">Contact support</a>
            </div>
            <button className="account-logout" onClick={onLogout}>
              Sign out
            </button>
          </div>
        </aside>

        <div className="account-main">
          <header className="account-page-head">
            <div>
              <span className="section-kicker">{eyebrow}</span>
              <h1>{title}</h1>
            </div>
            <span className="account-greeting">Hi, {user.name.split(' ')[0]}</span>
          </header>
          {children}
        </div>
      </div>
    </section>
  )
}

function DashboardEmptyOrders({ navigate }) {
  return (
    <div className="dashboard-empty">
      <span className="dashboard-empty-icon" aria-hidden="true">✓</span>
      <div>
        <h3>No orders yet</h3>
        <p>Your first scent adventure is waiting.</p>
      </div>
      <button className="btn btn-primary" onClick={() => navigate('shop')}>
        Explore kits
      </button>
    </div>
  )
}

export function DashboardPage({ user, orders, navigate, onLogout, onReorder }) {
  const totalSpent = orders.reduce((sum, order) => sum + Number(order.total || 0), 0)
  const activeOrders = orders.filter(
    (order) => !['delivered', 'cancelled'].includes(order.status)
  ).length
  const points = Math.floor(totalSpent / 100)
  const recentOrder = orders[0]
  const dogName = user.dogName || 'your dog'

  return (
    <AccountLayout
      active="dashboard"
      user={user}
      navigate={navigate}
      onLogout={onLogout}
      eyebrow="Account overview"
      title={`Welcome back, ${user.name.split(' ')[0]}`}
    >
      <section className="dashboard-welcome">
        <div>
          <span className="dashboard-welcome-label">Your scent journey</span>
          <h2>Small adventures. Big-tail moments.</h2>
          <p>
            Keep track of every enrichment kit and find the next game for {dogName}.
          </p>
          <div className="dashboard-welcome-actions">
            <button className="btn btn-primary" onClick={() => navigate('shop')}>
              Shop new kits
            </button>
            <button className="btn btn-outline" onClick={() => navigate('orders')}>
              View all orders
            </button>
          </div>
        </div>
        <div className="dashboard-dog-card">
          <span className="dashboard-dog-avatar">{getInitials(dogName)}</span>
          <div>
            <small>Play companion</small>
            <strong>{dogName}</strong>
            <span>Curious explorer · Level 2</span>
          </div>
          <span className="dashboard-level-badge">Level 2</span>
        </div>
      </section>

      <section className="account-stats" aria-label="Account summary">
        <article>
          <span className="stat-icon stat-icon-green" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
            </svg>
          </span>
          <div><small>Total orders</small><strong>{orders.length}</strong></div>
        </article>
        <article>
          <span className="stat-icon stat-icon-gold" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 7h13v10H3zM16 10h3l2 3v4h-5z" />
              <circle cx="7" cy="19" r="2" />
              <circle cx="18" cy="19" r="2" />
            </svg>
          </span>
          <div><small>Active orders</small><strong>{activeOrders}</strong></div>
        </article>
        <article>
          <span className="stat-icon stat-icon-purple" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z" />
            </svg>
          </span>
          <div><small>Scent points</small><strong>{points}</strong></div>
        </article>
      </section>

      <div className="dashboard-grid">
        <section className="account-card recent-orders-card">
          <div className="account-card-head">
            <div>
              <span className="card-eyebrow">Latest activity</span>
              <h3>Recent order</h3>
            </div>
            {recentOrder && (
              <button className="card-link" onClick={() => navigate('orders')}>
                View all
              </button>
            )}
          </div>

          {recentOrder ? (
            <div className="recent-order">
              <div className="recent-order-top">
                <div className="recent-order-icon">
                  <img
                    src={getProductImage(recentOrder.items?.[0]?.productId)}
                    alt={recentOrder.items?.[0]?.name || 'ScentQuest order'}
                  />
                </div>
                <div className="recent-order-copy">
                  <span>Order {recentOrder.id}</span>
                  <h4>{recentOrder.items?.[0]?.name || 'ScentQuest kit'}</h4>
                  <p>
                    {recentOrder.items?.length || 0} item
                    {recentOrder.items?.length === 1 ? '' : 's'} · Placed {formatDate(recentOrder.createdAt)}
                  </p>
                </div>
                <StatusBadge status={recentOrder.status} />
              </div>
              <div className="recent-order-bottom">
                <strong>{formatPrice(recentOrder.total)}</strong>
                <button
                  className="btn btn-outline"
                  onClick={() => navigate(`order-details-${recentOrder.id}`)}
                >
                  View details
                </button>
              </div>
            </div>
          ) : (
            <DashboardEmptyOrders navigate={navigate} />
          )}
        </section>

        <section className="account-card scent-plan-card">
          <div className="account-card-head">
            <div>
              <span className="card-eyebrow">Weekly tip</span>
              <h3>Make scent work easier</h3>
            </div>
          </div>
          <div className="scent-plan-visual" aria-hidden="true">
            <span className="scent-plan-ring ring-one" />
            <span className="scent-plan-ring ring-two" />
            <span className="scent-plan-nose">⌁</span>
          </div>
          <p>
            Start in a low-distraction room and increase the challenge only when
            {dogName} finds the scent easily.
          </p>
          <button className="card-link card-link-arrow" onClick={() => navigate('shop')}>
            Explore scent toys <span aria-hidden="true">→</span>
          </button>
        </section>
      </div>

      {recentOrder && (
        <section className="dashboard-reorder-banner">
          <div>
            <span className="dashboard-welcome-label">Ready for round two?</span>
            <h3>Bring back a favourite scent game.</h3>
          </div>
          <button className="btn btn-primary" onClick={() => onReorder(recentOrder)}>
            Reorder {recentOrder.items?.[0]?.name || 'items'}
          </button>
        </section>
      )}
    </AccountLayout>
  )
}

function OrderListCard({ order, navigate, onReorder }) {
  const firstItem = order.items?.[0]

  return (
    <article className="order-list-card">
      <div className="order-list-head">
        <div>
          <span>Order {order.id}</span>
          <small>Placed on {formatDate(order.createdAt)}</small>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="order-list-items">
        <div className="order-thumbnails">
          {(order.items || []).slice(0, 3).map((item, index) => (
            <img
              key={`${item.productId}-${index}`}
              src={getProductImage(item.productId)}
              alt={item.name}
            />
          ))}
        </div>
        <div className="order-list-copy">
          <h3>{firstItem?.name || 'ScentQuest kit'}</h3>
          <p>
            {(order.items || []).length} item
            {(order.items || []).length === 1 ? '' : 's'} ·{' '}
            {order.items?.length === 1 ? getItemOptions(firstItem) : 'Multiple scent toys'}
          </p>
        </div>
        <strong className="order-list-total">{formatPrice(order.total)}</strong>
      </div>

      <div className="order-list-actions">
        <button
          className="btn btn-primary"
          onClick={() => navigate(`order-details-${order.id}`)}
        >
          View order details
        </button>
        <button className="btn btn-outline" onClick={() => onReorder(order)}>
          Reorder items
        </button>
      </div>
    </article>
  )
}

export function OrdersPage({ user, orders, navigate, onLogout, onReorder }) {
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return orders.filter((order) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'active' && !['delivered', 'cancelled'].includes(order.status)) ||
        order.status === filter
      const matchesQuery =
        !normalizedQuery ||
        order.id.toLowerCase().includes(normalizedQuery) ||
        (order.items || []).some((item) => item.name.toLowerCase().includes(normalizedQuery))
      return matchesFilter && matchesQuery
    })
  }, [filter, orders, query])

  const filters = [
    { id: 'all', label: 'All orders', count: orders.length },
    {
      id: 'active',
      label: 'Active',
      count: orders.filter((order) => !['delivered', 'cancelled'].includes(order.status)).length,
    },
    {
      id: 'delivered',
      label: 'Delivered',
      count: orders.filter((order) => order.status === 'delivered').length,
    },
  ]

  return (
    <AccountLayout
      active="orders"
      user={user}
      navigate={navigate}
      onLogout={onLogout}
      eyebrow="Purchase history"
      title="My orders"
    >
      <section className="orders-toolbar">
        <div className="order-filter-tabs" role="group" aria-label="Filter orders">
          {filters.map((item) => (
            <button
              key={item.id}
              className={filter === item.id ? 'active' : ''}
              onClick={() => setFilter(item.id)}
            >
              {item.label} <span>{item.count}</span>
            </button>
          ))}
        </div>
        <label className="order-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
          <input
            type="search"
            placeholder="Search order or product"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </section>

      {filteredOrders.length > 0 ? (
        <div className="order-list">
          {filteredOrders.map((order) => (
            <OrderListCard
              key={order.id}
              order={order}
              navigate={navigate}
              onReorder={onReorder}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state orders-empty">
          <span className="empty-icon" aria-hidden="true">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
            </svg>
          </span>
          <h2>{orders.length === 0 ? 'No orders yet' : 'No matching orders'}</h2>
          <p>
            {orders.length === 0
              ? 'Once you order a scent kit, it will appear here.'
              : 'Try another filter or search term.'}
          </p>
          {orders.length === 0 && (
            <button className="btn btn-primary" onClick={() => navigate('shop')}>
              Shop scent toys
            </button>
          )}
        </div>
      )}
    </AccountLayout>
  )
}

function deliveryIndex(status) {
  if (status === 'confirmed') return 0
  if (status === 'processing') return 1
  if (status === 'packed') return 2
  if (status === 'shipped') return 3
  if (status === 'delivered') return 4
  return -1
}

function DeliveryTimeline({ order }) {
  const steps = [
    { title: 'Order confirmed', text: 'We received your order' },
    { title: 'Preparing', text: 'Your kit is being packed' },
    { title: 'Packed', text: 'Packed with care' },
    { title: 'Shipped', text: 'On the way to you' },
    { title: 'Delivered', text: 'Ready for sniff time' },
  ]
  const currentIndex = deliveryIndex(order.status)

  if (order.status === 'cancelled') {
    return (
      <div className="cancelled-notice">
        This order was cancelled. No payment was collected.
      </div>
    )
  }

  return (
    <div className="delivery-timeline">
      {steps.map((step, index) => {
        const state = index < currentIndex ? 'complete' : index === currentIndex ? 'current' : 'upcoming'
        return (
          <div key={step.title} className={`timeline-step timeline-${state}`}>
            <span className="timeline-dot">{index < currentIndex ? '✓' : index + 1}</span>
            <div>
              <strong>{step.title}</strong>
              <small>{step.text}</small>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function downloadInvoice(order) {
  const lines = [
    'ScentQuest order invoice',
    `Order: ${order.id}`,
    `Placed: ${formatDateTime(order.createdAt)}`,
    '',
    ...(order.items || []).map(
      (item) => `${item.name} × ${item.qty} — ${formatPrice(item.unitPrice * item.qty)}`
    ),
    '',
    `Subtotal: ${formatPrice(order.subtotal || 0)}`,
    `Delivery: ${order.delivery === 0 ? 'FREE' : formatPrice(order.delivery || 0)}`,
    `Total: ${formatPrice(order.total || 0)}`,
    `Payment: Cash on delivery`,
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${order.id}-invoice.txt`
  link.click()
  URL.revokeObjectURL(url)
}

export function OrderDetailsPage({
  user,
  order,
  navigate,
  onLogout,
  onReorder,
}) {
  if (!order) {
    return (
      <AccountLayout
        active="orders"
        user={user}
        navigate={navigate}
        onLogout={onLogout}
        eyebrow="Order details"
        title="Order not found"
      >
        <div className="empty-state orders-empty">
          <span className="empty-icon" aria-hidden="true">404</span>
          <h2>We could not find that order</h2>
          <p>It may have been removed or the link may be incorrect.</p>
          <button className="btn btn-primary" onClick={() => navigate('orders')}>
            Back to my orders
          </button>
        </div>
      </AccountLayout>
    )
  }

  const customer = order.customer || {}
  const estimatedDelivery = order.status === 'delivered'
    ? `Delivered on ${formatDate(order.createdAt)}`
    : order.status === 'shipped'
      ? 'Estimated delivery in 2–4 working days'
      : 'Preparing for dispatch'

  return (
    <AccountLayout
      active="orders"
      user={user}
      navigate={navigate}
      onLogout={onLogout}
      eyebrow="Order details"
      title={`Order ${order.id}`}
    >
      <button className="account-back-link" onClick={() => navigate('orders')}>
        ← Back to all orders
      </button>

      <section className="order-status-hero">
        <div>
          <StatusBadge status={order.status} />
          <h2>{estimatedDelivery}</h2>
          <p>Placed on {formatDateTime(order.createdAt)}</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => document.getElementById('order-tracking')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Track this order
        </button>
      </section>

      <div className="order-detail-layout">
        <div className="order-detail-main">
          <section className="account-card order-tracking-card" id="order-tracking">
            <div className="account-card-head">
              <div>
                <span className="card-eyebrow">Delivery progress</span>
                <h3>Track your order</h3>
              </div>
            </div>
            <DeliveryTimeline order={order} />
          </section>

          <section className="account-card order-items-card">
            <div className="account-card-head">
              <div>
                <span className="card-eyebrow">In this order</span>
                <h3>Items ({order.items?.length || 0})</h3>
              </div>
            </div>
            <div className="detail-item-list">
              {(order.items || []).map((item, index) => (
                <div className="detail-item" key={`${item.productId}-${index}`}>
                  <img
                    src={getProductImage(item.productId)}
                    alt={item.name}
                  />
                  <div className="detail-item-copy">
                    <h4>{item.name}</h4>
                    <p>{getItemOptions(item)}</p>
                    {(item.addOns?.length > 0) && (
                      <small>+ {item.addOns.join(', ')}</small>
                    )}
                    <span>Qty: {item.qty}</span>
                  </div>
                  <strong>{formatPrice(item.unitPrice * item.qty)}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="account-card delivery-address-card">
            <div className="account-card-head">
              <div>
                <span className="card-eyebrow">Destination</span>
                <h3>Delivery address</h3>
              </div>
            </div>
            <div className="address-block">
              <span className="address-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
              </span>
              <div>
                <strong>{customer.name || user.name}</strong>
                <p>{customer.address || 'Address available after checkout'}</p>
                <p>Pincode {customer.pincode || '—'} · {customer.phone || user.phone}</p>
              </div>
            </div>
          </section>
        </div>

        <aside className="order-detail-side">
          <section className="account-card order-payment-card">
            <div className="account-card-head">
              <div>
                <span className="card-eyebrow">Payment</span>
                <h3>Order summary</h3>
              </div>
            </div>
            <div className="detail-total-row">
              <span>Subtotal</span>
              <strong>{formatPrice(order.subtotal || 0)}</strong>
            </div>
            <div className="detail-total-row">
              <span>Delivery</span>
              <strong className={order.delivery === 0 ? 'free-text' : ''}>
                {order.delivery === 0 ? 'FREE' : formatPrice(order.delivery || 0)}
              </strong>
            </div>
            <div className="detail-total-row detail-total-grand">
              <span>Total</span>
              <strong>{formatPrice(order.total || 0)}</strong>
            </div>
            <div className="payment-method-row">
              <span className="payment-icon" aria-hidden="true">₹</span>
              <div>
                <strong>Cash on delivery</strong>
                <small>
                  {order.paymentStatus === 'paid' ? 'Payment collected' : 'Payment due on delivery'}
                </small>
              </div>
            </div>
            <button className="detail-action-btn" onClick={() => downloadInvoice(order)}>
              Download invoice
            </button>
            <button className="detail-action-btn" onClick={() => onReorder(order)}>
              Reorder these items
            </button>
          </section>

          <section className="account-card order-help-card">
            <span className="order-help-icon" aria-hidden="true">?</span>
            <div>
              <h3>Need help with this order?</h3>
              <p>Our support team can help with delivery, returns, or product questions.</p>
              <a href="mailto:hello@scentquest.example">Contact support</a>
            </div>
          </section>
        </aside>
      </div>
    </AccountLayout>
  )
}
