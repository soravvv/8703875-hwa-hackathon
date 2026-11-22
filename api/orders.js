import { randomUUID } from 'node:crypto'
import { getOrder, listOrders, saveOrder } from './_store.js'

const FREE_DELIVERY_THRESHOLD = 4999
const DELIVERY_FEE = 199
const MAX_ITEMS = 50
const MAX_BODY_BYTES = 64 * 1024

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PINCODE_RE = /^[0-9]{6}$/

function normalizePhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1)
  return digits
}

function validateField(name, rawValue) {
  const value = String(rawValue ?? '').trim()

  if (name === 'name') {
    if (!value) return 'Full name is required'
    if (value.length < 2) return 'Full name must be at least 2 characters'
    if (value.length > 60) return 'Full name must be under 60 characters'
    if (!/[a-zA-Z]/.test(value)) return 'Full name must contain letters'
    return ''
  }

  if (name === 'phone') {
    if (!value) return 'Phone number is required'
    const digits = normalizePhone(value)
    if (digits.length !== 10) return 'Phone number must be 10 digits'
    if (!/^[6-9]/.test(digits)) return 'Phone number must start with 6, 7, 8 or 9'
    return ''
  }

  if (name === 'email') {
    if (!value) return 'Email is required'
    if (value.length > 120) return 'Email must be under 120 characters'
    if (!EMAIL_RE.test(value)) return 'Enter a valid email address'
    return ''
  }

  if (name === 'address') {
    if (!value) return 'Delivery address is required'
    if (value.length < 10) return 'Address must be at least 10 characters'
    if (value.length > 250) return 'Address must be under 250 characters'
    return ''
  }

  if (name === 'pincode') {
    if (!value) return 'Pincode is required'
    if (!PINCODE_RE.test(value)) return 'Pincode must be exactly 6 digits'
    return ''
  }

  return ''
}

function validatePayload(body) {
  const errors = {}

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { errors: { body: 'Request body must be an order object' }, fatal: true }
  }

  const customer = body.customer
  if (!customer || typeof customer !== 'object' || Array.isArray(customer)) {
    errors.customer = 'Customer details are required'
  } else {
    for (const key of ['name', 'phone', 'email', 'address', 'pincode']) {
      const message = validateField(key, customer[key])
      if (message) errors[key] = message
    }
    if (!customer.paymentMethod) {
      errors.paymentMethod = 'Payment method is required'
    } else if (customer.paymentMethod !== 'cash_on_delivery') {
      errors.paymentMethod = 'Only cash on delivery is available right now'
    }
  }

  const items = body.items
  if (!Array.isArray(items) || items.length === 0) {
    errors.items = 'Your cart is empty'
  } else if (items.length > MAX_ITEMS) {
    errors.items = 'Too many items in one order'
  } else {
    for (const item of items) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        errors.items = 'Invalid cart item'
        break
      }
      if (typeof item.productId !== 'string' || !item.productId.trim()) {
        errors.items = 'Invalid cart item'
        break
      }
      if (typeof item.name !== 'string' || !item.name.trim()) {
        errors.items = 'Invalid cart item'
        break
      }
      const qty = Number(item.qty)
      if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
        errors.items = 'Invalid item quantity'
        break
      }
      const price = Number(item.unitPrice)
      if (!Number.isFinite(price) || price < 0 || price > 1000000) {
        errors.items = 'Invalid item price'
        break
      }
    }
  }

  return { errors, fatal: false }
}

function buildOrder(body) {
  const items = body.items.map((item) => ({
    productId: String(item.productId).trim(),
    name: String(item.name).trim(),
    size: item.size ? String(item.size).trim() : null,
    color: item.color ? String(item.color).trim() : null,
    scent: item.scent ? String(item.scent).trim() : null,
    addOns: Array.isArray(item.addOns) ? item.addOns.map((a) => String(a).trim()) : [],
    qty: Number(item.qty),
    unitPrice: Number(item.unitPrice),
  }))

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0)
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const total = subtotal + delivery

  const customer = body.customer

  return {
    id: `SQ-${randomUUID().slice(0, 8).toUpperCase()}`,
    items,
    subtotal,
    delivery,
    total,
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'pending',
    status: 'confirmed',
    customer: {
      name: String(customer.name).trim(),
      phone: normalizePhone(customer.phone),
      email: String(customer.email).trim().toLowerCase(),
      address: String(customer.address).trim(),
      pincode: String(customer.pincode).trim(),
    },
    createdAt: new Date().toISOString(),
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method === 'GET') {
    const id = req.query?.id
    if (id) {
      const order = await getOrder(id)
      if (!order) {
        return res.status(404).json({ error: 'Order not found' })
      }
      return res.status(200).json({ order })
    }
    const orders = await listOrders()
    return res.status(200).json({ orders, count: orders.length })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, GET, OPTIONS')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const contentType = req.headers['content-type'] || ''
  if (contentType && !contentType.includes('application/json')) {
    return res.status(415).json({ error: 'Content-Type must be application/json' })
  }

  const raw = typeof req.body === 'string' ? req.body : null
  if (raw && raw.length > MAX_BODY_BYTES) {
    return res.status(413).json({ error: 'Request body is too large' })
  }

  let body = req.body
  if (raw) {
    try {
      body = JSON.parse(raw)
    } catch {
      return res.status(400).json({
        error: 'Request body is not valid JSON',
        errors: { body: 'Request body is not valid JSON' },
      })
    }
  }

  const { errors, fatal } = validatePayload(body)
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      error: fatal ? 'Invalid request' : 'Please fix the highlighted fields and try again',
      errors,
    })
  }

  try {
    const order = buildOrder(body)
    await saveOrder(order)
    return res.status(201).json({
      ok: true,
      orderId: order.id,
      order,
    })
  } catch {
    return res.status(500).json({ error: 'Could not save the order. Please try again.' })
  }
}
