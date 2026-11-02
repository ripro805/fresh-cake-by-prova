import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Heart, ShoppingBag, Star } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { QuickViewModal } from './QuickViewModal';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const { settings, showToast } = useSettings();
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const defaultVariant = product.variants.find(v => v.is_default) || product.variants[0];
  const displayPrice = defaultVariant ? defaultVariant.price : (product.discount_price || product.price);
  const hasDiscount = product.discount_price && product.price > displayPrice;
  const isSaved = isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If multiple variants or flavors exist, open quick view so user selects preferences
    if (product.variants.length > 1 || (product.flavors && product.flavors.length > 1)) {
      setQuickViewOpen(true);
    } else {
      const added = addToCart(product, defaultVariant, product.flavors?.[0], 1);
      if (added) {
        showToast(`Added "${product.name}" to your bag!`);
      }
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const toggled = toggleWishlist(product.id);
    if (toggled) {
      showToast(isSaved ? `Removed from wishlist` : `Saved to wishlist!`, 'info');
    }
  };

  return (
    <>
      <div className="product-card">
        {/* Media Container */}
        <div className="product-card-media">
          <Link to={`/product/${product.slug}`} style={{ display: 'block', width: '100%', height: '100%' }}>
            <img
              src={product.images[0] || '/images/hero_cake.jpg'}
              alt={product.name}
              className="product-card-img"
              loading="lazy"
            />
          </Link>

          {/* Badges on Top Left */}
          <div className="product-card-badges">
            {product.is_bestseller && (
              <span className="badge badge-caramel">Bestseller</span>
            )}
            {hasDiscount && (
              <span className="badge badge-gold">
                Save {Math.round(((product.price - displayPrice) / product.price) * 100)}%
              </span>
            )}
            {product.is_demo && (
              <span className="badge badge-demo">Sample</span>
            )}
          </div>

          {/* Actions on Top Right */}
          <div className="product-card-actions">
            <button
              onClick={handleWishlistToggle}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(4px)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isSaved ? '#C62828' : 'var(--text-primary)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform var(--transition-fast)'
              }}
              aria-label="Save to Wishlist"
              title="Save to Wishlist"
            >
              <Heart size={18} fill={isSaved ? '#C62828' : 'none'} />
            </button>

            <button
              onClick={() => setQuickViewOpen(true)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(4px)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform var(--transition-fast)'
              }}
              aria-label="Quick View"
              title="Quick View"
            >
              <Eye size={18} />
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="product-card-body">
          <div className="product-card-cat">
            {product.cake_type || product.category}
          </div>

          <Link to={`/product/${product.slug}`}>
            <h3 className="product-card-title">{product.name}</h3>
          </Link>

          <p className="product-card-desc">{product.description}</p>

          {/* Rating if exists */}
          {product.rating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.75rem', fontSize: '0.8rem', color: 'var(--brand-secondary)' }}>
              <div style={{ display: 'flex', color: '#D97706' }}>
                <Star size={13} fill="#D97706" />
              </div>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{product.rating}</span>
              {product.review_count && (
                <span style={{ color: 'var(--text-muted)' }}>({product.review_count})</span>
              )}
            </div>
          )}

          {/* Card Footer with Price & Add to Cart */}
          <div className="product-card-footer">
            <div className="product-price">
              <span className="price-current">
                {settings.currency} {displayPrice}
              </span>
              {hasDiscount && (
                <span className="price-original">
                  {settings.currency} {product.price}
                </span>
              )}
            </div>

            <button
              onClick={handleQuickAdd}
              className="btn btn-primary btn-sm"
              style={{ padding: '0.45rem 0.95rem' }}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag size={14} />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewOpen && (
        <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} />
      )}
    </>
  );
};
