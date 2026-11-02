import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  Truck, 
  Clock, 
  CheckCircle2, 
  Package, 
  ChefHat, 
  Bike, 
  Home, 
  XCircle,
  MessageCircle,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { storeService } from '../services/storeService';
import { useSettings } from '../context/SettingsContext';
import { BrandLogo } from '../components/common/BrandLogo';

const STATUS_STEPS: OrderStatus[] = [
  'Order Placed',
  'Order Confirmed',
  'Preparing',
  'Ready for Delivery',
  'Out for Delivery',
  'Delivered'
];

export const TrackOrderPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { settings, showToast } = useSettings();

  const initialId = searchParams.get('id') || '';
  const initialPhone = searchParams.get('phone') || '';

  const [orderId, setOrderId] = useState(initialId);
  const [phone, setPhone] = useState(initialPhone);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const performLookup = async (idToLook: string, phoneToLook: string) => {
    if (!idToLook.trim() || !phoneToLook.trim()) {
      showToast('Please enter both Order ID and Phone Number.', 'error');
      return;
    }

    setLoading(true);
    setSearched(true);
    const found = await storeService.getOrderByIdAndPhone(idToLook, phoneToLook);
    setSearchedOrder(found);
    setLoading(false);

    if (!found) {
      showToast('No matching order found. Please verify your Order ID and Phone Number.', 'error');
    }
  };

  useEffect(() => {
    if (initialId && initialPhone) {
      performLookup(initialId, initialPhone);
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ id: orderId.trim(), phone: phone.trim() });
    performLookup(orderId, phone);
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'Order Placed': return <Package size={18} />;
      case 'Order Confirmed': return <CheckCircle2 size={18} />;
      case 'Preparing': return <ChefHat size={18} />;
      case 'Ready for Delivery': return <Package size={18} />;
      case 'Out for Delivery': return <Bike size={18} />;
      case 'Delivered': return <Home size={18} />;
      case 'Cancelled': return <XCircle size={18} />;
      default: return <Clock size={18} />;
    }
  };

  const getCurrentStepIndex = (status: OrderStatus) => {
    if (status === 'Cancelled') return -1;
    return STATUS_STEPS.indexOf(status);
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '3.5rem 0 6rem 0', minHeight: '80vh' }}>
      <div className="container-narrow">
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <BrandLogo size="md" />
          <span className="section-tag">
            <Truck size={14} /> Live Kitchen Tracking
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', margin: 0 }}>
            Track Your Bakehouse Order
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto' }}>
            Enter your unique Order ID and the phone number provided at checkout to view real-time preparation &amp; delivery status.
          </p>
        </div>

        {/* Search Form Card */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '2.5rem'
        }}>
          <form onSubmit={handleSearchSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Order ID *</label>
                <input
                  type="text"
                  required
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. PROVA-2026-8812"
                  className="form-control"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Customer Phone *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 01308516242"
                  className="form-control"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ height: '46px' }}
              >
                <Search size={18} />
                <span>{loading ? 'Searching...' : 'Track Order'}</span>
              </button>
            </div>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
            <ShieldCheck size={14} style={{ color: 'var(--brand-primary)' }} />
            <span>Secure lookup: Phone verification protects privacy and ensures only you can view your order.</span>
          </div>
        </div>

        {/* Results Container */}
        {searched && searchedOrder && (
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            padding: '2.5rem 2rem',
            boxShadow: 'var(--shadow-md)',
            animation: 'fadeIn 0.28s ease'
          }}>
            
            {/* Top Status Header */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div>
                <span style={{ fontSize: '0.82rem', color: 'var(--brand-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Live Status Tracking
                </span>
                <h2 style={{ fontSize: '1.6rem', margin: '4px 0 0 0' }}>
                  {searchedOrder.id}
                </h2>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Customer: <strong>{searchedOrder.customer_name}</strong> &bull; {searchedOrder.delivery_type === 'delivery' ? 'Home Delivery' : 'Store Pickup'}
                </div>
              </div>

              <div style={{
                backgroundColor: searchedOrder.order_status === 'Delivered' ? '#ECFDF5' : searchedOrder.order_status === 'Cancelled' ? '#FEF2F2' : 'var(--brand-accent-light)',
                color: searchedOrder.order_status === 'Delivered' ? '#047857' : searchedOrder.order_status === 'Cancelled' ? '#B91C1C' : 'var(--brand-primary)',
                padding: '0.6rem 1.4rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid var(--border-subtle)'
              }}>
                {getStatusIcon(searchedOrder.order_status)}
                <span>{searchedOrder.order_status}</span>
              </div>
            </div>

            {/* Stepper Progress Bar (when not cancelled) */}
            {searchedOrder.order_status !== 'Cancelled' ? (
              <div style={{ marginBottom: '2.5rem' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${STATUS_STEPS.length}, 1fr)`,
                  position: 'relative',
                  marginBottom: '1rem'
                }}>
                  {/* Connecting Line */}
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '5%',
                    right: '5%',
                    height: '3px',
                    backgroundColor: 'var(--border-subtle)',
                    zIndex: 0
                  }}>
                    <div style={{
                      height: '100%',
                      backgroundColor: 'var(--brand-primary)',
                      width: `${(Math.max(0, getCurrentStepIndex(searchedOrder.order_status)) / (STATUS_STEPS.length - 1)) * 100}%`,
                      transition: 'width 0.4s ease'
                    }} />
                  </div>

                  {STATUS_STEPS.map((step, idx) => {
                    const isDone = idx <= getCurrentStepIndex(searchedOrder.order_status);
                    const isCurrent = idx === getCurrentStepIndex(searchedOrder.order_status);
                    return (
                      <div key={step} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          backgroundColor: isDone ? 'var(--brand-primary)' : 'var(--bg-surface)',
                          color: isDone ? '#FFFFFF' : 'var(--text-muted)',
                          border: isDone ? '2px solid var(--brand-primary)' : '2px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 6px auto',
                          boxShadow: isCurrent ? '0 0 0 4px var(--brand-accent-light)' : 'none',
                          transition: 'all 0.3s ease'
                        }}>
                          {isDone ? <CheckCircle2 size={16} /> : <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{idx + 1}</span>}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          fontWeight: isCurrent ? 700 : 500,
                          color: isDone ? 'var(--text-primary)' : 'var(--text-muted)',
                          lineHeight: 1.2
                        }}>
                          {step}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{
                backgroundColor: '#FEF2F2',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                border: '1px solid #FCA5A5',
                color: '#B91C1C',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <XCircle size={22} />
                <div>
                  <strong>This order has been cancelled.</strong>
                  <div style={{ fontSize: '0.85rem' }}>If you have questions regarding this cancellation, please contact our bakery helpline.</div>
                </div>
              </div>
            )}

            {/* Timeline Notes */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                Order Journey Log
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {searchedOrder.timeline.map((entry, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '0.9rem 1.1rem',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '4px solid var(--brand-primary)'
                  }}>
                    <div style={{ color: 'var(--brand-primary)', marginTop: '2px' }}>
                      <Clock size={16} />
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <strong style={{ fontSize: '0.92rem' }}>{entry.status}</strong>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{entry.timestamp}</span>
                      </div>
                      {entry.note && (
                        <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {entry.note}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items & Contact Support */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.75rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Order Total:</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--brand-primary)' }}>
                  {settings.currency} {searchedOrder.total} ({searchedOrder.items.length} items)
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <a
                  href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello FRESH CAKE by PROVA! I am checking status for Order ID: ${searchedOrder.id}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp btn-sm"
                >
                  <MessageCircle size={16} />
                  <span>Enquire on WhatsApp</span>
                </a>
                <Link to="/shop" className="btn btn-secondary btn-sm">
                  <span>Browse More Bakery</span>
                </Link>
              </div>
            </div>

          </div>
        )}

        {searched && !searchedOrder && !loading && (
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: '3rem 2rem',
            textAlign: 'center',
            border: '1px solid var(--border-subtle)'
          }}>
            <AlertCircle size={36} style={{ color: '#D97706', margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Matching Order Found</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 1.5rem auto' }}>
              Please make sure the Order ID (e.g. PROVA-2026-8812) and phone number match the exact details submitted during checkout.
            </p>
            <a
              href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello, I need help locating my bakery order. Order ID: ${orderId}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
            >
              <MessageCircle size={15} />
              <span>Contact Bakery Support</span>
            </a>
          </div>
        )}

      </div>
    </div>
  );
};
