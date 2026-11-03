import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Heart, 
  ArrowLeft, 
  Clock, 
  ShieldCheck, 
  Share2, 
  Star, 
  MessageCircle, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { storeService } from '../services/storeService';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { ProductCard } from '../components/product/ProductCard';
import { BrandLogo } from '../components/common/BrandLogo';
import { getWhatsAppUrl } from '../lib/whatsapp';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const { settings, showToast } = useSettings();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedFlavor, setSelectedFlavor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>('');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      setLoading(true);
      const found = await storeService.getProductBySlug(slug);
      if (found) {
        setProduct(found);
        setActiveImage(found.images[0] || '/images/hero_cake.jpg');
        const defaultVar = found.variants.find(v => v.is_default) || found.variants[0];
        setSelectedVariant(defaultVar);
        setSelectedFlavor(found.flavors && found.flavors.length > 0 ? found.flavors[0] : '');

        // Fetch related products in same category
        const all = await storeService.getProducts();
        const related = all.filter(p => p.id !== found.id && p.category === found.category).slice(0, 4);
        setRelatedProducts(related);
      }
      setLoading(false);
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--brand-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading delicious bakehouse details...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!product || !selectedVariant) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <h2>Product Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          The requested cake or bakery item might have moved or been updated.
        </p>
        <Link to="/shop" className="btn btn-primary">
          <span>Return to Shop</span>
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant.price;
  const isSaved = isInWishlist(product.id);

  const handleAddToCart = () => {
    const added = addToCart(product, selectedVariant, selectedFlavor || undefined, quantity);
    if (added) {
      showToast(`Added ${quantity}x "${product.name}" to your bag!`);
    }
  };

  const handleBuyNow = () => {
    const added = addToCart(product, selectedVariant, selectedFlavor || undefined, quantity);
    if (added) {
      navigate('/checkout');
    }
  };

  const handleWhatsAppEnquiry = () => {
    const text = `Hello FRESH CAKE by PROVA! I am inquiring about "${product.name}" (${selectedVariant.name}). Link: ${window.location.href}`;
    window.open(getWhatsAppUrl(settings.whatsapp_number, text), '_blank');
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '2rem 0 5rem 0' }}>
      <div className="container">
        
        {/* Breadcrumb Back Link */}
        <div style={{ marginBottom: '1.75rem' }}>
          <Link 
            to={product.category === 'cakes' ? '/cakes' : product.category === 'donuts' ? '/donuts' : '/momos'}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}
          >
            <ArrowLeft size={16} />
            <span>Back to {product.category.toUpperCase()}</span>
          </Link>
        </div>

        {/* Product Hero Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 'clamp(2rem, 5vw, 4rem)',
          backgroundColor: 'var(--bg-surface)',
          padding: 'clamp(1.5rem, 4vw, 3rem)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '4rem'
        }}>
          
          {/* Left Column: Image Gallery */}
          <div>
            <div style={{
              aspectRatio: '1/1',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1rem'
            }}>
              <img
                src={activeImage}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Thumbnail Navigation */}
            {product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '4px' }}>
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(img)}
                    style={{
                      width: '74px',
                      height: '74px',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: activeImage === img ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                      padding: 0,
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    <img src={img} alt={`Thumb ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Configurations */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            
            {/* Top Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <span className="badge badge-caramel" style={{ textTransform: 'uppercase' }}>
                {product.cake_type || product.category}
              </span>
              {product.is_bestseller && (
                <span className="badge badge-gold">Bestseller</span>
              )}
              {product.is_demo && (
                <span className="badge badge-demo">Sample Catalog</span>
              )}
            </div>

            <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', marginBottom: '0.5rem', lineHeight: 1.2 }}>
              {product.name}
            </h1>

            {/* Rating Stars */}
            {product.rating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', color: '#D97706' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} fill={i < Math.floor(product.rating || 5) ? '#D97706' : 'none'} />
                  ))}
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{product.rating}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  ({product.review_count || 18} verified customer reviews)
                </span>
              </div>
            )}

            {/* Dynamic Price Display */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '1rem',
              padding: '1rem 0',
              borderTop: '1px solid var(--border-subtle)',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '1.5rem'
            }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--brand-primary)' }}>
                {settings.currency} {currentPrice}
              </span>
              {product.discount_price && product.price > currentPrice && (
                <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  {settings.currency} {product.price}
                </span>
              )}
              <span style={{ fontSize: '0.82rem', color: 'var(--brand-secondary)', fontWeight: 600 }}>
                (Includes selected variant)
              </span>
            </div>

            <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.75rem' }}>
              {product.description}
            </p>

            {/* Preparation time badge */}
            {product.prep_time && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--bg-secondary)',
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                fontSize: '0.88rem',
                color: 'var(--text-primary)'
              }}>
                <Clock size={17} style={{ color: 'var(--brand-primary)' }} />
                <span>Preparation Notice: <strong>{product.prep_time}</strong></span>
              </div>
            )}

            {/* Variant Selector (Weight / Size) */}
            {product.variants.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ marginBottom: '0.6rem' }}>
                  Choose Weight / Size Variant:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        style={{
                          padding: '0.7rem 1.1rem',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: isSelected ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                          backgroundColor: isSelected ? 'var(--brand-accent-light)' : 'var(--bg-surface)',
                          color: isSelected ? 'var(--brand-primary)' : 'var(--text-primary)',
                          transition: 'all var(--transition-fast)'
                        }}
                      >
                        <div>{v.name}</div>
                        <div style={{ fontSize: '0.8rem', color: isSelected ? 'var(--brand-primary)' : 'var(--brand-secondary)', marginTop: '2px' }}>
                          {settings.currency} {v.price}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Flavor Selector */}
            {product.flavors && product.flavors.length > 0 && (
              <div style={{ marginBottom: '1.75rem' }}>
                <label className="form-label">Available Flavor Option:</label>
                <select
                  value={selectedFlavor}
                  onChange={(e) => setSelectedFlavor(e.target.value)}
                  className="form-select"
                  style={{ maxWidth: '360px' }}
                >
                  {product.flavors.map((flavor) => (
                    <option key={flavor} value={flavor}>
                      {flavor}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom Cake Link Callout if customized */}
            {(product.cake_type === 'Customized Cakes' || product.category === 'cakes') && (
              <div style={{
                backgroundColor: 'var(--brand-accent-light)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
                border: '1px solid var(--border-accent)',
                marginBottom: '1.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Sparkles size={18} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                    Need a custom theme, color palette, or reference image quote?
                  </span>
                </div>
                <Link to="/custom-cake" className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
                  <span>Customizer</span>
                </Link>
              </div>
            )}

            {/* Quantity and Actions */}
            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center', marginTop: 'auto' }}>
              {/* Quantity Counter */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-surface)',
                height: '50px'
              }}>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 16px', fontSize: '1.2rem' }}
                >
                  -
                </button>
                <span style={{ fontWeight: 700, minWidth: '28px', textAlign: 'center', fontSize: '1.05rem' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 16px', fontSize: '1.2rem' }}
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="btn btn-primary"
                style={{ flexGrow: 1, minWidth: '180px', height: '50px' }}
              >
                <ShoppingBag size={18} />
                <span>Add to Bag</span>
              </button>

              {/* Buy Now Button */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="btn btn-secondary"
                style={{ height: '50px', borderColor: 'var(--brand-primary)', color: 'var(--brand-primary)' }}
              >
                <span>Buy Now</span>
                <ArrowRight size={16} />
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => {
                  const toggled = toggleWishlist(product.id);
                  if (toggled) {
                    showToast(isSaved ? 'Removed from wishlist' : 'Saved to wishlist!', 'info');
                  }
                }}
                className="btn btn-secondary btn-icon-only"
                style={{ height: '50px', width: '50px', color: isSaved ? '#C62828' : 'var(--text-secondary)' }}
                title="Wishlist"
              >
                <Heart size={22} fill={isSaved ? '#C62828' : 'none'} />
              </button>
            </div>

            {/* WhatsApp Quick Inquire Button */}
            <button
              type="button"
              onClick={handleWhatsAppEnquiry}
              className="btn btn-whatsapp"
              style={{ marginTop: '1rem', width: '100%' }}
            >
              <MessageCircle size={18} />
              <span>Ask about this bake on WhatsApp</span>
            </button>

            {/* Bakery Promise */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              backgroundColor: 'var(--bg-secondary)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginTop: '1.25rem'
            }}>
              <BrandLogo size="xs" showWordmark={false} />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Handcrafted fresh to order at <strong>FRESH CAKE by PROVA</strong>, Upazila Road, Indra Mor, Kushtia.
              </div>
            </div>

          </div>

        </div>

        {/* Related Products Showcase */}
        {relatedProducts.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <div>
                <span className="section-tag">Pairings &amp; Favorites</span>
                <h2 style={{ fontSize: '1.8rem', margin: 0 }}>You May Also Love</h2>
              </div>
              <Link to={`/${product.category}`} className="btn btn-secondary btn-sm">
                <span>View More {product.category}</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid-4">
              {relatedProducts.map(rel => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
