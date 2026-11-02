import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check, ShoppingBag, ArrowRight, Heart, Sparkles, Clock } from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const { settings, showToast } = useSettings();
  const navigate = useNavigate();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants.find(v => v.is_default) || product.variants[0]
  );
  const [selectedFlavor, setSelectedFlavor] = useState<string>(
    product.flavors && product.flavors.length > 0 ? product.flavors[0] : ''
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const currentPrice = selectedVariant ? selectedVariant.price : (product.discount_price || product.price);

  const handleAddToCart = () => {
    const added = addToCart(product, selectedVariant, selectedFlavor || undefined, quantity);
    if (added) {
      showToast(`Added ${quantity}x "${product.name}" (${selectedVariant.name}) to cart!`);
      onClose();
    }
  };

  const handleBuyNow = () => {
    const added = addToCart(product, selectedVariant, selectedFlavor || undefined, quantity);
    if (added) {
      onClose();
      navigate('/checkout');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '820px', padding: 0, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          
          {/* Gallery Media */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ aspectRatio: '1/1', borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: 'var(--bg-primary)' }}>
              <img
                src={product.images[activeImageIndex] || product.images[0] || '/images/hero_cake.jpg'}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Thumbnail selector */}
            {product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      border: activeImageIndex === idx ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                      padding: 0,
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    <img src={img} alt={`Thumb ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details Form */}
          <div style={{ padding: '2rem 1.75rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--brand-secondary)', fontWeight: 700 }}>
                {product.cake_type || product.category}
              </span>
              {product.is_bestseller && (
                <span className="badge badge-caramel" style={{ fontSize: '0.7rem' }}>Bestseller</span>
              )}
              {product.is_demo && (
                <span className="badge badge-demo">Demo Catalog</span>
              )}
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.6rem' }}>
              {product.name}
            </h2>

            {/* Price display with variant updates */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--brand-primary)' }}>
                {settings.currency} {currentPrice}
              </span>
              {product.discount_price && product.price > currentPrice && (
                <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  {settings.currency} {product.price}
                </span>
              )}
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {product.description}
            </p>

            {/* Preparation time badge */}
            {product.prep_time && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-secondary)',
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem'
              }}>
                <Clock size={15} style={{ color: 'var(--brand-primary)' }} />
                <span>Preparation Notice: <strong>{product.prep_time}</strong></span>
              </div>
            )}

            {/* Size / Weight Variant selection */}
            {product.variants.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Select Size / Variant:</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        style={{
                          padding: '0.55rem 0.95rem',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: isSelected ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                          backgroundColor: isSelected ? 'var(--brand-accent-light)' : 'var(--bg-surface)',
                          color: isSelected ? 'var(--brand-primary)' : 'var(--text-primary)',
                          transition: 'all var(--transition-fast)'
                        }}
                      >
                        {v.name} &bull; {settings.currency} {v.price}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Flavor selection */}
            {product.flavors && product.flavors.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Available Flavor:</label>
                <select
                  value={selectedFlavor}
                  onChange={(e) => setSelectedFlavor(e.target.value)}
                  className="form-select"
                >
                  {product.flavors.map(flavor => (
                    <option key={flavor} value={flavor}>
                      {flavor}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quantity and Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', alignItems: 'center' }}>
              {/* Quantity Counter */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-surface)',
                height: '46px'
              }}>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 12px', fontSize: '1.1rem' }}
                >
                  -
                </button>
                <span style={{ fontWeight: 700, minWidth: '24px', textAlign: 'center', fontSize: '0.95rem' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 12px', fontSize: '1.1rem' }}
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="btn btn-primary"
                style={{ flexGrow: 1, height: '46px' }}
              >
                <ShoppingBag size={18} />
                <span>Add to Bag</span>
              </button>

              {/* Wishlist toggle */}
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className="btn btn-secondary btn-icon-only"
                style={{
                  height: '46px',
                  width: '46px',
                  color: isInWishlist(product.id) ? '#C62828' : 'var(--text-secondary)'
                }}
                title="Save to Wishlist"
              >
                <Heart size={20} fill={isInWishlist(product.id) ? '#C62828' : 'none'} />
              </button>
            </div>

            {/* Direct Buy Now button */}
            <button
              type="button"
              onClick={handleBuyNow}
              className="btn btn-secondary"
              style={{ marginTop: '0.75rem', width: '100%', borderColor: 'var(--brand-secondary)' }}
            >
              <span>Instant Buy Now</span>
              <ArrowRight size={16} />
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};
