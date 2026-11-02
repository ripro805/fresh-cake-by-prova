import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Heart, 
  Cake, 
  Clock, 
  ShieldCheck, 
  Send,
  Star,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Product } from '../types';
import { storeService } from '../services/storeService';
import { ProductCard } from '../components/product/ProductCard';
import { useSettings } from '../context/SettingsContext';
import { RealCake3DInteractive } from '../components/common/RealCake3DInteractive';
import { BrandLogo } from '../components/common/BrandLogo';

export const HomePage: React.FC = () => {
  const { settings, showToast } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const all = await storeService.getProducts();
      setProducts(all);
      setLoading(false);
    };
    loadData();
  }, []);

  const bestsellingCakes = products
    .filter(p => p.category === 'cakes' && p.is_bestseller)
    .slice(0, 4);

  const signatureCakes = products
    .filter(p => p.category === 'cakes' && ['Tub Cakes', 'Mart Cakes', 'Cup Cakes', 'Customized Cakes'].includes(p.cake_type || ''))
    .slice(0, 4);

  const donutHighlight = products.find(p => p.category === 'donuts' && p.is_featured) || products.find(p => p.category === 'donuts');
  const momoHighlight = products.find(p => p.category === 'momos' && p.is_featured) || products.find(p => p.category === 'momos');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim() && newsletterEmail.includes('@')) {
      showToast('Thank you for subscribing! Fresh bakery inspiration is on its way.', 'success');
      setNewsletterEmail('');
    } else {
      showToast('Please enter a valid email address.', 'error');
    }
  };

  return (
    <div className="homepage-wrapper">
      
      {/* 1. HERO SECTION */}
      <section style={{
        position: 'relative',
        backgroundColor: 'var(--bg-primary)',
        paddingTop: 'clamp(2.5rem, 5vw, 4.5rem)',
        paddingBottom: 'clamp(3.5rem, 6vw, 6rem)',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative background glow */}
        <div style={{
          position: 'absolute',
          top: '-15%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          backgroundColor: 'rgba(217, 185, 155, 0.25)',
          filter: 'blur(90px)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'clamp(2rem, 5vw, 4.5rem)',
            alignItems: 'center'
          }}>
            
            {/* Left Column: Copy & CTAs */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <BrandLogo size="xs" showWordmark={true} />
                <div className="section-tag" style={{ margin: 0 }}>
                  <Sparkles size={14} />
                  <span>Artisan Patisserie &amp; Bakehouse</span>
                </div>
              </div>

              <h1 style={{ marginBottom: '1.25rem', lineHeight: 1.15 }}>
                Every Celebration Deserves a{' '}
                <span style={{ fontStyle: 'italic', color: 'var(--brand-primary)', fontWeight: 600 }}>
                  Sweeter Story.
                </span>
              </h1>

              <p style={{
                fontSize: 'clamp(1rem, 1.2vw, 1.15rem)',
                color: 'var(--text-secondary)',
                marginBottom: '2rem',
                maxWidth: '540px',
                lineHeight: 1.7
              }}>
                Discover handcrafted celebration cakes, whimsical Korean bento cakes, gourmet donuts, and delicate momos — freshly prepared with love to make your special moments unforgettable.
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
                <Link to="/shop" className="btn btn-primary btn-lg">
                  <span>Explore Our Collection</span>
                  <ArrowRight size={18} />
                </Link>

                <Link to="/custom-cake" className="btn btn-secondary btn-lg">
                  <span>Customize Your Cake</span>
                  <Sparkles size={16} />
                </Link>
              </div>

              {/* Brand Trust Metrics */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.75rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--brand-primary)' }}>
                    100%
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Fresh Handcrafted
                  </div>
                </div>

                <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border-subtle)' }} />

                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--brand-primary)' }}>
                    12+
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Cake Varieties
                  </div>
                </div>

                <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border-subtle)' }} />

                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--brand-primary)' }}>
                    Custom
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Design Studio
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Real 3D Interactive Cake Studio */}
            <div style={{ position: 'relative' }}>
              <RealCake3DInteractive />
            </div>

          </div>
        </div>
      </section>

      {/* 2. FEATURED CATEGORIES (ONLY 3: Cakes, Donuts, Momos - Cakes Primary) */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">
              <Layers size={14} /> Curated Offerings
            </span>
            <h2 className="section-title">Our Three Specialties</h2>
            <p className="section-desc">
              We focus on what we do best: exquisite cakes, gourmet donuts, and savory Himalayan momos.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '1.75rem'
          }}>
            
            {/* 1. CAKES CARD (Prominent & Large, 6 columns on desktop) */}
            <div style={{
              gridColumn: 'span 6',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all var(--transition-normal)'
            }}>
              <div style={{ position: 'relative', height: '280px', overflow: 'hidden' }}>
                <img
                  src="/images/hero_cake.jpg"
                  alt="Artisan Cakes Collection"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span className="badge badge-caramel" style={{ position: 'absolute', top: '16px', left: '16px' }}>
                  Primary Specialty
                </span>
              </div>
              <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--brand-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  &ldquo;A Little Slice of Happiness&rdquo;
                </span>
                <h3 style={{ fontSize: '1.6rem', marginTop: '0.35rem', marginBottom: '0.75rem' }}>
                  Artisan Celebration Cakes
                </h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  From dessert tub cakes and Korean lunchbox bento cakes to grand multi-tiered customized wedding centerpieces, each cake is tailored with exquisite flavors and pristine decoration.
                </p>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>12+ Handcrafted Varieties</span>
                  <Link to="/cakes" className="btn btn-primary btn-sm">
                    <span>Explore Cakes</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>

            {/* 2. DONUTS CARD (3 columns) */}
            <div style={{
              gridColumn: 'span 3',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ height: '200px', overflow: 'hidden' }}>
                <img
                  src="/images/category_donuts.jpg"
                  alt="Gourmet Donuts Box"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--brand-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  &ldquo;Sweet Little Moments&rdquo;
                </span>
                <h3 style={{ fontSize: '1.25rem', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                  Gourmet Donuts
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                  Fluffy brioche donuts with Belgian chocolate, sea salt caramel, and toasted nuts. Available individually or in gift boxes.
                </p>
                <div style={{ marginTop: 'auto' }}>
                  <Link to="/donuts" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                    <span>Browse Donuts</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* 3. MOMOS CARD (3 columns) */}
            <div style={{
              gridColumn: 'span 3',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ height: '200px', overflow: 'hidden' }}>
                <img
                  src="/images/category_momos.jpg"
                  alt="Steamed Artisan Momos"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--brand-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  &ldquo;Deliciously Made to Share&rdquo;
                </span>
                <h3 style={{ fontSize: '1.25rem', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                  Savory Momos
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                  Delicately steamed and crispy pan-fried Himalayan dumplings with house-made sesame chili dipping sauces.
                </p>
                <div style={{ marginTop: 'auto' }}>
                  <Link to="/momos" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                    <span>Browse Momos</span>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Responsive grid styles for categories */}
        <style>{`
          @media (max-width: 960px) {
            .homepage-wrapper [style*="grid-column: span 6"],
            .homepage-wrapper [style*="grid-column: span 3"] {
              grid-column: span 12 !important;
            }
          }
        `}</style>
      </section>

      {/* 3. BESTSELLING CAKES SHOWCASE */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', gap: '1rem' }}>
            <div>
              <span className="section-tag">
                <Cake size={14} /> Most Cherished
              </span>
              <h2 style={{ margin: '0 0 0.5rem 0' }}>Bestselling Cakes</h2>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                Handcrafted celebration cakes beloved by our patisserie clients.
              </p>
            </div>
            <Link to="/cakes" className="btn btn-secondary">
              <span>View All Cakes</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid-4">
            {bestsellingCakes.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. SIGNATURE COLLECTION EDITORIAL SHOWCASE (Tub Cakes, Mart Cakes, Cup Cakes, Customized Cakes) */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">
              <Sparkles size={14} /> The Signature Edit
            </span>
            <h2 className="section-title">Tub Cakes, Mart Cakes &amp; Minis</h2>
            <p className="section-desc">
              Whether you want an intimate treat for yourself or a charming gift for a loved one, explore our signature dessert formats.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.75rem'
          }}>
            {/* Tub Cakes Feature Card */}
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ aspectRatio: '4/3', overflow: 'hidden' }}>
                <img src="/images/tub_cake.jpg" alt="Tub Cakes" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Decadent Layers
                </div>
                <h3 style={{ fontSize: '1.25rem', margin: '0.35rem 0 0.5rem 0' }}>Tub Cakes</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  Layered in transparent tubs with luscious caramel, Belgian chocolate fudge, and praline crunch.
                </p>
                <Link to="/cakes?type=Tub+Cakes" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                  <span>Shop Tub Cakes</span>
                </Link>
              </div>
            </div>

            {/* Mart Cakes Feature Card */}
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ aspectRatio: '4/3', overflow: 'hidden' }}>
                <img src="/images/mart_cake.jpg" alt="Mart Bento Cakes" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Korean Bento Style
                </div>
                <h3 style={{ fontSize: '1.25rem', margin: '0.35rem 0 0.5rem 0' }}>Mart Cakes</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  Minimalist lunchbox cakes packed in eco sugarcane boxes with vintage hand-piped messages.
                </p>
                <Link to="/cakes?type=Mart+Cakes" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                  <span>Shop Mart Cakes</span>
                </Link>
              </div>
            </div>

            {/* Cupcakes Feature Card */}
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ aspectRatio: '4/3', overflow: 'hidden' }}>
                <img src="/images/cupcakes.jpg" alt="Artisan Cupcakes" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Gift Box of 4 &amp; 6
                </div>
                <h3 style={{ fontSize: '1.25rem', margin: '0.35rem 0 0.5rem 0' }}>Artisan Cupcakes</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  Tall swirls of Madagascar vanilla bean and caramel frosting finished with golden pearls.
                </p>
                <Link to="/cakes?type=Cup+Cakes" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                  <span>Shop Cupcakes</span>
                </Link>
              </div>
            </div>

            {/* Customized Feature Card */}
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ aspectRatio: '4/3', overflow: 'hidden' }}>
                <img src="/images/custom_cake_art.jpg" alt="Custom Cakes" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Bespoke Studio
                </div>
                <h3 style={{ fontSize: '1.25rem', margin: '0.35rem 0 0.5rem 0' }}>Customized Cakes</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  Designed specifically for your theme, color palette, tier count, and celebration message.
                </p>
                <Link to="/custom-cake" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  <span>Create Custom Cake</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CUSTOMIZE YOUR CAKE PROMO BANNER */}
      <section style={{
        backgroundColor: 'var(--brand-primary)',
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ padding: '4.5rem 1.5rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            alignItems: 'center'
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '1rem',
                color: 'var(--brand-accent)'
              }}>
                <Sparkles size={14} />
                <span>Bespoke Pastry Craft</span>
              </div>

              <h2 style={{ color: '#FFFFFF', fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', marginBottom: '1rem', lineHeight: 1.2 }}>
                Your Imagination, Our Creation.
              </h2>

              <p style={{ color: 'rgba(250, 246, 239, 0.9)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '520px' }}>
                Have a special design in mind? Share your reference photo, select your dream flavor, and let our pastry artists craft a custom centerpiece that makes your milestone celebration truly unforgettable.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <Link to="/custom-cake" className="btn" style={{ backgroundColor: '#FFFFFF', color: 'var(--brand-primary)', fontWeight: 700, padding: '0.9rem 1.8rem' }}>
                  <span>Create Your Custom Cake</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/cakes?type=Customized+Cakes" className="btn btn-outline" style={{ borderColor: 'var(--brand-accent)', color: '#FFFFFF' }}>
                  <span>View Custom Gallery</span>
                </Link>
              </div>
            </div>

            {/* Custom Cake Art Visual */}
            <div style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }}>
              <img
                src="/images/custom_cake_art.jpg"
                alt="FRESH CAKE by PROVA Bespoke Multi-Tier Cake"
                style={{ width: '100%', height: 'auto', maxHeight: '440px', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. DONUTS & MOMOS SHOWCASE SECTION (Secondary to cakes) */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">
              <Sparkles size={14} /> Warm Delights
            </span>
            <h2 className="section-title">Gourmet Donuts &amp; Steamed Momos</h2>
            <p className="section-desc">
              Carefully baked sweet brioche donuts and comforting savory dumplings, freshly prepared every day.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem'
          }}>
            {/* Donut Showcase Card */}
            {donutHighlight && (
              <div style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ height: '260px', overflow: 'hidden' }}>
                  <img src={donutHighlight.images[0]} alt={donutHighlight.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--brand-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Donut Collection
                  </span>
                  <h3 style={{ fontSize: '1.4rem', margin: '0.4rem 0 0.6rem 0' }}>{donutHighlight.name}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                    {donutHighlight.description}
                  </p>
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--brand-primary)', fontFamily: 'var(--font-serif)' }}>
                      {settings.currency} {donutHighlight.discount_price || donutHighlight.price}
                    </div>
                    <Link to="/donuts" className="btn btn-secondary btn-sm">
                      <span>View Donut Menu</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Momo Showcase Card */}
            {momoHighlight && (
              <div style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ height: '260px', overflow: 'hidden' }}>
                  <img src={momoHighlight.images[0]} alt={momoHighlight.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--brand-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Himalayan Kitchen
                  </span>
                  <h3 style={{ fontSize: '1.4rem', margin: '0.4rem 0 0.6rem 0' }}>{momoHighlight.name}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                    {momoHighlight.description}
                  </p>
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--brand-primary)', fontFamily: 'var(--font-serif)' }}>
                      {settings.currency} {momoHighlight.discount_price || momoHighlight.price}
                    </div>
                    <Link to="/momos" className="btn btn-secondary btn-sm">
                      <span>View Momo Menu</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 7. WHY CHOOSE US? (4 Cards) */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Our Promise</span>
            <h2 className="section-title">Why Choose FRESH CAKE by PROVA</h2>
            <p className="section-desc">
              Every creation is prepared with artisanal patience and high quality ingredients.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.75rem'
          }}>
            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--brand-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)', margin: '0 auto 1.25rem auto' }}>
                <Heart size={26} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Made with Love</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Hand-baked from scratch with warm dedication and precision to ensure each bite feels like a celebration.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--brand-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)', margin: '0 auto 1.25rem auto' }}>
                <Sparkles size={26} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Beautifully Crafted</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Contemporary aesthetics featuring silk smooth buttercream piping, gold leaf accents, and fresh botanicals.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--brand-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)', margin: '0 auto 1.25rem auto' }}>
                <ShieldCheck size={26} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Quality-Focused Ingredients</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Real Belgian chocolate, pure dairy butter, rich cream cheese, and fragrant Madagascar vanilla.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--brand-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)', margin: '0 auto 1.25rem auto' }}>
                <Clock size={26} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Made for Special Moments</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Tailored for birthdays, anniversaries, graduations, family gatherings, and everyday sweet indulgences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. BRAND STORY SECTION */}
      <section id="about" className="section-padding" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'clamp(2rem, 5vw, 4.5rem)',
            alignItems: 'center'
          }}>
            {/* Story Visual */}
            <div style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-secondary)'
            }}>
              <img
                src="/images/brand_story.jpg"
                alt="Baking with passion at FRESH CAKE by PROVA"
                style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'cover' }}
              />
            </div>

            {/* Story Copy */}
            <div>
              <div className="section-tag">
                <Heart size={14} /> Our Heart &amp; Craft
              </div>
              <h2 style={{ marginBottom: '1.25rem', lineHeight: 1.2 }}>
                A Little Passion, A Lot of Sweetness.
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.7 }}>
                <strong>FRESH CAKE by PROVA</strong> was founded on a simple belief: the centerpiece of your celebration should look as breathtaking as it tastes. We combine the warmth of home-style baking with the artistry of luxury boutique patisseries.
              </p>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.7 }}>
                Every single cake is mixed, baked, frosted, and decorated in thoughtful small batches. Whether you order an everyday indulgence like our Salted Caramel Tub Cake or design a custom tiered cake for an anniversary, we put our heart into every layer.
              </p>

              <div style={{
                backgroundColor: 'var(--bg-secondary)',
                padding: '1.25rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                borderLeft: '4px solid var(--brand-primary)',
                marginBottom: '2rem'
              }}>
                <p style={{ fontStyle: 'italic', color: 'var(--brand-primary)', fontWeight: 600, margin: 0 }}>
                  &ldquo;Every Celebration Deserves a Sweeter Story.&rdquo;
                </p>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                  — FRESH CAKE by PROVA
                </span>
              </div>

              <Link to="/custom-cake" className="btn btn-primary">
                <span>Start Your Cake Journey</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CUSTOMER TESTIMONIALS (With clean preview state) */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Guest Experiences</span>
            <h2 className="section-title">Kind Words From Celebrations</h2>
            <p className="section-desc">
              Real joy and sweet memories shared by customers who celebrated with us.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.75rem'
          }}>
            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', color: '#D97706', marginBottom: '0.75rem' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#D97706" />)}
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontStyle: 'italic', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                &ldquo;The Golden Caramel Drip Cake was the absolute star of my daughter's 18th birthday! Not overly sweet, beautifully balanced with Swiss buttercream, and the gold flakes made it look royal.&rdquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--brand-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--brand-primary)' }}>
                  AR
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Anika Rahman</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Banani, Dhaka • Birthday Cake</div>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', color: '#D97706', marginBottom: '0.75rem' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#D97706" />)}
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontStyle: 'italic', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                &ldquo;We ordered a custom 2-tier cake and a box of artisan donuts. The attention to detail on the floral sugarcraft was breathtaking. Prompt updates on WhatsApp throughout!&rdquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--brand-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--brand-primary)' }}>
                  SC
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Sabrina Chowdhury</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Gulshan 2, Dhaka • Custom Order</div>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', color: '#D97706', marginBottom: '0.75rem' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#D97706" />)}
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontStyle: 'italic', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                &ldquo;The Salted Caramel Fudge Tub Cake is hands down the best dessert in town. Grab a spoon and you won't be able to stop. Also the spicy momos are surprisingly authentic!&rdquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--brand-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--brand-primary)' }}>
                  TH
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Tanvir Hossain</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Upazila Road, Kushtia • Tub Cakes &amp; Momos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. SOCIAL PHOTO GALLERY */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: '2rem' }}>
            <span className="section-tag">Visual Storytelling</span>
            <h2 className="section-title">Moments from the Bakehouse</h2>
            <p className="section-desc">
              Follow our daily baking adventures on social media <strong>@freshcakebyprova</strong>
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{ aspectRatio: '1/1', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: 'var(--bg-secondary)' }}>
              <img src="/images/hero_cake.jpg" alt="Gallery 1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ aspectRatio: '1/1', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: 'var(--bg-secondary)' }}>
              <img src="/images/category_donuts.jpg" alt="Gallery 2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ aspectRatio: '1/1', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: 'var(--bg-secondary)' }}>
              <img src="/images/tub_cake.jpg" alt="Gallery 3" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ aspectRatio: '1/1', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: 'var(--bg-secondary)' }}>
              <img src="/images/mart_cake.jpg" alt="Gallery 4" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ aspectRatio: '1/1', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: 'var(--bg-secondary)' }}>
              <img src="/images/category_momos.jpg" alt="Gallery 5" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ aspectRatio: '1/1', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: 'var(--bg-secondary)' }}>
              <img src="/images/custom_cake_art.jpg" alt="Gallery 6" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <a 
              href={settings.social_instagram} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-outline"
            >
              <span>Follow On Instagram</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* 11. NEWSLETTER SUBSCRIPTION */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '4rem 1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container-narrow" style={{ textAlign: 'center' }}>
          <span className="section-tag">
            <Sparkles size={14} /> Stay Connected
          </span>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>
            Stay Sweet. Stay Inspired.
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '520px', margin: '0 auto 2rem auto' }}>
            Subscribe to receive secret seasonal flavor launches, festive holiday discounts, and custom cake design tips.
          </p>

          <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address..."
              required
              className="form-control"
              style={{ flexGrow: 1, minWidth: '240px', borderRadius: 'var(--radius-full)' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 1.8rem' }}>
              <span>Subscribe</span>
              <Send size={15} />
            </button>
          </form>
        </div>
      </section>

    </div>
  );
};
