import { useState } from 'react'
import { formatPrice } from '../lib/format.js'

export default function ProductPage({ product, onAddToCart, navigate }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0].label)
  const [selectedColor, setSelectedColor] = useState(product.colors[0].value)
  const [selectedScent, setSelectedScent] = useState(product.scents[0].label)
  const [selectedAddOns, setSelectedAddOns] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [mainImage, setMainImage] = useState(product.images[0])
  const [added, setAdded] = useState(false)

  const sizeMod = product.sizes.find((s) => s.label === selectedSize).priceMod
  const scentMod = product.scents.find((s) => s.label === selectedScent).priceMod
  const addOnsPrice = product.addOns.reduce(
    (sum, a) => (selectedAddOns.includes(a.id) ? sum + a.price : sum),
    0
  )
  const unitPrice = product.basePrice + sizeMod + scentMod + addOnsPrice
  const totalPrice = unitPrice * quantity

  const toggleAddOn = (id) => {
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleAddToCart = () => {
    onAddToCart({
      productId: product.id,
      name: product.name,
      size: selectedSize,
      color: selectedColor,
      scent: selectedScent,
      addOns: selectedAddOns,
      qty: quantity,
      unitPrice,
      image: mainImage,
    })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 2200)
  }

  return (
    <section className="product-page">
      <div className="section-inner product-layout">
        <button className="back-link" onClick={() => navigate('shop')}>
          ← Back to shop
        </button>
        <div className="product-gallery">
          <div className="main-image">
            <img src={mainImage} alt={product.name} />
          </div>
          <div className="thumbnails">
            {product.images.map((img, i) => (
              <button
                key={i}
                className={`thumb ${mainImage === img ? 'active' : ''}`}
                onClick={() => setMainImage(img)}
                aria-label={`View image ${i + 1} of ${product.name}`}
                aria-pressed={mainImage === img}
              >
                <img src={img} alt="" />
              </button>
            ))}
          </div>
        </div>

        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="product-desc">{product.desc}</p>

          <div className="picker-group">
            <label>Size</label>
            <div className="size-picker">
              {product.sizes.map((s) => (
                <button
                  key={s.label}
                  className={`size-btn ${selectedSize === s.label ? 'active' : ''}`}
                  onClick={() => setSelectedSize(s.label)}
                >
                  {s.label} {s.priceMod > 0 ? `+${formatPrice(s.priceMod)}` : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="picker-group">
            <label>Color</label>
            <div className="color-picker">
              {product.colors.map((c) => (
                <button
                  key={c.value}
                  className={`color-btn ${selectedColor === c.value ? 'active' : ''}`}
                  style={{ backgroundColor: c.hex }}
                  onClick={() => setSelectedColor(c.value)}
                  aria-label={c.label}
                />
              ))}
            </div>
          </div>

          <div className="picker-group">
            <label>Scent</label>
            <div className="scent-picker">
              {product.scents.map((s) => (
                <button
                  key={s.label}
                  className={`scent-btn ${selectedScent === s.label ? 'active' : ''}`}
                  onClick={() => setSelectedScent(s.label)}
                >
                  {s.label} {s.priceMod > 0 ? `+${formatPrice(s.priceMod)}` : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="picker-group">
            <label>Add-ons</label>
            <div className="addons-list">
              {product.addOns.map((a) => (
                <label key={a.id} className="addon-row">
                  <input
                    type="checkbox"
                    checked={selectedAddOns.includes(a.id)}
                    onChange={() => toggleAddOn(a.id)}
                  />
                  <span className="addon-label">{a.label}</span>
                  <span className="addon-price">+{formatPrice(a.price)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="picker-group qty-group">
            <label>Quantity</label>
            <div className="qty-picker">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                min={1}
                aria-label="Quantity"
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <div className="price-summary">
            <div className="price-row">
              <span>Unit price</span>
              <span>{formatPrice(unitPrice)}</span>
            </div>
            <div className="price-row total">
              <span>Total × {quantity}</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
          </div>

          <button
            className={`add-to-cart-btn ${added ? 'is-added' : ''}`}
            onClick={handleAddToCart}
          >
            {added ? 'Added to cart' : 'Add to cart'}
          </button>
          {added && (
            <button className="view-cart-btn" onClick={() => navigate('cart')}>
              View cart
            </button>
          )}
          <p className="product-footnote">
            Cash on delivery · Free delivery over ₹4,999 · Dispatch in 2 working days
          </p>
        </div>
      </div>
    </section>
  )
}
