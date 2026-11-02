import React, { useEffect, useState, useRef } from 'react';

interface BrandSplashIntroProps {
  onComplete: () => void;
}

export const BrandSplashIntro: React.FC<BrandSplashIntroProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'entrance' | 'transitioning' | 'done'>('entrance');
  const [transformStyle, setTransformStyle] = useState<React.CSSProperties>({});
  const [backdropOpacity, setBackdropOpacity] = useState(1);
  const splashLogoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      onComplete();
      return;
    }

    // Safety timeout: Never hang or show infinite splash
    const safetyTimeout = setTimeout(() => {
      onComplete();
    }, 2800);

    // Step 1 -> Step 2: Entrance completes after 1.2 seconds, start Step 3 (glide to navbar)
    const transitionTimer = setTimeout(() => {
      const navbarLogo = document.getElementById('navbar-brand-logo');
      const splashLogo = splashLogoRef.current;

      if (navbarLogo && splashLogo) {
        const targetRect = navbarLogo.getBoundingClientRect();
        const splashRect = splashLogo.getBoundingClientRect();

        const splashCenterX = splashRect.left + splashRect.width / 2;
        const splashCenterY = splashRect.top + splashRect.height / 2;

        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;

        const deltaX = targetCenterX - splashCenterX;
        const deltaY = targetCenterY - splashCenterY;
        const targetScale = targetRect.width / splashRect.width;

        setPhase('transitioning');
        setBackdropOpacity(0);

        setTransformStyle({
          transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${targetScale})`,
          transition: 'transform 0.68s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.68s ease',
          zIndex: 10001
        });

        // After glide completes, reveal full site and cleanup
        setTimeout(() => {
          setPhase('done');
          onComplete();
        }, 700);
      } else {
        // Fallback: fade out smoothly
        setPhase('transitioning');
        setBackdropOpacity(0);
        setTimeout(() => {
          setPhase('done');
          onComplete();
        }, 400);
      }
    }, 1250);

    return () => {
      clearTimeout(safetyTimeout);
      clearTimeout(transitionTimer);
    };
  }, [onComplete]);

  if (phase === 'done') return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        pointerEvents: phase === 'transitioning' ? 'none' : 'auto',
        overflow: 'hidden'
      }}
      aria-label="Welcome to FRESH CAKE by PROVA"
    >
      {/* Warm Cream Luxury Backdrop with Gold & Chocolate Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, #FFF9F0 0%, #F5E8D3 55%, #E8D3BC 100%)',
          opacity: backdropOpacity,
          transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: 'none'
        }}
      />

      {/* Decorative Subtle Bakery Flourish / Radiance Ring */}
      <div
        style={{
          position: 'absolute',
          width: 'min(90vw, 420px)',
          height: 'min(90vw, 420px)',
          borderRadius: '50%',
          border: '1px solid rgba(200, 149, 74, 0.25)',
          boxShadow: '0 0 60px rgba(200, 149, 74, 0.15)',
          opacity: backdropOpacity,
          transition: 'opacity 0.5s ease',
          pointerEvents: 'none',
          animation: 'pulseGlow 3s ease-in-out infinite'
        }}
      />

      {/* Center Branded Presentation Group */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          zIndex: 10001
        }}
      >
        {/* Animated Official Logo Frame */}
        <div
          ref={splashLogoRef}
          style={{
            width: 'clamp(120px, 20vw, 160px)',
            height: 'clamp(120px, 20vw, 160px)',
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 20px 50px rgba(74, 36, 24, 0.22), 0 0 0 4px #C8954A',
            border: '4px solid #FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transformOrigin: 'center center',
            animation: phase === 'entrance' ? 'splashLogoEntrance 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards' : undefined,
            ...transformStyle
          }}
        >
          <img
            src="/brand/logo.jpeg"
            alt="FRESH CAKE by PROVA"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              transform: 'scale(1.03)'
            }}
          />
        </div>

        {/* Text Wordmark & Tagline (Fades out when transitioning into navbar) */}
        <div
          style={{
            marginTop: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: phase === 'entrance' ? backdropOpacity : 0,
            transform: phase === 'entrance' ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.35s ease, transform 0.35s ease'
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: '#32180F',
              lineHeight: 1.15
            }}
          >
            FRESH CAKE
          </span>
          <span
            style={{
              fontSize: 'clamp(0.75rem, 1.5vw, 0.95rem)',
              fontWeight: 700,
              letterSpacing: '0.3em',
              color: '#9E6B3E',
              textTransform: 'uppercase',
              marginTop: '4px'
            }}
          >
            by PROVA
          </span>

          <div
            style={{
              marginTop: '0.85rem',
              height: '2px',
              width: '48px',
              backgroundColor: '#C8954A',
              borderRadius: '2px'
            }}
          />

          <p
            style={{
              fontSize: '0.88rem',
              color: '#5C473A',
              marginTop: '0.75rem',
              letterSpacing: '0.02em',
              fontWeight: 500
            }}
          >
            Artisan Patisserie &amp; Bakery • Kushtia
          </p>
        </div>
      </div>

      {/* Skip Button for immediate interaction */}
      {phase === 'entrance' && (
        <button
          onClick={() => onComplete()}
          style={{
            position: 'absolute',
            bottom: '24px',
            background: 'none',
            border: 'none',
            color: '#79543D',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '8px 16px',
            opacity: 0.7,
            transition: 'opacity 0.2s ease',
            textDecoration: 'underline'
          }}
          aria-label="Skip Introduction"
        >
          Skip into Bakery
        </button>
      )}

      {/* Embedded scoped animations */}
      <style>{`
        @keyframes splashLogoEntrance {
          0% {
            opacity: 0;
            transform: scale(0.82) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes pulseGlow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.35;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.65;
          }
        }
      `}</style>
    </div>
  );
};
