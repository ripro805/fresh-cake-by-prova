import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  ShoppingBag, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Clock, 
  ArrowRight,
  Truck,
  Copy,
  Check,
  Printer
} from 'lucide-react';
import { Order } from '../types';
import { storeService } from '../services/storeService';
import { useSettings } from '../context/SettingsContext';
import { BrandLogo } from '../components/common/BrandLogo';

export const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { settings, showToast } = useSettings();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      setLoading(true);
      const orders = await storeService.getOrders();
      const found = orders.find(o => o.id === id);
      setOrder(found || null);
      setLoading(false);
    };
    fetchOrder();
  }, [id]);

  const handleCopyOrderId = () => {
    if (order) {
      navigator.clipboard.writeText(order.id);
      setCopied(true);
      showToast('Order ID copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendWhatsApp = () => {
    if (!order) return;

    const itemList = order.items
      .map(i => `• ${i.quantity}x ${i.product.name} (${i.selectedVariant.name}${i.selectedFlavor ? `, ${i.selectedFlavor}` : ''})`)
      .join('\n');

    const message = `Hello FRESH CAKE by PROVA!\n\nI have placed an order on your website:\n*Order ID:* ${order.id}\n*Customer:* ${order.customer_name}\n*Phone:* ${order.customer_phone}\n\n*Ordered Items:*\n${itemList}\n\n*Total Amount:* ${settings.currency} ${order.total}\n*Payment Method:* ${order.payment_method.toUpperCase()}${order.payment_trx_id ? ` (TrxID: ${order.payment_trx_id})` : ''}\n*Delivery Method:* ${order.delivery_type === 'delivery' ? `Doorstep Delivery to: ${order.delivery_address}` : 'Store Pickup at Bakehouse'}\n\nPlease confirm my order. Thank you!`;

    const cleanNumber = settings.whatsapp_number.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <p>Loading your fresh order confirmation...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <h2>Order Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          We could not locate this order ID in our records.
        </p>
        <Link to="/track-order" className="btn btn-primary">
          <span>Go to Order Tracking</span>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '3.5rem 0 6rem 0' }}>
      <div className="container-narrow">
        
        {/* Success Header Banner */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: '3rem 2rem',
          textAlign: 'center',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '2.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <BrandLogo size="md" />
          </div>

          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#ECFDF5',
            color: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto'
          }}>
            <CheckCircle2 size={36} />
          </div>

          <span className="section-tag" style={{ backgroundColor: '#ECFDF5', color: '#047857', borderColor: '#A7F3D0' }}>
            Order Placed Successfully
          </span>

          <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.6rem)', margin: '0.75rem 0 0.5rem 0' }}>
            Thank You, {order.customer_name}!
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '540px', margin: '0 auto 1.75rem auto' }}>
            Your celebration order has been safely received. Our bakery team is preparing everything fresh for you.
          </p>

          {/* Order ID Pill with Copy button */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: 'var(--bg-secondary)',
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '2rem'
          }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Order ID:</span>
            <strong style={{ fontSize: '1.1rem', letterSpacing: '0.05em', color: 'var(--brand-primary)' }}>
              {order.id}
            </strong>
            <button
              onClick={handleCopyOrderId}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                padding: '2px'
              }}
              title="Copy Order ID"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>

          {/* WhatsApp Action Button */}
          <div>
            <button
              onClick={handleSendWhatsApp}
              className="btn btn-whatsapp btn-lg"
              style={{ marginBottom: '1rem', width: '100%', maxWidth: '420px' }}
            >
              <MessageCircle size={20} />
              <span>Send Order Details on WhatsApp</span>
            </button>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Get instant updates &amp; coordinate delivery directly with the baker on WhatsApp
            </div>
          </div>
        </div>

        {/* Order Details & Printable Invoice Grid */}
        <div className="printable-receipt-card" style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '2.5rem'
        }}>
          {/* Official Invoice Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--border-accent)', paddingBottom: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <BrandLogo size="sm" showWordmark={true} />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                <div><strong>Baking House:</strong> {settings.baking_house_address || 'Upazila Road, Indra Mor, Kushtia, Bangladesh'}</div>
                <div><strong>Pickup Point:</strong> {settings.pickup_point_address || 'Upazila Mor, Disha Tower, Kushtia, Bangladesh'}</div>
                <div><strong>Hotline / WhatsApp:</strong> {settings.phone || '01308516242'}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="badge badge-caramel" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Official Bakery Receipt
              </span>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Order #{order.id}
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>
            Order Summary
          </h3>

          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {order.items.map((item, index) => {
              const itemPrice = item.selectedVariant.price || item.product.discount_price || item.product.price;
              return (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <img
                      src={item.product.images[0] || '/images/hero_cake.jpg'}
                      alt={item.product.name}
                      style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.product.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--brand-secondary)' }}>
                        {item.quantity}x &bull; {item.selectedVariant.name}
                        {item.selectedFlavor && ` &bull; ${item.selectedFlavor}`}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: 'var(--brand-primary)' }}>
                    {settings.currency} {itemPrice * item.quantity}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Breakdown */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.92rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{settings.currency} {order.subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Delivery Fee ({order.delivery_area || order.delivery_type})</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {order.delivery_fee === 0 ? 'FREE' : `${settings.currency} ${order.delivery_fee}`}
              </span>
            </div>
            {order.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A', fontWeight: 600 }}>
                <span>Discount</span>
                <span>-{settings.currency} {order.discount}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginTop: '0.35rem', fontSize: '1.2rem', fontWeight: 800 }}>
              <span>Total Paid / Payable</span>
              <span style={{ color: 'var(--brand-primary)', fontFamily: 'var(--font-serif)' }}>{settings.currency} {order.total}</span>
            </div>
          </div>

          {/* Delivery & Payment Meta */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            marginTop: '1.5rem',
            paddingTop: '1.5rem'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                Delivery Destination
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>{order.customer_name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {order.delivery_type === 'delivery' ? order.delivery_address : 'Store Pickup at Bakehouse'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Phone: {order.customer_phone}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                Payment Method &amp; Status
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 600, textTransform: 'uppercase' }}>
                {order.payment_method}
              </div>
              <div style={{ fontSize: '0.85rem', color: order.payment_status === 'verified' ? '#047857' : '#D97706', fontWeight: 600 }}>
                Payment: {order.payment_status.toUpperCase()}
              </div>
              {order.payment_trx_id && (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  TrxID: {order.payment_trx_id}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => window.print()}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Printer size={16} />
            <span>Print Official Receipt</span>
          </button>
          <Link
            to={`/track-order?id=${order.id}&phone=${encodeURIComponent(order.customer_phone)}`}
            className="btn btn-primary"
          >
            <Truck size={16} />
            <span>Track Live Order Status</span>
          </Link>
          <Link to="/shop" className="btn btn-secondary">
            <span>Continue Shopping</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
