import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  ShoppingBag, 
  Heart, 
  MapPin, 
  LogOut, 
  Clock, 
  Truck, 
  Sparkles, 
  LayoutDashboard, 
  Star, 
  Settings, 
  Package, 
  MessageCircle, 
  CheckCircle2, 
  Calendar, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Plus,
  ArrowRight,
  FileText,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { storeService } from '../services/storeService';
import { Order, Product, CustomCakeRequest } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { BrandLogo } from '../components/common/BrandLogo';
import { Pagination } from '../components/common/Pagination';

export type AccountTab = 
  | 'overview' 
  | 'orders' 
  | 'profile' 
  | 'addresses' 
  | 'custom-cakes' 
  | 'wishlist' 
  | 'reviews' 
  | 'settings';

export const AccountPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') || 'overview';

  // Normalize tab
  const validTabs: AccountTab[] = [
    'overview',
    'orders',
    'profile',
    'addresses',
    'custom-cakes',
    'wishlist',
    'reviews',
    'settings'
  ];

  const initialTab: AccountTab = validTabs.includes(rawTab as AccountTab)
    ? (rawTab as AccountTab)
    : 'overview';

  const [activeTab, setActiveTab] = useState<AccountTab>(initialTab);

  const { currentUser, logout, isAdmin, updateCustomerProfile } = useAuth();
  const { wishlist } = useCart();
  const { settings, showToast } = useSettings();
  const navigate = useNavigate();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!currentUser && !isAdmin) {
      navigate('/login', { state: { from: '/account' }, replace: true });
    }
  }, [currentUser, isAdmin, navigate]);

  // Sync state when URL search params change
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && validTabs.includes(tabFromUrl as AccountTab)) {
      setActiveTab(tabFromUrl as AccountTab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: AccountTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [customCakeRequests, setCustomCakeRequests] = useState<CustomCakeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit profile form state
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');

  // Address form modal / toggle
  const [newAddressText, setNewAddressText] = useState('');
  const [newAddressLabel, setNewAddressLabel] = useState('Home');
  const [showAddAddress, setShowAddAddress] = useState(false);

  // Reviews state (mockable customer review submission)
  const [customerReviews, setCustomerReviews] = useState([
    {
      id: 'rev-1',
      productName: 'Belgian Chocolate Truffle Cake',
      rating: 5,
      date: 'October 20, 2026',
      comment: 'Rich, moist and perfectly balanced. The handmade buttercream piping made our anniversary truly special!',
      approved: true
    },
    {
      id: 'rev-2',
      productName: 'Lotus Biscoff Tub Cake',
      rating: 5,
      date: 'October 14, 2026',
      comment: 'Absolutely addictive! Delivered super fast with cooling pack.',
      approved: true
    }
  ]);
  const [reviewFormProduct, setReviewFormProduct] = useState('');
  const [reviewFormRating, setReviewFormRating] = useState(5);
  const [reviewFormComment, setReviewFormComment] = useState('');

  // Pagination states for account tabs
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersPageSize, setOrdersPageSize] = useState(5);

  const [customCakesPage, setCustomCakesPage] = useState(1);
  const [customCakesPageSize, setCustomCakesPageSize] = useState(5);

  const [wishlistPage, setWishlistPage] = useState(1);
  const [wishlistPageSize, setWishlistPageSize] = useState(6);

  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsPageSize, setReviewsPageSize] = useState(5);

  // Convert accepted custom cake to official order modal state
  const [convertingCake, setConvertingCake] = useState<CustomCakeRequest | null>(null);
  const [convertDeliveryZone, setConvertDeliveryZone] = useState('INSIDE_KUSHTIA');
  const [convertDeliveryAddress, setConvertDeliveryAddress] = useState('');
  const [convertPaymentMethod, setConvertPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [convertTrxId, setConvertTrxId] = useState('');
  const [convertSenderPhone, setConvertSenderPhone] = useState('');
  const [convertSubmitting, setConvertSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name || '');
      setProfileEmail(currentUser.email || '');
      setProfilePhone(currentUser.phone || '');
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser && !isAdmin) return;

    const loadData = async () => {
      setLoading(true);
      const [allOrders, allProducts, allCakes] = await Promise.all([
        storeService.getOrders(),
        storeService.getProducts(),
        storeService.getCustomCakeRequests()
      ]);

      // Filter orders by current user phone if available
      if (currentUser?.phone) {
        const userOrders = allOrders.filter(
          o => o.customer_phone.includes(currentUser.phone) || currentUser.phone.includes(o.customer_phone)
        );
        setOrders(userOrders);

        const userCakes = allCakes.filter(
          c => c.customer_phone.includes(currentUser.phone) || currentUser.phone.includes(c.customer_phone)
        );
        setCustomCakeRequests(userCakes);
      } else {
        setOrders(allOrders.slice(0, 5));
        setCustomCakeRequests(allCakes.slice(0, 3));
      }

      // Filter wishlist products
      const saved = allProducts.filter(p => wishlist.includes(p.id));
      setWishlistProducts(saved);

      setLoading(false);
    };

    loadData();
  }, [currentUser, isAdmin, wishlist]);

  const handleLogout = () => {
    showToast('You have been signed out successfully.', 'info');
    logout();
    navigate('/login', { replace: true });
  };

  const handleRespondQuotation = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      const updated = await storeService.respondToCustomCakeQuotation(requestId, action);
      if (updated) {
        setCustomCakeRequests(prev => prev.map(c => c.id === requestId ? { ...c, quotation_status: updated.quotation_status } : c));
        showToast(
          action === 'accept'
            ? 'Quotation accepted! Our bakery team will contact you.'
            : 'Quotation declined.',
          action === 'accept' ? 'success' : 'info'
        );
      }
    } catch {
      showToast('Could not respond to quotation. Please try again.', 'error');
    }
  };

  const handleStartConvertCake = (req: CustomCakeRequest) => {
    setConvertingCake(req);
    setConvertDeliveryAddress(req.delivery_address || currentUser?.addresses?.[0]?.address || '');
    setConvertDeliveryZone(req.delivery_type === 'delivery' ? 'INSIDE_KUSHTIA' : 'PICKUP');
    setConvertPaymentMethod('cod');
    setConvertTrxId('');
    setConvertSenderPhone(currentUser?.phone || '');
  };

  const handleConfirmConvertCake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingCake) return;

    if (convertingCake.delivery_type === 'delivery' && !convertDeliveryAddress.trim()) {
      showToast('Please provide a delivery address.', 'error');
      return;
    }

    if ((convertPaymentMethod === 'bkash' || convertPaymentMethod === 'nagad') && !convertTrxId.trim()) {
      showToast(`Please enter the ${convertPaymentMethod.toUpperCase()} Transaction ID (TrxID).`, 'error');
      return;
    }

    try {
      setConvertSubmitting(true);
      const newOrder = await storeService.convertCustomCakeToOrder(convertingCake.id, {
        payment_method: convertPaymentMethod,
        delivery_zone_code: convertDeliveryZone,
        delivery_address: convertDeliveryAddress.trim(),
        payment_trx_id: convertTrxId.trim() || undefined,
        payment_sender_phone: convertSenderPhone.trim() || undefined
      });

      showToast(`Order #${newOrder?.order_number || newOrder?.id || ''} placed! Custom cake is now in production.`, 'success');
      setConvertingCake(null);

      // Refresh data
      const [allOrders, allCakes] = await Promise.all([
        storeService.getOrders(),
        storeService.getCustomCakeRequests()
      ]);
      if (currentUser?.phone) {
        setOrders(allOrders.filter(o => o.customer_phone.includes(currentUser.phone) || currentUser.phone.includes(o.customer_phone)));
        setCustomCakeRequests(allCakes.filter(c => c.customer_phone.includes(currentUser.phone) || currentUser.phone.includes(c.customer_phone)));
      } else {
        setOrders(allOrders);
        setCustomCakeRequests(allCakes);
      }
      setActiveTab('orders');
    } catch (err: any) {
      showToast(err?.message || 'Could not place order. Please try again.', 'error');
    } finally {
      setConvertSubmitting(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      showToast('Name cannot be empty.', 'error');
      return;
    }
    updateCustomerProfile({
      name: profileName.trim(),
      email: profileEmail.trim(),
      phone: profilePhone.trim()
    });
    showToast('Profile information updated successfully!', 'success');
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressText.trim()) {
      showToast('Please enter an address.', 'error');
      return;
    }
    const currentAddresses = currentUser?.addresses || [];
    const newAddr = {
      id: `addr-${Date.now()}`,
      label: newAddressLabel,
      address: newAddressText.trim(),
      is_default: currentAddresses.length === 0
    };
    updateCustomerProfile({
      addresses: [...currentAddresses, newAddr]
    });
    setNewAddressText('');
    setShowAddAddress(false);
    showToast('New delivery address added!', 'success');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewFormProduct.trim() || !reviewFormComment.trim()) {
      showToast('Please fill out the product and comment fields.', 'error');
      return;
    }
    const newRev = {
      id: `rev-${Date.now()}`,
      productName: reviewFormProduct.trim(),
      rating: reviewFormRating,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      comment: reviewFormComment.trim(),
      approved: true
    };
    setCustomerReviews([newRev, ...customerReviews]);
    setReviewFormProduct('');
    setReviewFormComment('');
    showToast('Thank you! Your verified review has been submitted.', 'success');
  };

  if (!currentUser && !isAdmin) {
    return null;
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '2.5rem 0 6rem 0', minHeight: '85vh' }}>
      <div className="container">
        
        {/* Customer Profile Header Banner */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem 2.5rem',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              backgroundColor: 'var(--brand-accent-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-primary)',
              fontWeight: 800,
              fontSize: '1.5rem',
              fontFamily: 'var(--font-serif)',
              border: '2px solid var(--border-accent)'
            }}>
              {currentUser?.name ? currentUser.name[0].toUpperCase() : 'C'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="badge badge-caramel" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={11} /> Bakehouse Patron
                </span>
                {isAdmin && (
                  <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                    👑 Owner Admin
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: '1.75rem', margin: 0, lineHeight: 1.2 }}>
                {currentUser?.name || 'Customer Account'}
              </h1>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '4px' }}>
                {currentUser?.phone && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={13} /> {currentUser.phone}
                  </span>
                )}
                {currentUser?.email && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Mail size={13} /> {currentUser.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <BrandLogo size="xs" showWordmark={false} />
            <Link to="/track-order" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={15} />
              <span>Track Live Order</span>
            </Link>
            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              style={{ color: '#C62828', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <div style={{
          display: 'flex',
          overflowX: 'auto',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '2rem',
          paddingBottom: '2px',
          scrollbarWidth: 'none'
        }}>
          <button
            onClick={() => handleTabChange('overview')}
            style={{
              padding: '0.75rem 1.15rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'overview' ? '3px solid var(--brand-primary)' : '3px solid transparent',
              color: activeTab === 'overview' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'overview' ? 700 : 500,
              fontSize: '0.94rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              whiteSpace: 'nowrap'
            }}
          >
            <LayoutDashboard size={17} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => handleTabChange('profile')}
            style={{
              padding: '0.75rem 1.15rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'profile' ? '3px solid var(--brand-primary)' : '3px solid transparent',
              color: activeTab === 'profile' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'profile' ? 700 : 500,
              fontSize: '0.94rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              whiteSpace: 'nowrap'
            }}
          >
            <User size={17} />
            <span>My Profile</span>
          </button>

          <button
            onClick={() => handleTabChange('orders')}
            style={{
              padding: '0.75rem 1.15rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'orders' ? '3px solid var(--brand-primary)' : '3px solid transparent',
              color: activeTab === 'orders' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'orders' ? 700 : 500,
              fontSize: '0.94rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              whiteSpace: 'nowrap'
            }}
          >
            <ShoppingBag size={17} />
            <span>My Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('custom-cakes')}
            style={{
              padding: '0.75rem 1.15rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'custom-cakes' ? '3px solid var(--brand-primary)' : '3px solid transparent',
              color: activeTab === 'custom-cakes' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'custom-cakes' ? 700 : 500,
              fontSize: '0.94rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              whiteSpace: 'nowrap'
            }}
          >
            <Sparkles size={17} />
            <span>Custom Cakes ({customCakeRequests.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('wishlist')}
            style={{
              padding: '0.75rem 1.15rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'wishlist' ? '3px solid var(--brand-primary)' : '3px solid transparent',
              color: activeTab === 'wishlist' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'wishlist' ? 700 : 500,
              fontSize: '0.94rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              whiteSpace: 'nowrap'
            }}
          >
            <Heart size={17} />
            <span>Wishlist ({wishlistProducts.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('addresses')}
            style={{
              padding: '0.75rem 1.15rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'addresses' ? '3px solid var(--brand-primary)' : '3px solid transparent',
              color: activeTab === 'addresses' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'addresses' ? 700 : 500,
              fontSize: '0.94rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              whiteSpace: 'nowrap'
            }}
          >
            <MapPin size={17} />
            <span>Saved Addresses</span>
          </button>

          <button
            onClick={() => handleTabChange('reviews')}
            style={{
              padding: '0.75rem 1.15rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'reviews' ? '3px solid var(--brand-primary)' : '3px solid transparent',
              color: activeTab === 'reviews' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'reviews' ? 700 : 500,
              fontSize: '0.94rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              whiteSpace: 'nowrap'
            }}
          >
            <Star size={17} />
            <span>Reviews</span>
          </button>

          <button
            onClick={() => handleTabChange('settings')}
            style={{
              padding: '0.75rem 1.15rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'settings' ? '3px solid var(--brand-primary)' : '3px solid transparent',
              color: activeTab === 'settings' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'settings' ? 700 : 500,
              fontSize: '0.94rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              whiteSpace: 'nowrap'
            }}
          >
            <Settings size={17} />
            <span>Settings</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW (Customer Dashboard) */}
        {activeTab === 'overview' && (
          <div>
            {/* Quick Metrics Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2.5rem'
            }}>
              <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Orders</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--brand-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
                    <ShoppingBag size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--brand-primary)' }}>
                  {orders.length}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Freshly baked delights
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Custom Cake Requests</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--brand-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-secondary)' }}>
                    <Sparkles size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--brand-primary)' }}>
                  {customCakeRequests.length}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Bespoke cake quotes
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Saved Wishlist</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--brand-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E11D48' }}>
                    <Heart size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--brand-primary)' }}>
                  {wishlist.length}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Favorites for future celebrations
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Saved Addresses</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--brand-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
                    <MapPin size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--brand-primary)' }}>
                  {currentUser?.addresses?.length || 1}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Fast checkout locations
                </div>
              </div>
            </div>

            {/* Quick Actions Strip */}
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.75rem 2rem',
              marginBottom: '2.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              border: '1px solid var(--border-subtle)'
            }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', margin: '0 0 4px 0' }}>Planning an upcoming celebration?</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Custom cakes are handcrafted with 24h notice. Explore fresh bakery treats or design a bespoke tier.
                </p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                <Link to="/custom-cake" className="btn btn-primary btn-sm">
                  <Sparkles size={14} />
                  <span>Request Custom Cake</span>
                </Link>
                <Link to="/shop" className="btn btn-secondary btn-sm">
                  <span>Browse Bakery Menu</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.35rem', margin: 0 }}>Recent Orders</h2>
                <button
                  onClick={() => handleTabChange('orders')}
                  style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>View All Orders &rarr;</span>
                </button>
              </div>

              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                  <ShoppingBag size={36} style={{ color: 'var(--brand-secondary)', margin: '0 auto 0.75rem auto' }} />
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>No Recent Orders</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                    Treat yourself to fresh cakes, glazed donuts, and hot Himalayan momos.
                  </p>
                  <Link to="/shop" className="btn btn-primary btn-sm">Browse Products</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {orders.slice(0, 2).map(order => (
                    <div
                      key={order.id}
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-subtle)',
                        padding: '1.5rem',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Placed on {new Date(order.created_at).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                          Order #{order.id}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          {order.items.length} items &bull; Total: <strong>{settings.currency} {order.total}</strong>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span className="badge badge-caramel">{order.order_status}</span>
                        <Link
                          to={`/order-confirmation/${order.id}`}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                          title="View Official Receipt"
                        >
                          <FileText size={14} />
                          <span>Receipt</span>
                        </Link>
                        <Link
                          to={`/track-order?id=${order.id}&phone=${encodeURIComponent(order.customer_phone)}`}
                          className="btn btn-secondary btn-sm"
                        >
                          <Truck size={14} />
                          <span>Track Live</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MY PROFILE */}
        {activeTab === 'profile' && (
          <div style={{ maxWidth: '640px' }}>
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: '2.5rem',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Personal Profile</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                Keep your contact details up to date to receive order updates and bakery receipts.
              </p>

              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Full Name *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="form-control"
                      style={{ paddingLeft: '2.6rem' }}
                    />
                    <User size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Phone Number (used for order tracking) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      required
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="form-control"
                      style={{ paddingLeft: '2.6rem' }}
                    />
                    <Phone size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="form-control"
                      style={{ paddingLeft: '2.6rem' }}
                    />
                    <Mail size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <div style={{ paddingTop: '0.75rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.75rem' }}>
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: MY ORDERS & ORDER HISTORY */}
        {activeTab === 'orders' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', margin: 0 }}>My Orders &amp; History</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
                  Review active orders and previous celebration treats.
                </p>
              </div>
              <Link to="/track-order" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Truck size={15} />
                <span>Track By Order ID</span>
              </Link>
            </div>

            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)' }}>
                <ShoppingBag size={42} style={{ color: 'var(--brand-secondary)', margin: '0 auto 1rem auto' }} />
                <h3>No Orders Recorded Yet</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Explore our artisan cakes, gourmet donuts, and savory momos.
                </p>
                <Link to="/shop" className="btn btn-primary btn-sm">
                  <span>Explore Bakery Menu</span>
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {orders.slice((ordersPage - 1) * ordersPageSize, ordersPage * ordersPageSize).map(order => (
                  <div
                    key={order.id}
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-xl)',
                      border: '1px solid var(--border-subtle)',
                      padding: '1.75rem 2rem',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Placed on {new Date(order.created_at).toLocaleDateString()}
                        </div>
                        <h3 style={{ fontSize: '1.25rem', margin: '2px 0 0 0' }}>
                          Order #{order.id}
                        </h3>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span className="badge badge-caramel">
                          {order.order_status}
                        </span>
                        <Link
                          to={`/order-confirmation/${order.id}`}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                          title="View Official Receipt"
                        >
                          <FileText size={14} />
                          <span>Receipt</span>
                        </Link>
                        <Link
                          to={`/track-order?id=${order.id}&phone=${encodeURIComponent(order.customer_phone)}`}
                          className="btn btn-secondary btn-sm"
                        >
                          <Truck size={14} />
                          <span>Track Live</span>
                        </Link>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                      {order.items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
                          <span>{item.quantity}x {item.product.name} ({item.selectedVariant.name})</span>
                          <strong>{settings.currency} {(item.selectedVariant.price || item.product.price) * item.quantity}</strong>
                        </div>
                      ))}
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                        Payment: <strong>{order.payment_method.toUpperCase()}</strong> ({order.payment_status})
                      </span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--brand-primary)' }}>
                        Total: {settings.currency} {order.total}
                      </div>
                    </div>
                  </div>
                ))}

                <Pagination
                  currentPage={ordersPage}
                  totalPages={Math.ceil(orders.length / ordersPageSize) || 1}
                  totalCount={orders.length}
                  pageSize={ordersPageSize}
                  pageSizeOptions={[5, 10, 20]}
                  onPageChange={setOrdersPage}
                  onPageSizeChange={(sz) => { setOrdersPageSize(sz); setOrdersPage(1); }}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CUSTOM CAKE REQUESTS */}
        {activeTab === 'custom-cakes' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Custom Cake Requests</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
                  Track your bespoke celebration quotations and design status.
                </p>
              </div>
              <Link to="/custom-cake" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={15} />
                <span>New Custom Request</span>
              </Link>
            </div>

            {customCakeRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)' }}>
                <Sparkles size={40} style={{ color: 'var(--brand-secondary)', margin: '0 auto 1rem auto' }} />
                <h3>No Custom Cake Requests Yet</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Have a dream cake in mind? Submit an inspiration photo and our head pastry chef will provide a price quote.
                </p>
                <Link to="/custom-cake" className="btn btn-primary btn-sm">
                  <span>Start Custom Cake Request</span>
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {customCakeRequests.slice((customCakesPage - 1) * customCakesPageSize, customCakesPage * customCakesPageSize).map(req => (
                  <div
                    key={req.id}
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-xl)',
                      border: '1px solid var(--border-subtle)',
                      padding: '1.75rem 2rem',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                      <div>
                        <span className="badge badge-caramel" style={{ marginBottom: '4px' }}>
                          {req.occasion}
                        </span>
                        <h3 style={{ fontSize: '1.25rem', margin: '2px 0 0 0' }}>
                          Request #{req.id}
                        </h3>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Submitted on {new Date(req.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span className="badge badge-gold" style={{ fontSize: '0.78rem' }}>
                          {req.quotation_status}
                        </span>
                        {req.quotation_amount ? (
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-primary)', fontFamily: 'var(--font-serif)', marginTop: '4px' }}>
                            Quote: {settings.currency} {req.quotation_amount}
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Price review in progress
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Size &amp; Tiers</div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>{req.cake_size} &bull; {req.cake_tiers}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Flavor</div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>{req.cake_flavor}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Required Date</div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>{req.delivery_date}</div>
                      </div>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      <strong>Design Notes:</strong> {req.design_description}
                    </div>

                    {req.admin_notes && (
                      <div style={{ backgroundColor: 'var(--brand-accent-light)', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', color: 'var(--brand-primary)', borderLeft: '4px solid var(--brand-secondary)', marginBottom: req.quotation_status === 'Quotation Sent' ? '1rem' : 0 }}>
                        <strong>Bakery Chef Note:</strong> {req.admin_notes}
                      </div>
                    )}

                    {req.quotation_status === 'Quotation Sent' && (
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ padding: '0.5rem 1.25rem', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          onClick={() => handleRespondQuotation(req.id, 'accept')}
                        >
                          <CheckCircle2 size={16} /> Accept Quotation
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ padding: '0.5rem 1.25rem', fontSize: '0.88rem' }}
                          onClick={() => handleRespondQuotation(req.id, 'reject')}
                        >
                          Decline
                        </button>
                      </div>
                    )}

                    {req.quotation_status === 'Accepted' && (
                      <div style={{
                        marginTop: '1rem',
                        padding: '1rem 1.25rem',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: 'var(--brand-accent-light)',
                        border: '1px solid var(--brand-secondary)',
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }}>
                            <CheckCircle2 size={18} color="var(--brand-primary)" />
                            Quotation Accepted — Ready for Production!
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            Confirm your delivery details &amp; payment method to start bakery preparation.
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ padding: '0.55rem 1.25rem', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                          onClick={() => handleStartConvertCake(req)}
                        >
                          <ShoppingBag size={16} /> Place Official Order Now
                        </button>
                      </div>
                    )}

                    {req.quotation_status === 'Completed' && (
                      <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#ecfdf5',
                        color: '#065f46',
                        border: '1px solid #a7f3d0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.85rem'
                      }}>
                        <CheckCircle2 size={16} color="#059669" />
                        <span><strong>Official Order Placed:</strong> This custom celebration cake is in active bakery production! Check the <strong>Orders</strong> tab to track live baking and delivery progress.</span>
                      </div>
                    )}
                  </div>
                ))}

                <Pagination
                  currentPage={customCakesPage}
                  totalPages={Math.ceil(customCakeRequests.length / customCakesPageSize) || 1}
                  totalCount={customCakeRequests.length}
                  pageSize={customCakesPageSize}
                  pageSizeOptions={[5, 10, 20]}
                  onPageChange={setCustomCakesPage}
                  onPageSizeChange={(sz) => { setCustomCakesPageSize(sz); setCustomCakesPage(1); }}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 5: WISHLIST */}
        {activeTab === 'wishlist' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Saved Wishlist</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
                Your saved bakery inspirations ready for instant ordering.
              </p>
            </div>

            {wishlistProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)' }}>
                <Heart size={40} style={{ color: 'var(--brand-secondary)', margin: '0 auto 1rem auto' }} />
                <h3>Your Wishlist is Empty</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Tap the heart icon on any cake, donut, or momo to save it for your next celebration.
                </p>
                <Link to="/cakes" className="btn btn-primary btn-sm">
                  <span>Browse Cakes Collection</span>
                </Link>
              </div>
            ) : (
              <div>
                <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
                  {wishlistProducts.slice((wishlistPage - 1) * wishlistPageSize, wishlistPage * wishlistPageSize).map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                <Pagination
                  currentPage={wishlistPage}
                  totalPages={Math.ceil(wishlistProducts.length / wishlistPageSize) || 1}
                  totalCount={wishlistProducts.length}
                  pageSize={wishlistPageSize}
                  pageSizeOptions={[6, 12, 24]}
                  onPageChange={setWishlistPage}
                  onPageSizeChange={(sz) => { setWishlistPageSize(sz); setWishlistPage(1); }}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 6: SAVED ADDRESSES */}
        {activeTab === 'addresses' && (
          <div style={{ maxWidth: '680px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Delivery Addresses</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
                  Manage saved delivery destinations for seamless checkout.
                </p>
              </div>
              <button
                onClick={() => setShowAddAddress(!showAddAddress)}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={15} />
                <span>Add Address</span>
              </button>
            </div>

            {showAddAddress && (
              <div style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.75rem',
                border: '1px solid var(--border-subtle)',
                marginBottom: '1.75rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Add New Address</h3>
                <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Label (e.g. Home, Office, Studio)
                    </label>
                    <input
                      type="text"
                      value={newAddressLabel}
                      onChange={(e) => setNewAddressLabel(e.target.value)}
                      className="form-control"
                      placeholder="Home"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Complete Delivery Address *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={newAddressText}
                      onChange={(e) => setNewAddressText(e.target.value)}
                      className="form-control"
                      placeholder="House / Apartment, Road, Area, Kushtia / Dhaka"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="submit" className="btn btn-primary btn-sm">Save Address</button>
                    <button type="button" onClick={() => setShowAddAddress(false)} className="btn btn-secondary btn-sm">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(currentUser?.addresses || []).map((addr, idx) => (
                <div
                  key={addr.id || idx}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--brand-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)', flexShrink: 0 }}>
                      <MapPin size={20} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '1rem' }}>{addr.label || 'Delivery Address'}</strong>
                        {addr.is_default && (
                          <span className="badge badge-caramel" style={{ fontSize: '0.7rem' }}>Default</span>
                        )}
                      </div>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5 }}>
                        {addr.address}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {(!currentUser?.addresses || currentUser.addresses.length === 0) && (
                <div style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <MapPin size={24} style={{ color: 'var(--brand-primary)' }} />
                  <div>
                    <strong>Default Town Address</strong>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      Kushtia Town, Kushtia, Bangladesh
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: REVIEWS */}
        {activeTab === 'reviews' && (
          <div style={{ maxWidth: '680px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Customer Reviews</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
                  Your celebration feedback and verified bakery reviews.
                </p>
              </div>
            </div>

            {/* Submit New Review Form */}
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.75rem',
              border: '1px solid var(--border-subtle)',
              marginBottom: '2rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Leave a Celebration Review</h3>
              <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Cake or Specialty Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Belgian Chocolate Truffle Cake"
                    value={reviewFormProduct}
                    onChange={(e) => setReviewFormProduct(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Rating
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewFormRating(star)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: star <= reviewFormRating ? '#D97706' : 'var(--border-subtle)',
                          padding: '4px'
                        }}
                      >
                        <Star size={24} fill={star <= reviewFormRating ? '#D97706' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Your Experience &amp; Taste Notes *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Tell us how the cake was enjoyed at your event..."
                    value={reviewFormComment}
                    onChange={(e) => setReviewFormComment(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Submit Verified Review
                  </button>
                </div>
              </form>
            </div>

            {/* List of Reviews */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {customerReviews.slice((reviewsPage - 1) * reviewsPageSize, reviewsPage * reviewsPageSize).map(rev => (
                <div
                  key={rev.id}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{rev.productName}</strong>
                    <div style={{ display: 'flex', color: '#D97706' }}>
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={14} fill="#D97706" />
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    Reviewed on {rev.date} &bull; Verified Order
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, fontStyle: 'italic' }}>
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>
              ))}

              <Pagination
                currentPage={reviewsPage}
                totalPages={Math.ceil(customerReviews.length / reviewsPageSize) || 1}
                totalCount={customerReviews.length}
                pageSize={reviewsPageSize}
                pageSizeOptions={[5, 10, 20]}
                onPageChange={setReviewsPage}
                onPageSizeChange={(sz) => { setReviewsPageSize(sz); setReviewsPage(1); }}
              />
            </div>
          </div>
        )}

        {/* TAB 8: SETTINGS */}
        {activeTab === 'settings' && (
          <div style={{ maxWidth: '640px' }}>
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: '2.5rem',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Account Preferences</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                Manage notification preferences and security settings.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem' }}>WhatsApp Order Notifications</strong>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Receive preparation and delivery updates directly on WhatsApp
                    </span>
                  </div>
                  <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: 'var(--brand-primary)' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem' }}>SMS Delivery Alerts</strong>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Get SMS notifications when rider is out for delivery
                    </span>
                  </div>
                  <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: 'var(--brand-primary)' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem' }}>Artisan Specials &amp; Seasonal Menus</strong>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Occasional updates about limited holiday cake collections
                    </span>
                  </div>
                  <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: 'var(--brand-primary)' }} />
                </div>

                <div style={{ paddingTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => showToast('Preferences updated successfully!', 'success')}
                    className="btn btn-primary"
                    style={{ padding: '0.65rem 1.75rem' }}
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* CONVERT CUSTOM CAKE TO OFFICIAL ORDER MODAL */}
      {convertingCake && (
        <div className="modal-overlay" onClick={() => !convertSubmitting && setConvertingCake(null)}>
          <div className="modal-content" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBag size={20} color="var(--brand-primary)" />
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Confirm Custom Cake Order</h3>
              </div>
              <button
                type="button"
                onClick={() => setConvertingCake(null)}
                disabled={convertSubmitting}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ backgroundColor: 'var(--brand-accent-light)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <strong style={{ color: 'var(--brand-primary)' }}>Request #{convertingCake.id}</strong>
                <span className="badge badge-gold">{convertingCake.occasion}</span>
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                {convertingCake.cake_flavor} &bull; {convertingCake.cake_size} &bull; {convertingCake.cake_tiers}
              </div>
              <div style={{ marginTop: '8px', fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-primary)', fontFamily: 'var(--font-serif)' }}>
                Quoted Price: {settings.currency} {convertingCake.quotation_amount}
              </div>
            </div>

            <form onSubmit={handleConfirmConvertCake}>
              {convertingCake.delivery_type === 'delivery' && (
                <>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Delivery Zone *</label>
                    <select
                      className="form-control"
                      value={convertDeliveryZone}
                      onChange={(e) => setConvertDeliveryZone(e.target.value)}
                    >
                      <option value="INSIDE_KUSHTIA">Inside Kushtia Town ({settings.currency} {settings.delivery_charge_inside})</option>
                      <option value="OUTSIDE_KUSHTIA">Outside Kushtia Town ({settings.currency} {settings.delivery_charge_outside})</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Delivery Address *</label>
                    <textarea
                      rows={2}
                      required
                      className="form-control"
                      value={convertDeliveryAddress}
                      onChange={(e) => setConvertDeliveryAddress(e.target.value)}
                      placeholder="Street, Building, Landmark, Kushtia"
                    />
                  </div>
                </>
              )}

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Payment Method *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {(['cod', 'bkash', 'nagad'] as const).map(pm => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setConvertPaymentMethod(pm)}
                      style={{
                        padding: '0.6rem 0.5rem',
                        borderRadius: 'var(--radius-md)',
                        border: convertPaymentMethod === pm ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                        backgroundColor: convertPaymentMethod === pm ? 'var(--brand-accent-light)' : 'var(--bg-surface)',
                        fontWeight: convertPaymentMethod === pm ? 700 : 500,
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      {pm === 'cod' ? 'Cash on Delivery' : pm.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {(convertPaymentMethod === 'bkash' || convertPaymentMethod === 'nagad') && (
                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Send payment to <strong>01308516242</strong> (Personal) via {convertPaymentMethod.toUpperCase()} and enter details below:
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem' }}>TrxID *</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="e.g. 9J38XKL"
                        value={convertTrxId}
                        onChange={(e) => setConvertTrxId(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem' }}>Sender Phone *</label>
                      <input
                        type="tel"
                        required
                        className="form-control"
                        placeholder="e.g. 018XXXXXXXX"
                        value={convertSenderPhone}
                        onChange={(e) => setConvertSenderPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 0', borderTop: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 600 }}>Estimated Total:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-primary)', fontFamily: 'var(--font-serif)' }}>
                  {settings.currency} {(convertingCake.quotation_amount || 0) + (convertingCake.delivery_type === 'delivery' ? (convertDeliveryZone === 'INSIDE_KUSHTIA' ? settings.delivery_charge_inside : settings.delivery_charge_outside) : 0)}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={convertSubmitting}
                  onClick={() => setConvertingCake(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={convertSubmitting}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <ShoppingBag size={16} />
                  {convertSubmitting ? 'Placing Order...' : 'Confirm Bakery Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
