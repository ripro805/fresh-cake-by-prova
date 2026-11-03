import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Upload, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Cake,
  Palette,
  MessageSquare,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { storeService } from '../services/storeService';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/common/BrandLogo';
import { getWhatsAppUrl } from '../lib/whatsapp';

const OCCASIONS = [
  'Birthday',
  'Anniversary',
  'Wedding',
  'Graduation',
  'Baby Shower',
  'Milestone Celebration',
  'Corporate Event',
  'Other Special Occasion'
];

const CAKE_SIZES = [
  '1 Pound (Serves 4-6)',
  '2 Pound (Serves 8-12)',
  '3 Pound (Serves 15-20)',
  '4 Pound (Serves 25-30)',
  '5+ Pound Grand Celebration'
];

const FLAVORS = [
  'Salted Caramel & Vanilla Bean',
  'Belgian Dark Chocolate Fudge',
  'Classic Red Velvet Cream Cheese',
  'Madagascar Vanilla Fresh Cream',
  'Hazelnut Nutella Praline',
  'Lotus Biscoff Cream',
  'White Chocolate Raspberry',
  'Custom Combination'
];

const TIER_OPTIONS = [
  '1 Tier (Standard)',
  '2 Tiers (Elegant Tiered)',
  '3 Tiers (Grand Wedding / Milestone)'
];

export const CustomCakePage: React.FC = () => {
  const { settings, showToast } = useSettings();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);

  // Form Fields
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');

  // Sync customer details when currentUser is available
  React.useEffect(() => {
    if (currentUser) {
      if (!customerName && currentUser.name) setCustomerName(currentUser.name);
      if (!customerPhone && currentUser.phone) setCustomerPhone(currentUser.phone);
      if (!deliveryAddress && currentUser.addresses?.[0]?.address) {
        setDeliveryAddress(currentUser.addresses[0].address);
      }
    }
  }, [currentUser]);
  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [cakeSize, setCakeSize] = useState(CAKE_SIZES[1]);
  const [cakeFlavor, setCakeFlavor] = useState(FLAVORS[0]);
  const [cakeTiers, setCakeTiers] = useState(TIER_OPTIONS[0]);
  const [cakeType, setCakeType] = useState('Custom Celebration Cake');
  const [colorPreference, setColorPreference] = useState('Warm cream, soft beige & edible gold accents');
  const [customMessage, setCustomMessage] = useState('');
  const [designDescription, setDesignDescription] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState('');
  
  // Delivery details
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('04:00 PM');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Handle Image Upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        showToast('Image size should be under 8MB.', 'error');
        return;
      }
      setImageFileName(file.name);
      const url = await storeService.uploadImage(file);
      setReferenceImage(url);
      showToast('Reference image attached!');
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !occasion) {
      showToast('Please pick an occasion.', 'error');
      return;
    }
    if (currentStep === 3 && !designDescription.trim()) {
      showToast('Please describe your cake design idea.', 'error');
      return;
    }
    if (currentStep === 4) {
      if (!customerName.trim() || !customerPhone.trim()) {
        showToast('Please enter your name and contact phone.', 'error');
        return;
      }
      if (!deliveryDate) {
        showToast('Please select your required celebration date.', 'error');
        return;
      }
      if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
        showToast('Please provide your delivery address.', 'error');
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleSubmitCustomCake = async () => {
    try {
      setSubmitting(true);

      const created = await storeService.createCustomCakeRequest({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        occasion,
        cake_size: cakeSize,
        cake_flavor: cakeFlavor,
        cake_type: cakeType,
        cake_tiers: cakeTiers,
        color_preference: colorPreference.trim(),
        custom_message: customMessage.trim() || undefined,
        design_description: designDescription.trim(),
        reference_image: referenceImage || undefined,
        delivery_type: deliveryType,
        delivery_date: deliveryDate,
        delivery_time: deliveryTime || undefined,
        delivery_address: deliveryType === 'delivery' ? deliveryAddress.trim() : undefined
      });

      setSubmittedRequestId(created.id);

      confetti({
        particleCount: 130,
        spread: 80,
        origin: { y: 0.6 }
      });

      showToast(`Custom Cake Request ${created.id} submitted! Our chef will review and send quotation.`);
    } catch (err) {
      console.error(err);
      showToast('Submission error. Please check your details and try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '3.5rem 0 6rem 0' }}>
      <div className="container-narrow">
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <BrandLogo size="md" />
          <div className="section-tag">
            <Sparkles size={14} /> Bespoke Pastry Studio
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 3.8vw, 3rem)', margin: 0, lineHeight: 1.2 }}>
            Design Your Dream Cake
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '580px', margin: '0 auto' }}>
            From flavor profiles and tiers to custom color palettes and reference photos — tell us your vision and we will bake it into reality.
          </p>
        </div>

        {/* Success View */}
        {submittedRequestId ? (
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-md)',
            animation: 'fadeIn 0.3s ease'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#ECFDF5',
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <CheckCircle2 size={46} />
            </div>

            <span className="badge badge-caramel" style={{ marginBottom: '1rem' }}>
              Request Received &bull; Pending Quotation
            </span>

            <h2 style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>
              Request Received, {customerName}!
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto 1.75rem auto', lineHeight: 1.6 }}>
              Our master cake designer is reviewing your theme, color choices, and custom requirements. We will contact you with a transparent quotation shortly.
            </p>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              backgroundColor: 'var(--bg-secondary)',
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '2rem'
            }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Custom Request ID:</span>
              <strong style={{ fontSize: '1.2rem', letterSpacing: '0.05em', color: 'var(--brand-primary)' }}>
                {submittedRequestId}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <a
                href={getWhatsAppUrl(settings.whatsapp_number, `Hello FRESH CAKE by PROVA! I just submitted a custom cake request: ${submittedRequestId} for ${occasion}. Here is my design requirement.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
              >
                <span>Chat on WhatsApp regarding this Quote</span>
              </a>

              <Link to="/" className="btn btn-secondary">
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Step-by-Step Form Container */
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            padding: 'clamp(1.5rem, 4vw, 3rem)',
            boxShadow: 'var(--shadow-md)'
          }}>
            
            {/* Steps Progress Indicator (5 Steps) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '0.5rem',
              marginBottom: '2.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '1.75rem'
            }}>
              {[
                { num: 1, title: 'Occasion' },
                { num: 2, title: 'Details' },
                { num: 3, title: 'Design' },
                { num: 4, title: 'Delivery' },
                { num: 5, title: 'Review' }
              ].map(step => (
                <div key={step.num} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: currentStep >= step.num ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                    color: currentStep >= step.num ? '#FFFFFF' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 6px auto',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    transition: 'all var(--transition-fast)'
                  }}>
                    {currentStep > step.num ? <CheckCircle2 size={16} /> : step.num}
                  </div>
                  <div style={{
                    fontSize: '0.78rem',
                    fontWeight: currentStep === step.num ? 700 : 500,
                    color: currentStep === step.num ? 'var(--text-primary)' : 'var(--text-muted)'
                  }}>
                    {step.title}
                  </div>
                </div>
              ))}
            </div>

            {/* STEP 1: OCCASION */}
            {currentStep === 1 && (
              <div style={{ animation: 'fadeIn 0.24s ease' }}>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Step 1: What are you celebrating?</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', fontSize: '0.92rem' }}>
                  Select the milestone event so we can tailor the styling and packaging accordingly.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  {OCCASIONS.map(occ => {
                    const isSelected = occasion === occ;
                    return (
                      <button
                        key={occ}
                        type="button"
                        onClick={() => setOccasion(occ)}
                        style={{
                          padding: '1.25rem 1rem',
                          borderRadius: 'var(--radius-lg)',
                          border: isSelected ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                          backgroundColor: isSelected ? 'var(--brand-accent-light)' : 'var(--bg-surface)',
                          color: isSelected ? 'var(--brand-primary)' : 'var(--text-primary)',
                          fontWeight: 600,
                          fontSize: '0.95rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          transition: 'all var(--transition-fast)'
                        }}
                      >
                        <Cake size={20} style={{ color: isSelected ? 'var(--brand-primary)' : 'var(--brand-secondary)' }} />
                        <span>{occ}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: CAKE DETAILS */}
            {currentStep === 2 && (
              <div style={{ animation: 'fadeIn 0.24s ease' }}>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Step 2: Cake Size, Flavor &amp; Tiers</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', fontSize: '0.92rem' }}>
                  Choose your expected guest count, delicious flavor combination, and tiered structure.
                </p>

                {/* Size Selection */}
                <div className="form-group">
                  <label className="form-label">Cake Size / Weight (Guest Servings):</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                    {CAKE_SIZES.map(size => {
                      const isSelected = cakeSize === size;
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setCakeSize(size)}
                          style={{
                            padding: '0.85rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            border: isSelected ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                            backgroundColor: isSelected ? 'var(--brand-accent-light)' : 'var(--bg-surface)',
                            color: isSelected ? 'var(--brand-primary)' : 'var(--text-primary)',
                            fontWeight: 600,
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Flavor Selection */}
                <div className="form-group">
                  <label className="form-label">Cake Flavor Profile:</label>
                  <select
                    value={cakeFlavor}
                    onChange={(e) => setCakeFlavor(e.target.value)}
                    className="form-select"
                  >
                    {FLAVORS.map(flavor => (
                      <option key={flavor} value={flavor}>{flavor}</option>
                    ))}
                  </select>
                </div>

                {/* Tiers Selection */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Tier Configuration:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    {TIER_OPTIONS.map(tier => {
                      const isSelected = cakeTiers === tier;
                      return (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => setCakeTiers(tier)}
                          style={{
                            padding: '0.85rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            border: isSelected ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                            backgroundColor: isSelected ? 'var(--brand-accent-light)' : 'var(--bg-surface)',
                            color: isSelected ? 'var(--brand-primary)' : 'var(--text-primary)',
                            fontWeight: 600,
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          {tier}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: DESIGN & REFERENCE IMAGE */}
            {currentStep === 3 && (
              <div style={{ animation: 'fadeIn 0.24s ease' }}>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Step 3: Styling, Colors &amp; Reference Photo</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', fontSize: '0.92rem' }}>
                  Give our pastry artists the aesthetic direction for your cake.
                </p>

                <div className="form-group">
                  <label className="form-label">Preferred Color Palette / Theme:</label>
                  <input
                    type="text"
                    value={colorPreference}
                    onChange={(e) => setColorPreference(e.target.value)}
                    placeholder="e.g. Muted blush, ivory cream, sage green, and edible gold flakes"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Custom Message Piped on Cake or Plaque:</label>
                  <input
                    type="text"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="e.g. Happy 30th Birthday Farhana! / Forever & Always"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Describe Your Design Ideas *</label>
                  <textarea
                    rows={4}
                    required
                    value={designDescription}
                    onChange={(e) => setDesignDescription(e.target.value)}
                    placeholder="Describe textures (rustic smooth buttercream, semi-naked, fondant floral cascade, wafer paper wings, vintage Korean piping, etc.)"
                    className="form-control"
                  />
                </div>

                {/* Reference Image Upload */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Upload Reference Photo / Inspiration Image:</label>
                  <div style={{
                    border: '2px dashed var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem',
                    textAlign: 'center',
                    backgroundColor: 'var(--bg-secondary)',
                    cursor: 'pointer',
                    position: 'relative'
                  }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0,
                        cursor: 'pointer',
                        width: '100%',
                        height: '100%'
                      }}
                    />
                    <Upload size={28} style={{ color: 'var(--brand-primary)', margin: '0 auto 8px auto' }} />
                    <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                      {imageFileName ? `Attached: ${imageFileName}` : 'Click to select or drag inspiration image here'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      PNG, JPG up to 8MB
                    </div>

                    {referenceImage && (
                      <div style={{ marginTop: '1rem', width: '120px', height: '120px', margin: '1rem auto 0 auto', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                        <img src={referenceImage} alt="Reference Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: DELIVERY & CONTACT */}
            {currentStep === 4 && (
              <div style={{ animation: 'fadeIn 0.24s ease' }}>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Step 4: Celebration Date &amp; Contact Info</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', fontSize: '0.92rem' }}>
                  Please give us your event date so our kitchen can reserve your oven slot.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Sabrina Chowdhury"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Contact Phone / WhatsApp *</label>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Required Delivery Date *</label>
                    <input
                      type="date"
                      required
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="form-control"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Preferred Delivery Time</label>
                    <input
                      type="time"
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                {/* Delivery vs Pickup Radio */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setDeliveryType('delivery')}
                    style={{
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: deliveryType === 'delivery' ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                      backgroundColor: deliveryType === 'delivery' ? 'var(--brand-accent-light)' : 'var(--bg-surface)',
                      color: deliveryType === 'delivery' ? 'var(--brand-primary)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      textAlign: 'left'
                    }}
                  >
                    Doorstep Delivery
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('pickup')}
                    style={{
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: deliveryType === 'pickup' ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                      backgroundColor: deliveryType === 'pickup' ? 'var(--brand-accent-light)' : 'var(--bg-surface)',
                      color: deliveryType === 'pickup' ? 'var(--brand-primary)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      textAlign: 'left'
                    }}
                  >
                    Store Counter Pickup
                  </button>
                </div>

                {deliveryType === 'delivery' && (
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Delivery Address *</label>
                    <textarea
                      rows={2}
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter house, road, area details"
                      className="form-control"
                    />
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: REVIEW & SUBMIT */}
            {currentStep === 5 && (
              <div style={{ animation: 'fadeIn 0.24s ease' }}>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Step 5: Review Custom Cake Request</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', fontSize: '0.92rem' }}>
                  Please review all specifications before submitting for chef review and quotation.
                </p>

                <div style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  fontSize: '0.92rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Customer:</span>
                    <strong>{customerName} ({customerPhone})</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Occasion:</span>
                    <strong>{occasion}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Size &amp; Tiers:</span>
                    <strong>{cakeSize} &bull; {cakeTiers}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Flavor:</span>
                    <strong>{cakeFlavor}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Palette &amp; Theme:</span>
                    <strong>{colorPreference}</strong>
                  </div>
                  {customMessage && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Custom Message:</span>
                      <strong style={{ fontStyle: 'italic' }}>&ldquo;{customMessage}&rdquo;</strong>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Required Date &amp; Time:</span>
                    <strong>{deliveryDate} at {deliveryTime}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Handover:</span>
                    <strong>{deliveryType === 'delivery' ? `Delivery to: ${deliveryAddress}` : 'Bakehouse Pickup'}</strong>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Design Notes:</span>
                    <p style={{ margin: 0, color: 'var(--text-primary)' }}>{designDescription}</p>
                  </div>
                  {referenceImage && (
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Reference Photo:</span>
                      <img src={referenceImage} alt="Ref" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', fontWeight: 600 }}>Attached</span>
                    </div>
                  )}
                </div>

                <div style={{
                  backgroundColor: 'var(--brand-accent-light)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  color: 'var(--brand-primary)',
                  marginBottom: '2rem'
                }}>
                  <strong>Quotation Workflow:</strong> Custom cakes require manual craftsmanship pricing. Submitting this form does not charge your card. Our team will review the design and message you with the exact quote for approval.
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '1.75rem',
              marginTop: '1.5rem'
            }}>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="btn btn-secondary"
                >
                  <ArrowLeft size={16} />
                  <span>Previous Step</span>
                </button>
              ) : <div />}

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="btn btn-primary"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmitCustomCake}
                  className="btn btn-primary btn-lg"
                >
                  {submitting ? 'Submitting Request...' : 'Submit Custom Request'}
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
