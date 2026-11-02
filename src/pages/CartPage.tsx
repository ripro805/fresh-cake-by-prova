import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/common/BrandLogo';

export const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, subtotal, clearCart } = useCart();
  const { settings } = useSettings();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <div style={{ backgroundColor: 'var(--bg-primary)', padding: '6rem 1.5rem', minHeight: '70vh' }}>
        <div className="container-narrow" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <BrandLogo size="md" />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Sign In Required</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '440px', margin: '0 auto 2rem auto' }}>
            Please sign in or create an account to view and manage your bakery shopping bag.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" state={{ from: '/cart' }} className="btn btn-primary btn-lg">
              <span>Sign In / Register</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/shop" className="btn btn-secondary btn-lg">
              <span>Explore Bakery</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div style={{ backgroundColor: 'var(--bg-primary)', padding: '6rem 1.5rem', minHeight: '70vh' }}>
        <div className="container-narrow" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <BrandLogo size="md" />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Your Bag is Empty</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '440px', margin: '0 auto 2rem auto' }}>
            It looks like you haven't added any artisan cakes, donuts, or momos yet.
          </p>
          <Link to="/shop" className="btn btn-primary btn-lg">
            <span>Explore Collection</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '3rem 0 5rem 0' }}>
      <div className="container">
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <BrandLogo size="sm" showWordmark={false} />
            <div>
              <span className="section-tag">Checkout Bag</span>
              <h1 style={{ fontSize: '2.4rem', margin: 0 }}>Shopping Bag</h1>
            </div>
          </div>
          <button
            onClick={clearCart}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Clear Entire Bag
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2.5rem' }}>
          
          {/* Items Table (8 cols) */}
          <div style={{ gridColumn: 'span 8' }} className="cart-items-col">
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-subtle)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {cart.map((item, index) => {
                  const itemPrice = item.selectedVariant.price || item.product.discount_price || item.product.price;
                  return (
                    <div
                      key={`${item.product.id}-${item.selectedVariant.id}-${item.selectedFlavor || ''}-${index}`}
                      style={{
                        display: 'flex',
                        gap: '1.25rem',
                        paddingBottom: '1.5rem',
                        borderBottom: index < cart.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                        alignItems: 'center'
                      }}
                    >
                      <img
                        src={item.product.images[0] || '/images/hero_cake.jpg'}
                        alt={item.product.name}
                        style={{
                          width: '90px',
                          height: '90px',
                          borderRadius: 'var(--radius-md)',
                          objectFit: 'cover',
                          backgroundColor: 'var(--bg-secondary)',
                          flexShrink: 0
                        }}
                      />

                      <div style={{ flexGrow: 1 }}>
                        <Link to={`/product/${item.product.slug}`} style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', display: 'block', marginBottom: '3px' }}>
                          {item.product.name}
                        </Link>
                        <div style={{ fontSize: '0.82rem', color: 'var(--brand-secondary)', fontWeight: 600 }}>
                          Variant: {item.selectedVariant.name}
                        </div>
                        {item.selectedFlavor && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Flavor: {item.selectedFlavor}
                          </div>
                        )}
                        <div style={{ fontSize: '0.88rem', color: 'var(--brand-primary)', fontWeight: 600, marginTop: '4px' }}>
                          Unit: {settings.currency} {itemPrice}
                        </div>
                      </div>

                      {/* Quantity control */}
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--bg-surface)'
                      }}>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedVariant.id, item.quantity - 1, item.selectedFlavor)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px' }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedVariant.id, item.quantity + 1, item.selectedFlavor)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px' }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Line total */}
                      <div style={{ fontWeight: 800, fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--brand-primary)', minWidth: '90px', textAlign: 'right' }}>
                        {settings.currency} {itemPrice * item.quantity}
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id, item.selectedVariant.id, item.selectedFlavor)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
                        title="Remove"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--brand-primary)', fontWeight: 600 }}>
                <ArrowLeft size={16} />
                <span>Continue Browsing Bakery Collection</span>
              </Link>
            </div>
          </div>

          {/* Order Summary (4 cols) */}
          <div style={{ gridColumn: 'span 4' }} className="cart-summary-col">
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-subtle)',
              padding: '2rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Order Summary</h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                <span>Items Subtotal</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{settings.currency} {subtotal}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                <span>Delivery Estimation</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--brand-secondary)', fontWeight: 600 }}>Selected at Checkout</span>
              </div>

              <div style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline'
              }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>Estimated Total</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--brand-primary)' }}>
                  {settings.currency} {subtotal}
                </span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="btn btn-primary"
                style={{ width: '100%', marginBottom: '0.75rem' }}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Secure checkout • Cash on Delivery &amp; Mobile Payments
              </div>
            </div>
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .cart-items-col, .cart-summary-col { grid-column: span 12 !important; }
        }
      `}</style>
    </div>
  );
};
