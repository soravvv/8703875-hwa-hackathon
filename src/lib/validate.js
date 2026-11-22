export const PAYMENT_METHODS = {
  COD: 'cash_on_delivery',
}

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.COD]: 'Cash on Delivery',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PINCODE_RE = /^[0-9]{6}$/

export const FIELD_LABELS = {
  name: 'Full name',
  phone: 'Phone number',
  email: 'Email',
  address: 'Delivery address',
  pincode: 'Pincode',
}

export function normalizePhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1)
  return digits
}

export function validateField(name, rawValue) {
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

export function validateCustomer(customer = {}) {
  const errors = {}
  for (const key of Object.keys(FIELD_LABELS)) {
    const message = validateField(key, customer[key])
    if (message) errors[key] = message
  }
  if (!customer.paymentMethod) {
    errors.paymentMethod = 'Payment method is required'
  } else if (customer.paymentMethod !== PAYMENT_METHODS.COD) {
    errors.paymentMethod = 'Only cash on delivery is available right now'
  }
  return errors
}

export function validateItems(items) {
  if (!Array.isArray(items) || items.length === 0) return 'Your cart is empty'
  if (items.length > 50) return 'Too many items in one order'
  for (const item of items) {
    if (!item || typeof item !== 'object') return 'Invalid cart item'
    if (typeof item.productId !== 'string' || !item.productId.trim()) {
      return 'Invalid cart item'
    }
    const qty = Number(item.qty)
    if (!Number.isInteger(qty) || qty < 1 || qty > 99) return 'Invalid item quantity'
    const price = Number(item.unitPrice)
    if (!Number.isFinite(price) || price < 0) return 'Invalid item price'
  }
  return ''
}
