import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Phone, 
  MapPin, 
  Mail, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  Code2
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

import { BrandLogo } from './BrandLogo';
import { DeveloperProfileModal } from './DeveloperProfileModal';

export const Footer: React.FC = () => {
  const { settings } = useSettings();
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);

  return (
    <footer style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)', marginTop: '4rem' }}>
      
      {/* Brand Trust Strip */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', padding: '2.5rem 0', backgroundColor: 'var(--bg-primary)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.75rem',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--brand-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)', marginBottom: '0.75rem' }}>
                <Heart size={22} />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Handmade with Love</h4>
              <p style={{ fontSize: '0.85rem' }}>Baked fresh in small batches using premium artisan ingredients.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--brand-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)', marginBottom: '0.75rem' }}>
                <Sparkles size={22} />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Bespoke Custom Designs</h4>
              <p style={{ fontSize: '0.85rem' }}>Personalized cakes tailored for milestone birthdays and weddings.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--brand-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)', marginBottom: '0.75rem' }}>
                <Clock size={22} />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Freshly Prepared to Order</h4>
              <p style={{ fontSize: '0.85rem' }}>Carefully packaged to arrive pristine and delicious at your door.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--brand-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)', marginBottom: '0.75rem' }}>
                <ShieldCheck size={22} />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Reliable Tracking & Care</h4>
              <p style={{ fontSize: '0.85rem' }}>Track your bake from kitchen preparation to final handover.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container" style={{ padding: '4rem 1.5rem 3rem 1.5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem'
        }}>
          
          {/* Brand Info */}
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <Link to="/" style={{ textDecoration: 'none' }}>
                <BrandLogo size="lg" showWordmark={true} withContainerBorder={true} />
              </Link>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              &ldquo;{settings.tagline}&rdquo;
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {settings.social_instagram && (
                <a 
                  href={settings.social_instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}
                  title="Instagram"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
              )}
              {settings.social_facebook && (
                <a 
                  href={settings.social_facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}
                  title="Facebook"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Bakery Specialties (ONLY 3 categories) */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.1rem' }}>
              Our Specialties
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <Link to="/cakes" style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                  🎂 All Cakes Collection
                </Link>
              </li>
              <li>
                <Link to="/cakes?type=Tub+Cakes" style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                  Tub Cakes
                </Link>
              </li>
              <li>
                <Link to="/cakes?type=Mart+Cakes" style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                  Mart Cakes (Bento)
                </Link>
              </li>
              <li>
                <Link to="/cakes?type=Cup+Cakes" style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                  Cup Cakes
                </Link>
              </li>
              <li>
                <Link to="/donuts" style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                  🍩 Gourmet Donuts
                </Link>
              </li>
              <li>
                <Link to="/momos" style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                  🥟 Himalayan Momos
                </Link>
              </li>
              <li>
                <Link to="/custom-cake" style={{ fontSize: '0.92rem', color: 'var(--brand-primary)', fontWeight: 600 }}>
                  ✨ Design Custom Cake
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service & Navigation */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.1rem' }}>
              Customer Support
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <Link to="/track-order" style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                  Track Order Status
                </Link>
              </li>
              <li>
                <Link to="/cart" style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/checkout" style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                  Checkout & Payment
                </Link>
              </li>
              <li>
                <Link to="/account" style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                  Customer Profile
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsDevModalOpen(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '0.92rem',
                    color: 'var(--brand-primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--brand-primary-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--brand-primary)')}
                >
                  <Code2 size={15} style={{ color: 'var(--brand-secondary)' }} />
                  Meet the Developer
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details (Centralized via settings) */}
          <div id="contact">
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.1rem' }}>
              Bakehouse &amp; Orders
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <MapPin size={17} style={{ color: 'var(--brand-primary)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.84rem' }}>Baking House:</strong>
                  <span>{settings.baking_house_address || settings.address}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <MapPin size={17} style={{ color: 'var(--brand-secondary)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.84rem' }}>Pickup Point:</strong>
                  <span>{settings.pickup_point_address || 'Upazila Mor, Disha Tower, Kushtia, Bangladesh'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <Phone size={17} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
                <div>
                  <a href={`tel:${settings.phone}`} style={{ color: 'inherit', fontWeight: 600 }}>{settings.phone}</a>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '6px' }}>(Hotline / bKash / Nagad)</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <Mail size={17} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
                <span>{settings.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <Clock size={17} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
                <span>Daily: 10:00 AM – 10:00 PM</span>
              </div>
            </div>
          </div>

        </div>

        {/* Demo Data Notice & Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          marginTop: '3rem',
          paddingTop: '1.75rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.82rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span>&copy; {new Date().getFullYear()} <strong>FRESH CAKE by PROVA</strong>. All rights reserved.</span>
            <span style={{ color: 'var(--border-subtle)' }}>•</span>
            <button
              type="button"
              onClick={() => setIsDevModalOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: '0.82rem',
                color: 'var(--brand-primary)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                textDecoration: 'none',
                transition: 'color var(--transition-fast)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--brand-primary-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--brand-primary)')}
            >
              <Code2 size={13} style={{ color: 'var(--brand-secondary)' }} />
              Meet the Developer
            </button>
          </div>
          <div style={{
            backgroundColor: 'var(--brand-accent-light)',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.76rem',
            color: 'var(--brand-primary)'
          }}>
            Sample prices and demo products are provided for presentation. Editable in Admin.
          </div>
        </div>

      </div>

      {/* Developer Profile Modal */}
      <DeveloperProfileModal 
        isOpen={isDevModalOpen} 
        onClose={() => setIsDevModalOpen(false)} 
      />
    </footer>
  );
};
