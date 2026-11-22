const orders = []

export default function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(204).end()
  }

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'GET') {
    return res.status(200).json({ orders, count: orders.length })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, GET, OPTIONS')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const order = {
      id: 'scent-' + Date.now(),
      ...req.body,
      createdAt: new Date().toISOString(),
    }
    orders.push(order)
    return res.status(200).json({ ok: true, orderId: order.id })
  } catch (err) {
    return res.status(400).json({ error: 'Invalid order' })
  }
}
