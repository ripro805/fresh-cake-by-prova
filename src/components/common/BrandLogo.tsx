import React from 'react';

export interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'splash' | number;
  showWordmark?: boolean;
  wordmarkDirection?: 'row' | 'column';
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  withContainerBorder?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

const SIZE_MAP = {
  xs: 28,
  sm: 36,
  md: 46,
  lg: 64,
  xl: 96,
  splash: 150
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showWordmark = false,
  wordmarkDirection = 'row',
  id,
  className = '',
  style,
  onClick,
  withContainerBorder = false,
  onLoad,
  onError
}) => {
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || 46;

  const logoImg = (
    <div
      id={id}
      style={{
        width: `${pixelSize}px`,
        height: `${pixelSize}px`,
        minWidth: `${pixelSize}px`,
        minHeight: `${pixelSize}px`,
        borderRadius: '50%',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: withContainerBorder
          ? '0 4px 14px rgba(74, 36, 24, 0.12), 0 0 0 2px #C8954A'
          : '0 2px 8px rgba(74, 36, 24, 0.08)',
        border: withContainerBorder ? '2px solid #FFFFFF' : '1px solid rgba(200, 149, 74, 0.35)',
        flexShrink: 0,
        ...style
      }}
      className={`brand-logo-container ${className}`}
      onClick={onClick}
    >
      <img
        src="/brand/logo.jpeg"
        alt="FRESH CAKE by PROVA Official Logo"
        width={pixelSize}
        height={pixelSize}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          transform: 'scale(1.02)'
        }}
        onLoad={onLoad}
        onError={onError}
        loading="eager"
      />
    </div>
  );

  if (!showWordmark) {
    return logoImg;
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: wordmarkDirection === 'column' ? '0.35rem' : '0.75rem',
        flexDirection: wordmarkDirection,
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={onClick}
    >
      {logoImg}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: wordmarkDirection === 'column' ? 'center' : 'flex-start',
          lineHeight: 1.15
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: pixelSize >= 64 ? '1.75rem' : pixelSize >= 44 ? '1.35rem' : '1.1rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap'
          }}
        >
          FRESH CAKE
        </span>
        <span
          style={{
            fontSize: pixelSize >= 64 ? '0.8rem' : '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.24em',
            color: 'var(--brand-secondary)',
            textTransform: 'uppercase',
            marginTop: '2px',
            whiteSpace: 'nowrap'
          }}
        >
          by PROVA
        </span>
      </div>
    </div>
  );
};
