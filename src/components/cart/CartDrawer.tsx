import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';

export const CartDrawer: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, isCartDrawerOpen, setIsCartDrawerOpen, subtotal, cartCount } = useCart();
  const { settings } = useSettings();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  if (!isCartDrawerOpen) return null;

  const handleCheckoutClick = () => {
    setIsCartDrawerOpen(false);
    navigate('/checkout');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(34, 24, 18, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1100,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease forwards'
      }}
      onClick={() => setIsCartDrawerOpen(false)}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          backgroundColor: 'var(--bg-primary)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Drawer Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <BrandLogo size="xs" showWordmark={false} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Your Bag</h3>
            <span className="badge badge-caramel" style={{ fontSize: '0.75rem' }}>
              {cartCount} items
            </span>
          </div>
          <button
            onClick={() => setIsCartDrawerOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '6px'
            }}
            aria-label="Close cart"
          >
            <X size={22} />
          </button>
        </div>

        {/* Free Delivery Bar notice */}
        <div style={{
          backgroundColor: 'var(--brand-accent-light)',
          padding: '0.6rem 1.5rem',
          fontSize: '0.82rem',
          color: 'var(--brand-primary)',
          borderBottom: '1px solid var(--border-subtle)',
          textAlign: 'center',
          fontWeight: 500
        }}>
          Free doorstep gift note & packaging included with every artisan order!
        </div>

        {/* Cart Item List */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
          {!currentUser ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <div style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
                color: 'var(--brand-primary)'
              }}>
                <User size={34} />
              </div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 700 }}>
                Sign In Required
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.5 }}>
                Please sign in or create an account to view and manage your shopping bag.
              </p>
              <button
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  navigate('/login', { state: { from: window.location.pathname } });
                }}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <span>Sign In / Register</span>
                <ArrowRight size={17} />
              </button>
            </div>
          ) : cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <div style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
                color: 'var(--brand-secondary)'
              }}>
                <ShoppingBag size={34} />
              </div>
              <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Your bag is empty</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
                Explore our signature cakes, warm donuts, and delicate momos!
              </p>
              <button
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  navigate('/shop');
                }}
                className="btn btn-primary btn-sm"
              >
                Explore Collection
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {cart.map((item, index) => {
                const itemPrice = item.selectedVariant.price || item.product.discount_price || item.product.price;
                return (
                  <div
                    key={`${item.product.id}-${item.selectedVariant.id}-${item.selectedFlavor || ''}-${index}`}
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      paddingBottom: '1.2rem',
                      borderBottom: '1px solid var(--border-subtle)'
                    }}
                  >
                    {/* Thumbnail */}
                    <div style={{
                      width: '78px',
                      height: '78px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-secondary)',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      <img
                        src={item.product.images[0] || '/images/hero_cake.jpg'}
                        alt={item.product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    {/* Details */}
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <div>
                          <h4 style={{ fontSize: '0.98rem', fontWeight: 700, margin: '0 0 2px 0', color: 'var(--text-primary)' }}>
                            {item.product.name}
                          </h4>
                          <span style={{ fontSize: '0.8rem', color: 'var(--brand-secondary)', fontWeight: 600 }}>
                            {item.selectedVariant.name}
                          </span>
                          {item.selectedFlavor && (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block' }}>
                              Flavor: {item.selectedFlavor}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedVariant.id, item.selectedFlavor)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                          aria-label="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {/* Controls and Price */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--bg-surface)'
                        }}>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.selectedVariant.id, item.quantity - 1, item.selectedFlavor)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '3px 8px',
                              color: 'var(--text-secondary)'
                            }}
                          >
                            <Minus size={13} />
                          </button>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, minWidth: '22px', textAlign: 'center' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.selectedVariant.id, item.quantity + 1, item.selectedFlavor)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '3px 8px',
                              color: 'var(--text-secondary)'
                            }}
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <div style={{ fontWeight: 700, color: 'var(--brand-primary)', fontFamily: 'var(--font-serif)', fontSize: '1.05rem' }}>
                          {settings.currency} {itemPrice * item.quantity}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer with Subtotal & Actions */}
        {currentUser && cart.length > 0 && (
          <div style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Subtotal</span>
              <span style={{ fontSize: '1.35rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--brand-primary)' }}>
                {settings.currency} {subtotal}
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Taxes and delivery fee calculated during checkout.
            </p>

            <button
              onClick={handleCheckoutClick}
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '0.75rem' }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => {
                setIsCartDrawerOpen(false);
                navigate('/shop');
              }}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              Continue Shopping
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
