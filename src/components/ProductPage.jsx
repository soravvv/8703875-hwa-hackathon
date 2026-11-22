import { useState } from 'react'

export default function ProductPage({ product, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0].label)
  const [selectedColor, setSelectedColor] = useState(product.colors[0].value)
  const [selectedScent, setSelectedScent] = useState(product.scents[0].label)
  const [selectedAddOns, setSelectedAddOns] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [mainImage, setMainImage] = useState(product.images[0])

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

  return (
    <section className="product-page">
      <div className="section-inner product-layout">
        <a
          href="#shop"
          className="back-link"
          onClick={(e) => { e.preventDefault(); window.location.hash = 'shop'; }}
        >
          ← Back to shop
        </a>
        <div className="product-gallery">
          <div className="main-image">
            <img src={mainImage} alt={product.name} />
          </div>
          <div className="thumbnails">
            {product.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={product.name}
                className={`thumb ${i === 0 ? 'active' : ''}`}
                onClick={() => setMainImage(img)}
              />
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
                  {s.label} {s.priceMod > 0 ? `+$${s.priceMod}` : ''}
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
                  {s.label} {s.priceMod > 0 ? `+$${s.priceMod}` : ''}
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
                  <span>{a.label} {a.price > 0 ? `+$${a.price}` : ''}</span>
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
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                min={1}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
              />
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>

          <div className="price-summary">
            <div className="price-row">
              <span>Unit price</span>
              <span>${unitPrice}</span>
            </div>
            <div className="price-row total">
              <span>Total × {quantity}</span>
              <span>${totalPrice}</span>
            </div>
          </div>

          <button
            className="add-to-cart-btn"
            onClick={() => {
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
            }}
          >
            Add to cart
          </button>
        </div>
      </div>
    </section>
  )
}
