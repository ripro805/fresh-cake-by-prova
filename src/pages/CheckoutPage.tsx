import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  ShoppingBag, 
  MapPin, 
  CreditCard, 
  Phone, 
  User, 
  Truck, 
  Store, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { storeService } from '../services/storeService';
import { PaymentMethod } from '../types';
import { BrandLogo } from '../components/common/BrandLogo';

export const CheckoutPage: React.FC = () => {
  const { cart, subtotal, clearCart } = useCart();
  const { settings, showToast } = useSettings();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryArea, setDeliveryArea] = useState<'inside' | 'outside'>('inside');
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.addresses?.[0]?.address || '');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Enforce customer login for checkout
  React.useEffect(() => {
    if (!currentUser) {
      showToast('Please sign in to proceed with checkout.', 'info');
      navigate('/login', { state: { from: '/checkout' }, replace: true });
    }
  }, [currentUser, navigate]);

  // Sync customer details when currentUser loads
  React.useEffect(() => {
    if (currentUser) {
      if (!customerName && currentUser.name) setCustomerName(currentUser.name);
      if (!customerPhone && currentUser.phone) setCustomerPhone(currentUser.phone);
      if (!customerEmail && currentUser.email) setCustomerEmail(currentUser.email);
      if (!deliveryAddress && currentUser.addresses?.[0]?.address) {
        setDeliveryAddress(currentUser.addresses[0].address);
      }
    }
  }, [currentUser]);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [paymentTrxId, setPaymentTrxId] = useState('');
  const [paymentSenderPhone, setPaymentSenderPhone] = useState('');

  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Delivery Fee Calculation
  const deliveryFee = deliveryType === 'pickup' 
    ? 0 
    : (deliveryArea === 'inside' ? settings.delivery_charge_inside : settings.delivery_charge_outside);

  const grandTotal = Math.max(0, subtotal + deliveryFee - discountAmount);

  if (cart.length === 0) {
    return (
      <div style={{ backgroundColor: 'var(--bg-primary)', padding: '6rem 1.5rem', textAlign: 'center' }}>
        <h2>No items to checkout</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Please add products to your cart before proceeding to checkout.
        </p>
        <Link to="/shop" className="btn btn-primary">
          <span>Go to Shop</span>
        </Link>
      </div>
    );
  }

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      const result = await storeService.validateCoupon(couponCode.trim(), subtotal);
      if (result.valid) {
        setDiscountAmount(result.discount_amount);
        setCouponApplied(true);
        showToast(result.message || `Coupon applied successfully!`, 'success');
      } else {
        setDiscountAmount(0);
        setCouponApplied(false);
        showToast(result.message || 'Invalid or expired coupon code.', 'error');
      }
    } catch {
      showToast('Could not validate coupon. Please try again.', 'error');
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!customerName.trim()) {
      showToast('Please enter your full name.', 'error');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 10) {
      showToast('Please enter a valid phone number for delivery confirmation.', 'error');
      return;
    }
    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      showToast('Please provide your complete delivery address.', 'error');
      return;
    }

    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && !paymentTrxId.trim()) {
      showToast(`Please enter the ${paymentMethod.toUpperCase()} Transaction ID (TrxID).`, 'error');
      return;
    }

    try {
      setSubmitting(true);

      const createdOrder = await storeService.createOrder({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim() || undefined,
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'delivery' ? deliveryAddress.trim() : undefined,
        delivery_area: deliveryType === 'delivery' ? (deliveryArea === 'inside' ? 'Inside Kushtia Town' : 'Outside Kushtia Town') : 'Kushtia Bakery Pickup Point',
        delivery_fee: deliveryFee,
        delivery_instructions: deliveryInstructions.trim() || undefined,
        order_notes: orderNotes.trim() || undefined,
        coupon_code: couponApplied ? couponCode.trim().toUpperCase() : undefined,
        items: [...cart],
        subtotal,
        discount: discountAmount,
        total: grandTotal,
        payment_method: paymentMethod,
        payment_status: 'pending',
        payment_trx_id: paymentTrxId.trim() || undefined,
        payment_sender_phone: paymentSenderPhone.trim() || undefined
      });

      // Clear cart ONLY after successful creation
      clearCart();

      // Fire celebratory confetti!
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });

      showToast(`Order ${createdOrder.id} successfully placed!`, 'success');
      navigate(`/order-confirmation/${createdOrder.id}`);
    } catch (err) {
      console.error(err);
      showToast('Order creation failed. Please check your connection and try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '2.5rem 0 5rem 0' }}>
      <div className="container">
        
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="section-tag">Final Step</span>
            <h1 style={{ fontSize: '2.2rem', margin: 0 }}>Checkout &amp; Confirmation</h1>
          </div>
          <BrandLogo size="md" />
        </div>

        <form onSubmit={handleOrderSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2.5rem' }}>
            
            {/* Left Column: Customer Info & Payment (7 cols) */}
            <div style={{ gridColumn: 'span 7' }} className="checkout-main-col">
              
              {/* 1. Customer Information Card */}
              <div style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-subtle)',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                  <User size={20} style={{ color: 'var(--brand-primary)' }} />
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Customer Contact</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Anika Rahman"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 01308516242"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="For receiving digital order confirmation receipt"
                    className="form-control"
                  />
                </div>
              </div>

              {/* 2. Delivery Options Card */}
              <div style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-subtle)',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                  <Truck size={20} style={{ color: 'var(--brand-primary)' }} />
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Delivery Preference</h3>
                </div>

                {/* Delivery vs Pickup Radio Tabs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setDeliveryType('delivery')}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: deliveryType === 'delivery' ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                      backgroundColor: deliveryType === 'delivery' ? 'var(--brand-accent-light)' : 'var(--bg-surface)',
                      color: deliveryType === 'delivery' ? 'var(--brand-primary)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      fontWeight: 600,
                      textAlign: 'left'
                    }}
                  >
                    <Truck size={20} />
                    <div>
                      <div>Home Delivery</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 400 }}>Delivered to your doorstep</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('pickup')}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: deliveryType === 'pickup' ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                      backgroundColor: deliveryType === 'pickup' ? 'var(--brand-accent-light)' : 'var(--bg-surface)',
                      color: deliveryType === 'pickup' ? 'var(--brand-primary)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      fontWeight: 600,
                      textAlign: 'left'
                    }}
                  >
                    <Store size={20} />
                    <div>
                      <div>Store Pickup</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 400 }}>Collect free at bakehouse counter</div>
                    </div>
                  </button>
                </div>

                {deliveryType === 'delivery' ? (
                  <>
                    {/* Delivery Area Selection */}
                    <div className="form-group">
                      <label className="form-label">Kushtia Delivery Zone:</label>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                          <input
                            type="radio"
                            name="deliveryArea"
                            checked={deliveryArea === 'inside'}
                            onChange={() => setDeliveryArea('inside')}
                            style={{ accentColor: 'var(--brand-primary)' }}
                          />
                          <span>Inside Kushtia Town ({settings.currency} {settings.delivery_charge_inside})</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                          <input
                            type="radio"
                            name="deliveryArea"
                            checked={deliveryArea === 'outside'}
                            onChange={() => setDeliveryArea('outside')}
                            style={{ accentColor: 'var(--brand-primary)' }}
                          />
                          <span>Outside Kushtia Town / Suburbs ({settings.currency} {settings.delivery_charge_outside})</span>
                        </label>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Complete Street Address in Kushtia *</label>
                      <textarea
                        required
                        rows={3}
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="House / Holding no, Road name, Area (e.g., Holding 45, Upazila Road / Indra Mor / NS Road / Majampur, Kushtia)"
                        className="form-control"
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Delivery Instructions (Optional)</label>
                      <input
                        type="text"
                        value={deliveryInstructions}
                        onChange={(e) => setDeliveryInstructions(e.target.value)}
                        placeholder="e.g. Ring bell 3A, leave with concierge, etc."
                        className="form-control"
                      />
                    </div>
                  </>
                ) : (
                  <div style={{
                    backgroundColor: 'var(--bg-secondary)',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.9rem'
                  }}>
                    <div style={{ fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '6px' }}>
                      Bakery Pickup Point (Free - ৳0):
                    </div>
                    <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontWeight: 600 }}>
                      📍 {settings.pickup_point_address || 'Upazila Mor, Disha Tower, Kushtia, Bangladesh'}
                    </p>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      <strong>Baking House:</strong> {settings.baking_house_address || settings.address || 'Upazila Road, Indra Mor, Kushtia, Bangladesh'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                      Hotline: <strong>{settings.phone || '01308516242'}</strong> &bull; Please provide your Order ID at the counter upon arrival.
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Payment Methods Card */}
              <div style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-subtle)',
                padding: '2rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                  <CreditCard size={20} style={{ color: 'var(--brand-primary)' }} />
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Payment Method</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
                  {/* COD */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.9rem 1.1rem',
                    borderRadius: 'var(--radius-md)',
                    border: paymentMethod === 'cod' ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                    backgroundColor: paymentMethod === 'cod' ? 'var(--brand-accent-light)' : 'var(--bg-surface)',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      style={{ accentColor: 'var(--brand-primary)' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600 }}>Cash on Delivery (COD)</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Pay cash when your freshly baked order arrives.</div>
                    </div>
                  </label>

                  {/* bKash */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.9rem 1.1rem',
                    borderRadius: 'var(--radius-md)',
                    border: paymentMethod === 'bkash' ? '2px solid #E2136E' : '1px solid var(--border-subtle)',
                    backgroundColor: paymentMethod === 'bkash' ? '#FFF0F5' : 'var(--bg-surface)',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'bkash'}
                      onChange={() => setPaymentMethod('bkash')}
                      style={{ accentColor: '#E2136E' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#E2136E' }}>bKash Mobile Payment</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Send money or merchant payment to our official bKash wallet.</div>
                    </div>
                  </label>

                  {/* Nagad */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.9rem 1.1rem',
                    borderRadius: 'var(--radius-md)',
                    border: paymentMethod === 'nagad' ? '2px solid #F7941D' : '1px solid var(--border-subtle)',
                    backgroundColor: paymentMethod === 'nagad' ? '#FFF8F0' : 'var(--bg-surface)',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'nagad'}
                      onChange={() => setPaymentMethod('nagad')}
                      style={{ accentColor: '#F7941D' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#F7941D' }}>Nagad Mobile Payment</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Send money or payment to our official Nagad number.</div>
                    </div>
                  </label>
                </div>

                {/* Mobile payment instructions and inputs */}
                {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                  <div style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    border: '1px solid var(--border-subtle)',
                    animation: 'fadeIn 0.2s ease'
                  }}>
                    <div style={{ fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '0.5rem' }}>
                      {paymentMethod.toUpperCase()} Payment Instructions:
                    </div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
                      1. Go to your {paymentMethod.toUpperCase()} App or dial USSD.<br />
                      2. Send total amount: <strong>{settings.currency} {grandTotal}</strong> to number: <strong>{paymentMethod === 'bkash' ? settings.bkash_number : settings.nagad_number}</strong>.<br />
                      3. Enter the transaction ID and your sender number below:
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Transaction ID (TrxID) *</label>
                        <input
                          type="text"
                          required
                          value={paymentTrxId}
                          onChange={(e) => setPaymentTrxId(e.target.value)}
                          placeholder="e.g. BK9823471"
                          className="form-control"
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Sender Phone Number</label>
                        <input
                          type="tel"
                          value={paymentSenderPhone}
                          onChange={(e) => setPaymentSenderPhone(e.target.value)}
                          placeholder="Number you sent from"
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Order Notes */}
                <div className="form-group" style={{ marginTop: '1.5rem', marginBottom: 0 }}>
                  <label className="form-label">Custom Order Notes / Candle Requests</label>
                  <textarea
                    rows={2}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="e.g. Please add 5 birthday candles, or write 'Happy 21st Birthday Sarah' on packaging"
                    className="form-control"
                  />
                </div>

              </div>

            </div>

            {/* Right Column: Order Review & Total (5 cols) */}
            <div style={{ gridColumn: 'span 5' }} className="checkout-sidebar-col">
              <div style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-subtle)',
                padding: '2rem',
                position: 'sticky',
                top: '100px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Your Bag Summary</h3>
                  <BrandLogo size="xs" showWordmark={false} />
                </div>

                {/* Item List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px', marginBottom: '1.5rem' }}>
                  {cart.map((item, index) => {
                    const itemPrice = item.selectedVariant.price || item.product.discount_price || item.product.price;
                    return (
                      <div key={index} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <img
                          src={item.product.images[0] || '/images/hero_cake.jpg'}
                          alt={item.product.name}
                          style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                        />
                        <div style={{ flexGrow: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.product.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--brand-secondary)' }}>
                            {item.quantity}x &bull; {item.selectedVariant.name}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--brand-primary)' }}>
                          {settings.currency} {itemPrice * item.quantity}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Coupon Code Input */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Coupon: PROVA10"
                      disabled={couponApplied}
                      className="form-control"
                      style={{ height: '40px', fontSize: '0.85rem' }}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponApplied}
                      className="btn btn-secondary btn-sm"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {couponApplied ? 'Applied' : 'Apply'}
                    </button>
                  </div>
                </div>

                {/* Totals Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Items Subtotal</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{settings.currency} {subtotal}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Delivery Charge ({deliveryType === 'delivery' ? deliveryArea : 'Counter Pickup'})</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {deliveryFee === 0 ? 'FREE' : `${settings.currency} ${deliveryFee}`}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A', fontWeight: 600 }}>
                      <span>Discount Coupon</span>
                      <span>-{settings.currency} {discountAmount}</span>
                    </div>
                  )}

                  <div style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '0.85rem',
                    marginTop: '0.4rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline'
                  }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Grand Total
                    </span>
                    <span style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--brand-primary)' }}>
                      {settings.currency} {grandTotal}
                    </span>
                  </div>
                </div>

                {/* Place Order CTA Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ width: '100%', height: '52px', fontSize: '1.05rem' }}
                >
                  {submitting ? (
                    <span>Processing Order...</span>
                  ) : (
                    <>
                      <span>Confirm &amp; Place Order</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.85rem' }}>
                  By clicking Place Order, your order will be stored and prepared fresh by our bakery kitchen.
                </div>

              </div>
            </div>

          </div>
        </form>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .checkout-main-col, .checkout-sidebar-col { grid-column: span 12 !important; }
        }
      `}</style>
    </div>
  );
};
