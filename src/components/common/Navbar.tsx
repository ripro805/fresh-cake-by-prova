import React, { useState, useEffect, useRef } from 'react';
import { getWhatsAppUrl } from '../../lib/whatsapp';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Menu, 
  X, 
  Search, 
  Phone, 
  Cake, 
  Sparkles,
  ChevronDown,
  Truck,
  Layers,
  LayoutDashboard,
  Package,
  Boxes,
  CreditCard,
  TrendingUp,
  Settings,
  MessageCircle,
  LogOut,
  MapPin,
  Star,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { cartCount, setIsCartDrawerOpen, wishlist } = useCart();
  const { settings, showToast } = useSettings();
  const { isAdmin, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileShopExpanded, setMobileShopExpanded] = useState(true);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const shopDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const shopTimeoutRef = useRef<any>(null);

  // Detect scroll for sticky elevation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on outside click or route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShopDropdownOpen(false);
    setProfileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shopDropdownRef.current && !shopDropdownRef.current.contains(event.target as Node)) {
        setShopDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard accessibility (ESC to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShopDropdownOpen(false);
        setProfileMenuOpen(false);
        setSearchOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleAnchorClick = (e: React.MouseEvent, anchorId: 'about' | 'contact') => {
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById(anchorId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Let the Link navigate to /#about or /#contact
    }
    setMobileMenuOpen(false);
  };

  const handleLogoutAction = () => {
    showToast('You have been signed out successfully.', 'info');
    logout();
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    navigate('/login', { replace: true });
  };

  const isShopActive = ['/shop', '/cakes', '/donuts', '/momos'].includes(location.pathname);

  const handleShopMouseEnter = () => {
    if (shopTimeoutRef.current) clearTimeout(shopTimeoutRef.current);
    setShopDropdownOpen(true);
  };

  const handleShopMouseLeave = () => {
    shopTimeoutRef.current = setTimeout(() => {
      setShopDropdownOpen(false);
    }, 180);
  };

  return (
    <>
      {/* Top Announcement Bar */}
      {settings.announcement_bar && (
        <div style={{
          backgroundColor: 'var(--brand-primary)',
          color: '#FAF6EF',
          padding: '0.45rem 1rem',
          textAlign: 'center',
          fontSize: '0.82rem',
          fontWeight: 500,
          letterSpacing: '0.04em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          zIndex: 60,
          position: 'relative'
        }}>
          <Sparkles size={14} style={{ color: 'var(--brand-accent)' }} />
          <span>{settings.announcement_bar}</span>
          <span style={{ opacity: 0.7, margin: '0 0.5rem' }}>|</span>
          <a 
            href={`tel:${settings.phone}`} 
            style={{ 
              color: 'var(--brand-accent)', 
              fontWeight: 600, 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '4px' 
            }}
          >
            <Phone size={12} /> {settings.phone}
          </a>
        </div>
      )}

      {/* Main Sticky Navbar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: isScrolled ? 'rgba(250, 246, 239, 0.96)' : 'var(--bg-primary)',
          backdropFilter: isScrolled ? 'blur(12px)' : 'none',
          borderBottom: '1px solid var(--border-subtle)',
          boxShadow: isScrolled ? 'var(--shadow-sm)' : 'none',
          transition: 'all var(--transition-normal)'
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '82px' }}>
          
          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--brand-primary)',
              padding: '6px'
            }}
            className="mobile-nav-toggle"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>

          {/* Brand Logo & Wordmark */}
          <Link 
            to="/" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center',
              textDecoration: 'none'
            }}
            aria-label="FRESH CAKE by PROVA - Home"
          >
            <BrandLogo id="navbar-brand-logo" size="md" showWordmark={true} withContainerBorder={true} />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '1.85rem' }}>
            {/* 1. Home */}
            <NavLink 
              to="/" 
              style={({ isActive }) => ({
                fontWeight: 600,
                fontSize: '0.94rem',
                color: isActive ? 'var(--brand-primary)' : 'var(--text-primary)',
                borderBottom: isActive ? '2px solid var(--brand-primary)' : '2px solid transparent',
                paddingBottom: '4px',
                transition: 'color var(--transition-fast)'
              })}
            >
              Home
            </NavLink>

            {/* 2. Shop with Integrated Category Dropdown */}
            <div 
              ref={shopDropdownRef}
              style={{ position: 'relative' }}
              onMouseEnter={handleShopMouseEnter}
              onMouseLeave={handleShopMouseLeave}
            >
              <button
                type="button"
                onClick={() => setShopDropdownOpen(!shopDropdownOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.94rem',
                  color: isShopActive ? 'var(--brand-primary)' : 'var(--text-primary)',
                  borderBottom: isShopActive ? '2px solid var(--brand-primary)' : '2px solid transparent',
                  paddingBottom: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'color var(--transition-fast)'
                }}
                aria-expanded={shopDropdownOpen}
                aria-haspopup="true"
              >
                <span>Shop</span>
                <ChevronDown 
                  size={15} 
                  style={{ 
                    transition: 'transform var(--transition-fast)',
                    transform: shopDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                  }} 
                />
              </button>

              {/* Shop Dropdown Menu */}
              {shopDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 14px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '280px',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-xl)',
                    zIndex: 100,
                    padding: '0.65rem',
                    animation: 'slideUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <Link
                    to="/shop"
                    onClick={() => setShopDropdownOpen(false)}
                    className="nav-dropdown-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.7rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      textDecoration: 'none',
                      color: 'var(--text-primary)',
                      borderBottom: '1px solid var(--border-subtle)',
                      marginBottom: '4px'
                    }}
                  >
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'var(--brand-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)', flexShrink: 0 }}>
                      <Layers size={17} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>All Products</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Complete Patisserie Collection</div>
                    </div>
                  </Link>

                  <Link
                    to="/cakes"
                    onClick={() => setShopDropdownOpen(false)}
                    className="nav-dropdown-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.65rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      textDecoration: 'none',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#FDF2F4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D946EF', flexShrink: 0 }}>
                      <Cake size={17} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Cakes</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Celebration, Tub &amp; Bento Cakes</div>
                    </div>
                  </Link>

                  <Link
                    to="/donuts"
                    onClick={() => setShopDropdownOpen(false)}
                    className="nav-dropdown-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.65rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      textDecoration: 'none',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', flexShrink: 0 }}>
                      <span style={{ fontSize: '1.05rem' }}>🍩</span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Donuts</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Gourmet Glazed &amp; Filled Rings</div>
                    </div>
                  </Link>

                  <Link
                    to="/momos"
                    onClick={() => setShopDropdownOpen(false)}
                    className="nav-dropdown-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.65rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      textDecoration: 'none',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A', flexShrink: 0 }}>
                      <span style={{ fontSize: '1.05rem' }}>🥟</span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Momos</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Savory Steamed &amp; Pan-Fried</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* 3. Custom Cake */}
            <NavLink 
              to="/custom-cake" 
              style={({ isActive }) => ({
                fontWeight: 600,
                fontSize: '0.94rem',
                color: isActive ? 'var(--brand-primary)' : 'var(--brand-secondary)',
                backgroundColor: 'var(--brand-accent-light)',
                padding: '0.35rem 0.95rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-accent)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all var(--transition-fast)'
              })}
            >
              <Sparkles size={14} /> Custom Cake
            </NavLink>

            {/* 4. Track Order */}
            <NavLink 
              to="/track-order" 
              style={({ isActive }) => ({
                fontWeight: 600,
                fontSize: '0.94rem',
                color: isActive ? 'var(--brand-primary)' : 'var(--text-primary)',
                borderBottom: isActive ? '2px solid var(--brand-primary)' : '2px solid transparent',
                paddingBottom: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'color var(--transition-fast)'
              })}
            >
              <Truck size={15} /> Track Order
            </NavLink>

            {/* 5. About */}
            <Link 
              to="/#about"
              onClick={(e) => handleAnchorClick(e, 'about')}
              style={{
                fontWeight: 600,
                fontSize: '0.94rem',
                color: 'var(--text-primary)',
                borderBottom: '2px solid transparent',
                paddingBottom: '4px',
                textDecoration: 'none',
                transition: 'color var(--transition-fast)'
              }}
            >
              About
            </Link>

            {/* 6. Contact */}
            <Link 
              to="/#contact"
              onClick={(e) => handleAnchorClick(e, 'contact')}
              style={{
                fontWeight: 600,
                fontSize: '0.94rem',
                color: 'var(--text-primary)',
                borderBottom: '2px solid transparent',
                paddingBottom: '4px',
                textDecoration: 'none',
                transition: 'color var(--transition-fast)'
              }}
            >
              Contact
            </Link>
          </nav>

          {/* Action Icons: Search, Profile, Wishlist, Cart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            
            {/* Search Trigger Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color var(--transition-fast)'
              }}
              title="Search Products"
              aria-label="Search Products"
            >
              <Search size={21} />
            </button>

            {/* Role-Aware Profile: Unauthenticated Guest goes to /login, Authenticated triggers dynamic dropdown */}
            {!isAdmin && !currentUser ? (
              <Link
                to="/login"
                style={{
                  color: 'var(--text-primary)',
                  padding: '8px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all var(--transition-fast)'
                }}
                title="Sign In / Register"
                aria-label="Sign In / Register"
              >
                <User size={21} />
              </Link>
            ) : (
              <div ref={profileDropdownRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  style={{
                    background: profileMenuOpen ? 'var(--brand-accent-light)' : 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: profileMenuOpen ? 'var(--brand-primary)' : 'var(--text-primary)',
                    padding: '8px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all var(--transition-fast)'
                  }}
                  title={isAdmin ? "Owner Admin Portal" : `Account: ${currentUser?.name}`}
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="true"
                >
                  <User size={21} />
                </button>

                {/* Profile Dropdown Menu */}
                {profileMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 12px)',
                      right: 0,
                      width: '290px',
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-subtle)',
                      boxShadow: 'var(--shadow-xl)',
                      zIndex: 100,
                      overflow: 'hidden',
                      animation: 'slideUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    {/* Header based on Role */}
                    {isAdmin ? (
                      /* Admin Header */
                      <div style={{
                        backgroundColor: 'var(--brand-primary)',
                        color: '#FFFFFF',
                        padding: '1.1rem',
                        borderBottom: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.85, fontWeight: 700 }}>
                          FRESH CAKE by PROVA
                        </div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-serif)', marginTop: '2px' }}>
                          Owner Admin Center
                        </div>
                        <span style={{
                          display: 'inline-block',
                          backgroundColor: 'rgba(212, 175, 55, 0.25)',
                          color: '#FDE68A',
                          border: '1px solid rgba(212, 175, 55, 0.5)',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.55rem',
                          marginTop: '6px'
                        }}>
                          👑 Full Business Authority
                        </span>
                      </div>
                    ) : (
                      /* Customer Header */
                      <div style={{
                        backgroundColor: 'var(--bg-secondary)',
                        padding: '1.1rem',
                        borderBottom: '1px solid var(--border-subtle)'
                      }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--brand-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                          Bakehouse Member
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                          {currentUser?.name || 'Customer Account'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {currentUser?.phone || currentUser?.email || 'Valued Patron'}
                        </div>
                      </div>
                    )}

                    {/* Navigation Items */}
                    <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '0.35rem 0' }}>
                      {isAdmin ? (
                        /* Admin Authenticated Navigation Links */
                        <>
                          <div style={{ padding: '0.35rem 1rem 0.2rem 1rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                            Store Operations
                          </div>
                          <Link to="/admin" onClick={() => setProfileMenuOpen(false)} className="profile-dropdown-item">
                            <LayoutDashboard size={15} style={{ color: 'var(--brand-primary)' }} />
                            <span>Admin Dashboard</span>
                          </Link>
                          <Link to="/admin?tab=orders" onClick={() => setProfileMenuOpen(false)} className="profile-dropdown-item">
                            <ShoppingBag size={15} style={{ color: 'var(--brand-primary)' }} />
                            <span>Manage Orders</span>
                          </Link>
                          <Link to="/admin?tab=products" onClick={() => setProfileMenuOpen(false)} className="profile-dropdown-item">
                            <Package size={15} style={{ color: 'var(--brand-primary)' }} />
                            <span>Products Management</span>
                          </Link>
                          <Link to="/admin?tab=inventory" onClick={() => setProfileMenuOpen(false)} className="profile-dropdown-item">
                            <Boxes size={15} style={{ color: 'var(--brand-primary)' }} />
                            <span>Inventory Management</span>
                          </Link>

                          <div style={{ padding: '0.45rem 1rem 0.2rem 1rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em', borderTop: '1px solid var(--border-subtle)', marginTop: '0.35rem' }}>
                            Finance &amp; Custom Orders
                          </div>
                          <Link to="/admin?tab=payments" onClick={() => setProfileMenuOpen(false)} className="profile-dropdown-item">
                            <CreditCard size={15} style={{ color: 'var(--brand-primary)' }} />
                            <span>Payments</span>
                          </Link>
                          <Link to="/admin?tab=custom-cakes" onClick={() => setProfileMenuOpen(false)} className="profile-dropdown-item">
                            <Sparkles size={15} style={{ color: 'var(--brand-secondary)' }} />
                            <span>Custom Cake Requests</span>
                          </Link>
                          <Link to="/admin?tab=finance" onClick={() => setProfileMenuOpen(false)} className="profile-dropdown-item">
                            <TrendingUp size={15} style={{ color: 'var(--brand-primary)' }} />
                            <span>Financial Reports</span>
                          </Link>

                          <div style={{ padding: '0.45rem 1rem 0.2rem 1rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em', borderTop: '1px solid var(--border-subtle)', marginTop: '0.35rem' }}>
                            Configuration &amp; Account
                          </div>
                          <Link to="/admin?tab=settings" onClick={() => setProfileMenuOpen(false)} className="profile-dropdown-item">
                            <Settings size={15} style={{ color: 'var(--brand-primary)' }} />
                            <span>Website Management</span>
                          </Link>
                          <Link to="/admin?tab=whatsapp" onClick={() => setProfileMenuOpen(false)} className="profile-dropdown-item">
                            <Phone size={15} style={{ color: '#25D366' }} />
                            <span>WhatsApp Chat Settings</span>
                          </Link>
                          <Link to="/account" onClick={() => setProfileMenuOpen(false)} className="profile-dropdown-item">
                            <User size={15} style={{ color: 'var(--brand-primary)' }} />
                            <span>My Account</span>
                          </Link>
                        </>
                      ) : (
                        /* Customer Authenticated Navigation Links */
                        <>
                          <div style={{ padding: '0.35rem 1rem 0.2rem 1rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                            Account &amp; Dashboard
                          </div>
                          <Link to="/account?tab=profile" onClick={() => setProfileMenuOpen(false)} className="profile-dropdown-item">
                            <User size={15} style={{ color: 'var(--brand-primary)' }} />
                            <span>My Profile</span>
                          </Link>
                          <Link to="/account?tab=overview" onClick={() => setProfileMenuOpen(false)} className="profile-dropdown-item">
                            <LayoutDashboard size={15} style={{ color: 'var(--brand-primary)' }} />
                            <span>Customer Dashboard</span>
                          </Link>

                          <div style={{ padding: '0.45rem 1rem 0.2rem 1rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em', borderTop: '1px solid var(--border-subtle)', marginTop: '0.35rem' }}>
                            Orders &amp; Tracking
                          </div>
                          <Link to="/account?tab=orders" onClick={() => setProfileMenuOpen(false)} className="profile-dropdown-item">
                            <ShoppingBag size={15} style={{ color: 'var(--brand-primary)' }} />
                            <span>My Orders</span>
                          </Link>
                          <Link to="/account?tab=orders" onClick={() => setProfileMenuOpen(false)} className="profile-dropdown-item">
                            <Package size={15} style={{ color: 'var(--brand-primary)' }} />
                            <span>Order History</span>
                          </Link>
                          <Link to="/track-order" onClick={() => setProfileMenuOpen(false)} className="profile-dropdown-item">
                            <Truck size={15} style={{ color: 'var(--brand-primary)' }} />
                            <span>Track Order</span>
                          </Link>
                          <Link to="/account?tab=custom-cakes" onClick={() => setProfileMenuOpen(false)} className="profile-dropdown-item">
                            <Sparkles size={15} style={{ color: 'var(--brand-secondary)' }} />
                            <span>Custom Cake Requests</span>
                          </Link>

                          <div style={{ padding: '0.45rem 1rem 0.2rem 1rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em', borderTop: '1px solid var(--border-subtle)', marginTop: '0.35rem' }}>
                            Saved &amp; Preferences
                          </div>
                          <Link to="/account?tab=wishlist" onClick={() => setProfileMenuOpen(false)} className="profile-dropdown-item">
                            <Heart size={15} style={{ color: '#E11D48' }} />
                            <span>Wishlist</span>
                          </Link>
                          <Link to="/account?tab=addresses" onClick={() => setProfileMenuOpen(false)} className="profile-dropdown-item">
                            <MapPin size={15} style={{ color: 'var(--brand-primary)' }} />
                            <span>Saved Addresses</span>
                          </Link>
                          <Link to="/account?tab=reviews" onClick={() => setProfileMenuOpen(false)} className="profile-dropdown-item">
                            <Star size={15} style={{ color: '#D97706' }} />
                            <span>Reviews</span>
                          </Link>
                          <Link to="/account?tab=settings" onClick={() => setProfileMenuOpen(false)} className="profile-dropdown-item">
                            <Settings size={15} style={{ color: 'var(--brand-primary)' }} />
                            <span>Settings</span>
                          </Link>
                        </>
                      )}

                      {/* Unified Sign Out Item */}
                      <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '0.45rem', paddingTop: '0.35rem' }}>
                        <button
                          type="button"
                          onClick={handleLogoutAction}
                          className="profile-dropdown-item"
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            background: 'none',
                            border: 'none',
                            color: '#C62828',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <LogOut size={15} style={{ color: '#C62828' }} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Icon */}
            <Link
              to="/account?tab=wishlist"
              style={{
                position: 'relative',
                color: 'var(--text-primary)',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color var(--transition-fast)'
              }}
              title="Saved Wishlist"
              aria-label="Wishlist"
            >
              <Heart size={21} />
              {wishlist.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  backgroundColor: 'var(--brand-secondary)',
                  color: 'white',
                  borderRadius: '50%',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Drawer Trigger Button */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              style={{
                position: 'relative',
                backgroundColor: 'var(--brand-primary)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                padding: '0.55rem 1.15rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 600,
                fontSize: '0.9rem',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all var(--transition-fast)'
              }}
              aria-label="View Shopping Cart"
            >
              <ShoppingBag size={18} />
              <span>Cart</span>
              <span style={{
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--brand-primary)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.1rem 0.5rem',
                marginLeft: '2px'
              }}>
                {cartCount}
              </span>
            </button>
          </div>

        </div>

        {/* Search Flyout Overlay */}
        {searchOpen && (
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border-subtle)',
            padding: '1rem 0',
            animation: 'fadeIn 0.2s ease'
          }}>
            <div className="container">
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', maxWidth: '640px', margin: '0 auto' }}>
                <div style={{ position: 'relative', flexGrow: 1 }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for Tub cakes, Belgian Chocolate, Bento Cakes, Donuts, Momos..."
                    className="form-control"
                    autoFocus
                    style={{ paddingLeft: '2.8rem' }}
                  />
                  <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
                <button type="submit" className="btn btn-primary btn-sm">
                  Search
                </button>
                <button 
                  type="button" 
                  onClick={() => setSearchOpen(false)} 
                  className="btn btn-secondary btn-sm"
                >
                  Close
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(34, 24, 18, 0.65)',
            zIndex: 999,
            display: 'flex',
            animation: 'fadeIn 0.2s ease'
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            style={{
              width: '84%',
              maxWidth: '350px',
              backgroundColor: 'var(--bg-primary)',
              height: '100%',
              padding: '2rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-xl)',
              animation: 'slideInRight 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
              <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none' }}>
                <BrandLogo size="sm" showWordmark={true} withContainerBorder={true} />
              </Link>
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: '4px' }}
                aria-label="Close Menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Mobile Navigation Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flexGrow: 1 }}>
              <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>
                Home
              </Link>

              {/* Shop Submenu in Mobile */}
              <div>
                <button
                  type="button"
                  onClick={() => setMobileShopExpanded(!mobileShopExpanded)}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    padding: '4px 0'
                  }}
                >
                  <span>Shop</span>
                  <ChevronDown size={18} style={{ transform: mobileShopExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </button>

                {mobileShopExpanded && (
                  <div style={{ paddingLeft: '1rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', borderLeft: '2px solid var(--border-subtle)' }}>
                    <Link to="/shop" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--brand-primary)', textDecoration: 'none' }}>
                      All Products
                    </Link>
                    <Link to="/cakes" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '0.96rem', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none' }}>
                      🎂 Cakes (Celebration &amp; Tub)
                    </Link>
                    <Link to="/donuts" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '0.96rem', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none' }}>
                      🍩 Gourmet Donuts
                    </Link>
                    <Link to="/momos" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '0.96rem', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none' }}>
                      🥟 Himalayan Momos
                    </Link>
                  </div>
                )}
              </div>

              <Link to="/custom-cake" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--brand-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} /> Custom Cake
              </Link>

              <Link to="/track-order" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Truck size={16} /> Track Order
              </Link>

              <Link to="/#about" onClick={(e) => handleAnchorClick(e, 'about')} style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>
                About
              </Link>

              <Link to="/#contact" onClick={(e) => handleAnchorClick(e, 'contact')} style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>
                Contact
              </Link>

              {/* Role-Specific Mobile Links */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '0.85rem', paddingTop: '1rem' }}>
                {isAdmin ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--brand-primary)', fontWeight: 700, letterSpacing: '0.08em' }}>
                      Admin Center
                    </div>
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--brand-primary)', textDecoration: 'none' }}>
                      📊 Admin Dashboard
                    </Link>
                    <Link to="/admin?tab=orders" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>
                      📦 Manage Orders
                    </Link>
                    <Link to="/admin?tab=products" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>
                      🎂 Products Management
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogoutAction}
                      style={{ background: 'none', border: 'none', textAlign: 'left', color: '#C62828', fontWeight: 700, fontSize: '0.96rem', cursor: 'pointer', padding: 0, marginTop: '4px' }}
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                ) : currentUser ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--brand-secondary)', fontWeight: 700, letterSpacing: '0.08em' }}>
                      Account ({currentUser.name})
                    </div>
                    <Link to="/account?tab=overview" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>
                      👤 Customer Dashboard
                    </Link>
                    <Link to="/account?tab=orders" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>
                      📦 My Orders
                    </Link>
                    <Link to="/account?tab=wishlist" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>
                      ❤️ Wishlist
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogoutAction}
                      style={{ background: 'none', border: 'none', textAlign: 'left', color: '#C62828', fontWeight: 700, fontSize: '0.96rem', cursor: 'pointer', padding: 0, marginTop: '4px' }}
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}
                  >
                    <span>Sign In / Register</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Footer */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', marginTop: 'auto' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Need assistance?</p>
              <a href={`tel:${settings.phone}`} style={{ fontWeight: 600, color: 'var(--brand-primary)', display: 'block', marginBottom: '0.35rem', textDecoration: 'none' }}>
                {settings.phone}
              </a>
              <a href={getWhatsAppUrl(settings.whatsapp_number, "Hello FRESH CAKE by PROVA! I would like to enquire about your cakes.")} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.88rem', color: '#25D366', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>WhatsApp Live Chat</span> &rarr;
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Header CSS override */}
      <style>{`
        @media (max-width: 960px) {
          .desktop-nav { display: none !important; }
          .mobile-nav-toggle { display: block !important; }
        }
      `}</style>
    </>
  );
};
