import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Eye, ArrowRight, Check, Heart, ShieldCheck } from 'lucide-react';

interface RealCakeItem {
  id: string;
  name: string;
  tagline: string;
  price: number;
  discountPrice?: number;
  image: string;
  slug: string;
  badge: string;
  prepTime: string;
  flavorNotes: string[];
}

const REAL_CAKES: RealCakeItem[] = [
  {
    id: 'cake-caramel',
    name: 'Golden Caramel Drip Celebration Cake',
    tagline: 'Multi-tiered sponge, Swiss meringue buttercream & gold leaf',
    price: 1850,
    discountPrice: 1650,
    image: '/images/hero_cake.jpg',
    slug: 'golden-caramel-celebration-cake',
    badge: 'Signature Artisan Hero',
    prepTime: '24h Fresh Baked',
    flavorNotes: ['Salted Caramel', 'Madagascar Vanilla', 'Gold Leaf']
  },
  {
    id: 'cake-chocolate',
    name: 'Belgian Dark Chocolate Truffle Cake',
    tagline: '70% Callebaut dark chocolate, silky ganache & handmade truffles',
    price: 1950,
    discountPrice: 1750,
    image: '/images/chocolate_cake.jpg',
    slug: 'belgian-dark-chocolate-truffle-cake',
    badge: 'Chocolatier Masterpiece',
    prepTime: '12h Fresh Baked',
    flavorNotes: ['Belgian Callebaut', 'Mirror Ganache', 'Truffles']
  },
  {
    id: 'cake-redvelvet',
    name: 'Classic Red Velvet Berry Dream Cake',
    tagline: 'Crimson cocoa sponge with Philadelphia cream cheese swirl',
    price: 1800,
    discountPrice: 1600,
    image: '/images/red_velvet_cake.jpg',
    slug: 'classic-red-velvet-berry-cake',
    badge: 'Customer Favorite',
    prepTime: 'Same Day / 6h Notice',
    flavorNotes: ['Cream Cheese', 'Fresh Strawberries', 'Dark Cocoa']
  },
  {
    id: 'cake-freshcream',
    name: 'Strawberry Fresh Cream Floral Cake',
    tagline: 'Light-as-air vanilla chiffon with farm-fresh whipped cream',
    price: 1750,
    discountPrice: 1550,
    image: '/images/fresh_cream_cake.jpg',
    slug: 'golden-caramel-celebration-cake',
    badge: 'Pastel Garden Floral',
    prepTime: 'Fresh Morning Batch',
    flavorNotes: ['Whipped Dairy Cream', 'Vanilla Chiffon', 'Fresh Blooms']
  }
];

export const RealCake3DShowcase: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isInspectZoom, setIsInspectZoom] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentCake = REAL_CAKES[selectedIndex];

  // Mouse Move Handler for 3D Perspective Tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 to 1
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;  // -1 to 1
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 });
  };

  const handleSelectCake = (index: number) => {
    if (index === selectedIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedIndex(index);
      setIsTransitioning(false);
    }, 220);
  };

  // Interpolated 3D Transform calculations
  const rotX = isHovered ? -mousePos.y * 12 : 0;
  const rotY = isHovered ? mousePos.x * 14 : 0;
  const lightX = (mousePos.x + 1) * 50;
  const lightY = (mousePos.y + 1) * 50;

  return (
    <div style={{ position: 'relative', width: '100%', perspective: '1400px' }}>
      
      {/* 3D Cake Stage Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-2xl)',
          overflow: 'hidden',
          backgroundColor: '#1E1611',
          border: '1px solid rgba(217, 185, 155, 0.45)',
          boxShadow: isHovered
            ? `${-mousePos.x * 35}px ${25 + mousePos.y * 25}px 65px rgba(27, 18, 12, 0.38)`
            : '0 25px 50px -12px rgba(27, 18, 12, 0.25)',
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${isHovered ? 1.02 : 1})`,
          transition: isHovered ? 'transform 0.12s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.2s ease' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s ease',
          transformStyle: 'preserve-3d',
          minHeight: '520px',
          cursor: isInspectZoom ? 'zoom-out' : 'grab'
        }}
        onClick={() => setIsInspectZoom(!isInspectZoom)}
      >
        {/* Layer 0: Ambient Warm Golden Backlight */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 40%, rgba(217, 185, 155, 0.25) 0%, rgba(30, 22, 17, 0.95) 85%)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />

        {/* Layer 1: Real High-Res Artisan Cake Photography with 3D Depth Transition */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '520px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            transform: `translateZ(${isHovered ? '25px' : '0px'}) scale(${isInspectZoom ? 1.25 : 1})`,
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease',
            opacity: isTransitioning ? 0.3 : 1
          }}
        >
          <img
            src={currentCake.image}
            alt={currentCake.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 42%',
              display: 'block',
              filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))',
              transition: 'transform 0.5s cubic-bezier(0.2, 0, 0, 1)'
            }}
          />
        </div>

        {/* Layer 2: Dynamic 3D Specular Light Gleam that follows mouse */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle 380px at ${lightX}% ${lightY}%, rgba(255, 245, 230, 0.28) 0%, rgba(255, 255, 255, 0.08) 35%, transparent 70%)`,
            mixBlendMode: 'screen',
            pointerEvents: 'none',
            zIndex: 3,
            transition: 'opacity 0.2s ease',
            opacity: isHovered ? 1 : 0.35
          }}
        />

        {/* Layer 3: Floating 3D Gold Leaf Flakes & Sparkle Particles */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 4,
            transform: `translateZ(${isHovered ? '45px' : '15px'})`,
            transition: 'transform 0.2s ease'
          }}
        >
          {/* Shimmering Flake 1 */}
          <div style={{
            position: 'absolute',
            top: '18%',
            left: '12%',
            width: '10px',
            height: '10px',
            borderRadius: '2px',
            backgroundColor: '#D4AF37',
            boxShadow: '0 0 12px #D4AF37',
            transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -15}px) rotate(35deg)`,
            transition: 'transform 0.15s ease'
          }} />

          {/* Shimmering Flake 2 */}
          <div style={{
            position: 'absolute',
            top: '32%',
            right: '15%',
            width: '8px',
            height: '12px',
            borderRadius: '2px',
            backgroundColor: '#F3E5AB',
            boxShadow: '0 0 10px #F3E5AB',
            transform: `translate(${mousePos.x * 25}px, ${mousePos.y * 20}px) rotate(55deg)`,
            transition: 'transform 0.15s ease'
          }} />

          {/* Shimmering Flake 3 */}
          <div style={{
            position: 'absolute',
            bottom: '28%',
            left: '16%',
            width: '12px',
            height: '8px',
            borderRadius: '3px',
            backgroundColor: '#D4AF37',
            boxShadow: '0 0 14px #D4AF37',
            transform: `translate(${mousePos.x * -18}px, ${mousePos.y * 18}px) rotate(-25deg)`,
            transition: 'transform 0.15s ease'
          }} />

          {/* Shimmering Flake 4 */}
          <div style={{
            position: 'absolute',
            bottom: '36%',
            right: '18%',
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: '#FFF',
            boxShadow: '0 0 15px rgba(255,255,255,0.9)',
            transform: `translate(${mousePos.x * 30}px, ${mousePos.y * -20}px)`,
            transition: 'transform 0.15s ease'
          }} />
        </div>

        {/* Layer 4: Top 3D Control Badges */}
        <div
          style={{
            position: 'absolute',
            top: '18px',
            left: '20px',
            right: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 6,
            transform: `translateZ(${isHovered ? '60px' : '20px'})`,
            transition: 'transform 0.25s ease'
          }}
        >
          {/* Real Cake Quality Tag */}
          <div style={{
            backgroundColor: 'rgba(28, 20, 16, 0.82)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(217, 185, 155, 0.4)',
            borderRadius: 'var(--radius-full)',
            padding: '0.35rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#FFFFFF'
          }}>
            <Sparkles size={13} color="#D4AF37" />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Real Artisan Cake 3D View
            </span>
          </div>

          {/* 3D Depth Tilt Indicator */}
          <div style={{
            backgroundColor: 'rgba(28, 20, 16, 0.82)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(217, 185, 155, 0.4)',
            borderRadius: 'var(--radius-full)',
            padding: '0.35rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.72rem',
            color: 'var(--brand-accent)',
            fontWeight: 600
          }}>
            <span>Hover to Tilt in 3D</span>
          </div>
        </div>

        {/* Layer 5: Floating 3D Glassmorphic Cake Info Card (Floating in Z-Space) */}
        <div
          style={{
            position: 'absolute',
            bottom: '22px',
            left: '22px',
            right: '22px',
            backgroundColor: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(16px)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.2rem 1.4rem',
            boxShadow: isHovered
              ? '0 20px 40px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(217, 185, 155, 0.5)'
              : '0 10px 25px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            zIndex: 7,
            transform: `translateZ(${isHovered ? '75px' : '30px'}) rotateX(${rotX * -0.3}deg) rotateY(${rotY * -0.3}deg)`,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 240px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
                <span className="badge badge-gold" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem', fontWeight: 800 }}>
                  {currentCake.badge}
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  &bull; {currentCake.prepTime}
                </span>
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-primary)', lineHeight: 1.25 }}>
                {currentCake.name}
              </h3>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                {currentCake.tagline}
              </p>

              {/* Flavor tags */}
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {currentCake.flavorNotes.map((fn, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.7rem',
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--brand-primary)',
                      fontWeight: 600
                    }}
                  >
                    {fn}
                  </span>
                ))}
              </div>
            </div>

            {/* Pricing & Order CTA */}
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--brand-primary)', fontFamily: 'var(--font-serif)' }}>
                  ৳{currentCake.discountPrice || currentCake.price}
                </span>
                {currentCake.discountPrice && (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: '6px' }}>
                    ৳{currentCake.price}
                  </span>
                )}
              </div>

              <Link
                to={`/product/${currentCake.slug}`}
                className="btn btn-primary btn-sm"
                style={{
                  padding: '0.45rem 1rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-full)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <span>Order This Cake</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Real-Cake Flavor Selector Carousel */}
      <div style={{ marginTop: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Choose Artisan Cake Showcase:
          </span>
          <span style={{ fontSize: '0.74rem', color: 'var(--brand-primary)', fontWeight: 600 }}>
            {selectedIndex + 1} of {REAL_CAKES.length} Real Cakes
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.75rem'
        }}>
          {REAL_CAKES.map((cake, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={cake.id}
                type="button"
                onClick={() => handleSelectCake(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.5rem 0.65rem',
                  borderRadius: 'var(--radius-lg)',
                  border: isSelected ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                  backgroundColor: isSelected ? 'var(--brand-accent-light)' : 'var(--bg-surface)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? 'var(--shadow-sm)' : 'none'
                }}
              >
                <img
                  src={cake.image}
                  alt={cake.name}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-sm)',
                    objectFit: 'cover',
                    flexShrink: 0
                  }}
                />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{
                    fontSize: '0.76rem',
                    fontWeight: isSelected ? 800 : 600,
                    color: isSelected ? 'var(--brand-primary)' : 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {cake.name.split(' ')[0]} {cake.name.split(' ')[1]}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: isSelected ? 'var(--brand-primary)' : 'var(--text-secondary)', fontWeight: 700 }}>
                    ৳{cake.discountPrice || cake.price}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
