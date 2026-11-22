const USERS_STORAGE_KEY = 'scentquest-users'
const SESSION_STORAGE_KEY = 'scentquest-user'
const ORDERS_STORAGE_KEY = 'scentquest-orders'

export const DEMO_CREDENTIALS = {
  email: 'demo@scentquest.com',
  password: 'ScentQuest123',
}

export const DEMO_USER = {
  id: 'demo-user',
  name: 'Priya Sharma',
  email: 'demo@scentquest.com',
  phone: '9876543210',
  dogName: 'Milo',
}

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase()
}

function toHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return toHex(new Uint8Array(digest))
}

function createSalt() {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return toHex(bytes)
}

function publicUser(account) {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    phone: account.phone,
    dogName: account.dogName || '',
  }
}

function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

export const DEMO_ORDERS = [
  {
    id: 'SQ-8N4K2L9M',
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'cash_on_delivery',
    createdAt: daysAgo(18),
    items: [
      {
        productId: 'snuffle-mat',
        name: 'Snuffle Snack Mat',
        size: 'Medium',
        color: 'forest',
        scent: 'Bacon',
        addOns: ['Scent training guide'],
        qty: 1,
        unitPrice: 1947,
      },
    ],
    subtotal: 1947,
    delivery: 199,
    total: 2146,
    customer: {
      name: 'Priya Sharma',
      phone: '9876543210',
      email: 'demo@scentquest.com',
      address: 'Flat 4B, Green Residency, 12 MG Road, Bengaluru',
      pincode: '560001',
    },
  },
  {
    id: 'SQ-5R7P1C6A',
    status: 'shipped',
    paymentStatus: 'pending',
    paymentMethod: 'cash_on_delivery',
    createdAt: daysAgo(4),
    items: [
      {
        productId: 'scent-puzzle',
        name: 'Scent Puzzle Box',
        size: 'One size',
        color: 'forest',
        scent: 'Bacon',
        addOns: [],
        qty: 1,
        unitPrice: 1998,
      },
      {
        productId: 'snuffle-mat',
        name: 'Snuffle Snack Mat',
        size: 'Small',
        color: 'sand',
        scent: 'Unscented',
        addOns: [],
        qty: 1,
        unitPrice: 1299,
      },
    ],
    subtotal: 3297,
    delivery: 199,
    total: 3496,
    customer: {
      name: 'Priya Sharma',
      phone: '9876543210',
      email: 'demo@scentquest.com',
      address: 'Flat 4B, Green Residency, 12 MG Road, Bengaluru',
      pincode: '560001',
    },
  },
  {
    id: 'SQ-3D9W4T2B',
    status: 'processing',
    paymentStatus: 'pending',
    paymentMethod: 'cash_on_delivery',
    createdAt: daysAgo(1),
    items: [
      {
        productId: 'trail-kit',
        name: 'Backyard Trail Kit',
        size: 'Starter',
        color: 'sand',
        scent: 'Unscented',
        addOns: ['Gift wrap'],
        qty: 1,
        unitPrice: 3198,
      },
    ],
    subtotal: 3198,
    delivery: 199,
    total: 3397,
    customer: {
      name: 'Priya Sharma',
      phone: '9876543210',
      email: 'demo@scentquest.com',
      address: 'Flat 4B, Green Residency, 12 MG Road, Bengaluru',
      pincode: '560001',
    },
  },
]

export async function createAccount({ name, email, phone, password }) {
  const normalizedEmail = normalizeEmail(email)
  const accounts = readStorage(USERS_STORAGE_KEY, [])
  const exists = accounts.some((account) => account.email === normalizedEmail)

  if (exists) {
    throw new Error('An account with this email already exists. Try signing in instead.')
  }

  const salt = createSalt()
  const account = {
    id: `usr-${Date.now().toString(36)}`,
    name: String(name).trim(),
    email: normalizedEmail,
    phone: String(phone).trim(),
    salt,
    passwordHash: await hashPassword(password, salt),
    createdAt: new Date().toISOString(),
  }

  accounts.push(account)
  writeStorage(USERS_STORAGE_KEY, accounts)
  return publicUser(account)
}

export async function authenticate(email, password) {
  const normalizedEmail = normalizeEmail(email)

  if (
    normalizedEmail === DEMO_CREDENTIALS.email &&
    password === DEMO_CREDENTIALS.password
  ) {
    return { ...DEMO_USER }
  }

  const accounts = readStorage(USERS_STORAGE_KEY, [])
  const account = accounts.find((entry) => entry.email === normalizedEmail)

  if (!account) {
    throw new Error('Email or password is incorrect.')
  }

  const passwordHash = await hashPassword(password, account.salt)
  if (passwordHash !== account.passwordHash) {
    throw new Error('Email or password is incorrect.')
  }

  return publicUser(account)
}

export function loadUserSession() {
  const user = readStorage(SESSION_STORAGE_KEY, null)
  if (!user || !user.email || !user.name) return null
  return user
}

export function saveUserSession(user) {
  writeStorage(SESSION_STORAGE_KEY, user)
  return user
}

export function clearUserSession() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY)
  } catch {
    return false
  }
  return true
}

export function getUserOrders(email) {
  const normalizedEmail = normalizeEmail(email)
  const localOrders = readStorage(ORDERS_STORAGE_KEY, [])
  const matchingOrders = Array.isArray(localOrders)
    ? localOrders.filter(
        (order) => normalizeEmail(order?.customer?.email) === normalizedEmail
      )
    : []
  const demoOrders = normalizedEmail === DEMO_USER.email ? DEMO_ORDERS : []
  const orders = [...matchingOrders, ...demoOrders]
  const uniqueOrders = new Map(orders.map((order) => [order.id, order]))

  return [...uniqueOrders.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function saveUserOrder(order) {
  const orders = readStorage(ORDERS_STORAGE_KEY, [])
  const list = Array.isArray(orders) ? orders : []
  const existingIndex = list.findIndex((entry) => entry.id === order.id)

  if (existingIndex >= 0) {
    list[existingIndex] = order
  } else {
    list.unshift(order)
  }

  writeStorage(ORDERS_STORAGE_KEY, list)
  return order
}
