const ORDER_PREFIX = 'orders/'
const MAX_LISTED_ORDERS = 25

const memoryOrders = new Map()

let blobPromise = null

function loadBlob() {
  if (!blobPromise) {
    blobPromise = (async () => {
      if (!process.env.BLOB_READ_WRITE_TOKEN) return null
      try {
        return await import('@vercel/blob')
      } catch {
        return null
      }
    })()
  }
  return blobPromise
}

function pathnameFor(id) {
  return `${ORDER_PREFIX}${id}.json`
}

export async function saveOrder(order) {
  memoryOrders.set(order.id, order)
  const blob = await loadBlob()
  if (!blob) return false
  try {
    await blob.put(pathnameFor(order.id), JSON.stringify(order), {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    })
    return true
  } catch {
    return false
  }
}

export async function getOrder(id) {
  const blob = await loadBlob()
  if (blob) {
    try {
      const result = await blob.get(pathnameFor(id), { access: 'private' })
      if (result.statusCode === 200) {
        const text = await new Response(result.stream).text()
        return JSON.parse(text)
      }
    } catch {
      /* fall back to the in-memory copy */
    }
  }
  return memoryOrders.get(id) || null
}

export async function listOrders() {
  const found = new Map(memoryOrders)
  const blob = await loadBlob()
  if (blob) {
    try {
      const listed = await blob.list({ prefix: ORDER_PREFIX, limit: MAX_LISTED_ORDERS })
      const loaded = await Promise.all(
        listed.blobs.map(async (entry) => {
          try {
            const result = await blob.get(entry.pathname, { access: 'private' })
            if (result.statusCode !== 200) return null
            const text = await new Response(result.stream).text()
            return JSON.parse(text)
          } catch {
            return null
          }
        })
      )
      for (const order of loaded) {
        if (order && order.id) found.set(order.id, order)
      }
    } catch {
      /* fall back to the in-memory copy */
    }
  }
  return [...found.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}
