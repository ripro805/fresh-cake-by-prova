import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Sparkles, 
  Settings, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Database, 
  MessageCircle, 
  ExternalLink,
  DollarSign,
  Copy,
  Check,
  Upload,
  Store,
  Boxes,
  TrendingUp,
  CreditCard,
  Phone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { storeService } from '../../services/storeService';
import { Product, Order, CustomCakeRequest, StoreSettings, OrderStatus, PaymentStatus, QuotationStatus, Category, CakeType } from '../../types';
import { InventoryTab } from './tabs/InventoryTab';
import { FinanceTab } from './tabs/FinanceTab';
import { PaymentsTab } from './tabs/PaymentsTab';
import { WhatsAppSettingsTab } from './tabs/WhatsAppSettingsTab';
import { ConversationsTab } from './tabs/ConversationsTab';
import { BrandLogo } from '../../components/common/BrandLogo';
import { Pagination } from '../../components/common/Pagination';

export const AdminDashboard: React.FC = () => {
  const { isAdmin, adminLogout } = useAuth();
  const { settings, updateSettings, showToast, refreshSettings } = useSettings();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get('tab') as any;

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/login', { replace: true });
    }
  }, [isAdmin, navigate]);

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'custom-cakes' | 'inventory' | 'finance' | 'payments' | 'conversations' | 'whatsapp' | 'settings'>(urlTab || 'overview');

  useEffect(() => {
    if (urlTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customCakes, setCustomCakes] = useState<CustomCakeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [productSearch, setProductSearch] = useState('');

  // Pagination States for Admin Tables
  const [orderPage, setOrderPage] = useState(1);
  const [orderPageSize, setOrderPageSize] = useState(10);

  const [productPage, setProductPage] = useState(1);
  const [productPageSize, setProductPageSize] = useState(10);

  const [customCakesPage, setCustomCakesPage] = useState(1);
  const [customCakesPageSize, setCustomCakesPageSize] = useState(5);

  useEffect(() => {
    setOrderPage(1);
  }, [orderSearch, orderStatusFilter]);

  useEffect(() => {
    setProductPage(1);
  }, [productSearch]);

  // Editing Product Modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Quotation Modal for Custom Cake
  const [quotingRequest, setQuotingRequest] = useState<CustomCakeRequest | null>(null);
  const [quoteAmount, setQuoteAmount] = useState<number>(0);
  const [quoteNotes, setQuoteNotes] = useState<string>('');

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(settings);
  const [copiedSql, setCopiedSql] = useState(false);

  const loadAllData = async () => {
    setLoading(true);
    const [pList, oList, ccList] = await Promise.all([
      storeService.getProducts(),
      storeService.getOrders(),
      storeService.getCustomCakeRequests()
    ]);
    setProducts(pList);
    setOrders(oList);
    setCustomCakes(ccList);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  // Calculations for Overview
  const totalRevenue = orders
    .filter(o => o.order_status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter(o => ['Order Placed', 'Order Confirmed', 'Preparing'].includes(o.order_status)).length;
  const completedOrders = orders.filter(o => o.order_status === 'Delivered').length;
  const pendingCustomQuotes = customCakes.filter(c => c.quotation_status === 'Pending Review').length;

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter !== 'all' && o.order_status !== orderStatusFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      const matchId = o.id.toLowerCase().includes(q);
      const matchName = o.customer_name.toLowerCase().includes(q);
      const matchPhone = o.customer_phone.includes(q);
      if (!matchId && !matchName && !matchPhone) return false;
    }
    return true;
  });

  // Filtered Products
  const filteredProducts = products.filter(p => {
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    }
    return true;
  });

  // Handlers for Orders
  const handleOrderStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await storeService.updateOrderStatus(orderId, newStatus, `Updated by Admin`);
    showToast(`Order ${orderId} updated to ${newStatus}`);
    await loadAllData();
  };

  const handlePaymentStatusChange = async (orderId: string, newStatus: PaymentStatus) => {
    await storeService.updatePaymentStatus(orderId, newStatus);
    showToast(`Order ${orderId} payment updated to ${newStatus}`);
    await loadAllData();
  };

  // Handlers for Custom Cake Quotation
  const handleOpenQuotation = (req: CustomCakeRequest) => {
    setQuotingRequest(req);
    setQuoteAmount(req.quotation_amount || 0);
    setQuoteNotes(req.admin_notes || '');
  };

  const handleSaveQuotation = async (newStatus: QuotationStatus) => {
    if (!quotingRequest) return;
    await storeService.updateQuotation(quotingRequest.id, newStatus, quoteAmount, quoteNotes);
    showToast(`Custom Cake ${quotingRequest.id} updated with quote ${settings.currency} ${quoteAmount}!`);
    setQuotingRequest(null);
    await loadAllData();
  };

  // Handlers for Products
  const handleOpenNewProduct = () => {
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      slug: `new-artisan-product-${Date.now()}`,
      name: '',
      category: 'cakes',
      cake_type: 'Celebration Cakes',
      description: '',
      price: 1500,
      discount_price: undefined,
      images: ['/images/hero_cake.jpg'],
      variants: [
        { id: `v-${Date.now()}-1`, name: '1 Pound', price: 1500, is_default: true }
      ],
      flavors: ['Caramel Vanilla', 'Belgian Chocolate'],
      availability: true,
      prep_time: '24 Hours Notice',
      is_featured: false,
      is_bestseller: false,
      is_demo: false
    };
    setEditingProduct(newProd);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editingProduct.name.trim()) {
      showToast('Product name is required.', 'error');
      return;
    }

    const slug = editingProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const toSave: Product = {
      ...editingProduct,
      slug: slug || editingProduct.slug
    };

    await storeService.saveProduct(toSave);
    showToast(`Product "${toSave.name}" saved successfully!`);
    setIsProductModalOpen(false);
    setEditingProduct(null);
    await loadAllData();
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from the store catalog?`)) {
      await storeService.deleteProduct(id);
      showToast(`Deleted "${name}"`);
      await loadAllData();
    }
  };

  // Handlers for Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(settingsForm);
    showToast('Store settings saved successfully!');
  };

  const handleCopySchemaSql = () => {
    const sql = `-- Run this in your Supabase SQL Editor:
-- View complete schema in project file: supabase_schema.sql`;
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    showToast('Copied SQL reference! You can run supabase_schema.sql in Supabase.');
    setTimeout(() => setCopiedSql(false), 2000);
  };

  if (!isAdmin) return null;

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Admin Top Navigation Bar */}
      <header style={{
        backgroundColor: 'var(--brand-dark)',
        color: '#FFFFFF',
        padding: '0.9rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(217, 185, 155, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#FFFFFF', textDecoration: 'none' }}>
            <BrandLogo size="sm" showWordmark={false} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.05em', lineHeight: 1.1 }}>
                FRESH CAKE
              </span>
              <span style={{ fontSize: '0.68rem', letterSpacing: '0.2em', color: 'var(--brand-accent)' }}>
                by PROVA &bull; Admin
              </span>
            </div>
          </Link>

          <span style={{
            fontSize: '0.72rem',
            padding: '0.2rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: '#065F46',
            color: '#FFFFFF',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34D399' }} />
            <span>Bakery Operations Active</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" target="_blank" style={{ color: 'var(--brand-accent)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>View Live Store</span>
            <ExternalLink size={14} />
          </Link>

          <button
            onClick={() => {
              showToast('Admin signed out successfully.', 'info');
              adminLogout();
              navigate('/login', { replace: true });
            }}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', color: '#C62828' }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <div style={{ display: 'flex', flexGrow: 1 }} className="admin-wrapper">
        
        {/* Sidebar Nav */}
        <aside style={{
          width: '240px',
          backgroundColor: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-subtle)',
          padding: '1.5rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          flexShrink: 0
        }} className="admin-sidebar">
          
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: activeTab === 'overview' ? 'var(--brand-accent-light)' : 'transparent',
              color: activeTab === 'overview' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: activeTab === 'orders' ? 'var(--brand-accent-light)' : 'transparent',
              color: activeTab === 'orders' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShoppingBag size={18} />
              <span>Customer Orders</span>
            </div>
            {pendingOrders > 0 && (
              <span className="badge badge-caramel" style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem' }}>
                {pendingOrders}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: activeTab === 'products' ? 'var(--brand-accent-light)' : 'transparent',
              color: activeTab === 'products' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Package size={18} />
            <span>Product Catalog</span>
          </button>

          <button
            onClick={() => setActiveTab('custom-cakes')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: activeTab === 'custom-cakes' ? 'var(--brand-accent-light)' : 'transparent',
              color: activeTab === 'custom-cakes' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Sparkles size={18} />
              <span>Custom Cake Quotes</span>
            </div>
            {pendingCustomQuotes > 0 && (
              <span className="badge badge-gold" style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem' }}>
                {pendingCustomQuotes}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: activeTab === 'inventory' ? 'var(--brand-accent-light)' : 'transparent',
              color: activeTab === 'inventory' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Boxes size={18} />
            <span>Dual Inventory</span>
          </button>

          <button
            onClick={() => setActiveTab('finance')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: activeTab === 'finance' ? 'var(--brand-accent-light)' : 'transparent',
              color: activeTab === 'finance' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <TrendingUp size={18} />
            <span>P&amp;L Financials</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: activeTab === 'payments' ? 'var(--brand-accent-light)' : 'transparent',
              color: activeTab === 'payments' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <CreditCard size={18} />
            <span>Verify Payments</span>
          </button>

          <button
            onClick={() => setActiveTab('conversations')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: activeTab === 'conversations' ? 'var(--brand-accent-light)' : 'transparent',
              color: activeTab === 'conversations' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <MessageCircle size={18} />
            <span>Support Conversations</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: activeTab === 'whatsapp' ? 'var(--brand-accent-light)' : 'transparent',
              color: activeTab === 'whatsapp' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Phone size={18} />
            <span>WhatsApp Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: activeTab === 'settings' ? 'var(--brand-accent-light)' : 'transparent',
              color: activeTab === 'settings' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Settings size={18} />
            <span>Website Management</span>
          </button>
        </aside>

        {/* Main Content Area */}
        <main style={{ flexGrow: 1, padding: '2rem', overflowY: 'auto' }}>
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', margin: '0 0 0.35rem 0' }}>Bakehouse Dashboard Overview</h2>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                  Real-time sales, order pipeline, and catalog metrics for <strong>FRESH CAKE by PROVA</strong>.
                </p>
              </div>

              {/* Stats Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem'
              }}>
                <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                    Total Store Revenue
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--brand-primary)' }}>
                    {settings.currency} {totalRevenue.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--brand-secondary)', marginTop: '4px' }}>
                    From {orders.length} orders
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                    Pending Orders
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: '#D97706' }}>
                    {pendingOrders}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Awaiting bake / dispatch
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                    Custom Cake Quotes
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--brand-primary)' }}>
                    {pendingCustomQuotes}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Pending review
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                    Active Products
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: '#047857' }}>
                    {products.filter(p => p.availability).length} / {products.length}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    In 3 Categories
                  </div>
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-subtle)',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Recent Orders</h3>
                  <button onClick={() => setActiveTab('orders')} className="btn btn-secondary btn-sm">
                    <span>View All Orders ({orders.length})</span>
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Order ID</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Customer</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Items</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Total</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Payment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map(o => (
                        <tr key={o.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '0.85rem 0.5rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
                            {o.id}
                          </td>
                          <td style={{ padding: '0.85rem 0.5rem' }}>
                            <div>{o.customer_name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{o.customer_phone}</div>
                          </td>
                          <td style={{ padding: '0.85rem 0.5rem' }}>
                            {o.items.length} items
                          </td>
                          <td style={{ padding: '0.85rem 0.5rem', fontWeight: 700 }}>
                            {settings.currency} {o.total}
                          </td>
                          <td style={{ padding: '0.85rem 0.5rem' }}>
                            <span className="badge badge-caramel">{o.order_status}</span>
                          </td>
                          <td style={{ padding: '0.85rem 0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: o.payment_status === 'verified' ? '#047857' : '#D97706' }}>
                              {o.payment_method.toUpperCase()} ({o.payment_status})
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDER MANAGEMENT */}
          {activeTab === 'orders' && (
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem', margin: '0 0 0.35rem 0' }}>Customer Orders Management</h2>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                    Track, confirm, prepare, and update payment verification for every order.
                  </p>
                </div>
              </div>

              {/* Filters Bar */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                backgroundColor: 'var(--bg-surface)',
                padding: '1rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '1.5rem'
              }}>
                <div style={{ position: 'relative', flexGrow: 1, maxWidth: '320px' }}>
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search order ID, customer name, phone..."
                    className="form-control"
                    style={{ paddingLeft: '2.4rem', height: '40px', fontSize: '0.88rem' }}
                  />
                  <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto', height: '40px', fontSize: '0.88rem' }}
                >
                  <option value="all">All Order Statuses</option>
                  <option value="Order Placed">Order Placed</option>
                  <option value="Order Confirmed">Order Confirmed</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Ready for Delivery">Ready for Delivery</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Order Cards List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {filteredOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)' }}>
                    No orders match your filter criteria.
                  </div>
                ) : (
                  <>
                    {filteredOrders.slice((orderPage - 1) * orderPageSize, orderPage * orderPageSize).map(order => (
                      <div
                        key={order.id}
                        style={{
                          backgroundColor: 'var(--bg-surface)',
                          borderRadius: 'var(--radius-xl)',
                          border: '1px solid var(--border-subtle)',
                          padding: '1.5rem',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '1rem',
                          borderBottom: '1px solid var(--border-subtle)',
                          paddingBottom: '1rem',
                          marginBottom: '1rem'
                        }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--brand-primary)' }}>
                                {order.id}
                              </h3>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Placed {new Date(order.created_at).toLocaleString()}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              <strong>{order.customer_name}</strong> &bull; {order.customer_phone} &bull; {order.delivery_type === 'delivery' ? `Delivery to: ${order.delivery_address}` : 'Store Pickup'}
                            </div>
                          </div>

                          {/* Status Selectors */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Order Status:</span>
                              <select
                                value={order.order_status}
                                onChange={(e) => handleOrderStatusChange(order.id, e.target.value as OrderStatus)}
                                className="form-select"
                                style={{ width: 'auto', padding: '0.4rem 0.8rem', height: '36px', fontSize: '0.85rem' }}
                              >
                                <option value="Order Placed">Order Placed</option>
                                <option value="Order Confirmed">Order Confirmed</option>
                                <option value="Preparing">Preparing</option>
                                <option value="Ready for Delivery">Ready for Delivery</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>

                            <div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Payment Status:</span>
                              <select
                                value={order.payment_status}
                                onChange={(e) => handlePaymentStatusChange(order.id, e.target.value as PaymentStatus)}
                                className="form-select"
                                style={{ width: 'auto', padding: '0.4rem 0.8rem', height: '36px', fontSize: '0.85rem' }}
                              >
                                <option value="pending">Pending</option>
                                <option value="verified">Verified</option>
                                <option value="failed">Failed</option>
                              </select>
                            </div>

                            {/* WhatsApp Customer Button */}
                            <a
                              href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${order.customer_name}! Updating you regarding your FRESH CAKE by PROVA order #${order.id}. Current status: ${order.order_status}.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-whatsapp btn-sm"
                              style={{ height: '36px', marginTop: '16px' }}
                              title="Chat with Customer"
                            >
                              <MessageCircle size={15} />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        </div>

                        {/* Items */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                          {order.items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                              <span>&bull; {item.quantity}x <strong>{item.product.name}</strong> ({item.selectedVariant.name}{item.selectedFlavor ? `, ${item.selectedFlavor}` : ''})</span>
                              <span>{settings.currency} {(item.selectedVariant.price || item.product.price) * item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        {order.order_notes && (
                          <div style={{ fontSize: '0.82rem', backgroundColor: 'var(--bg-secondary)', padding: '0.6rem 0.9rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                            <strong>Customer Note:</strong> {order.order_notes}
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Payment: {order.payment_method.toUpperCase()} {order.payment_trx_id && `(TrxID: ${order.payment_trx_id})`}
                          </span>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--brand-primary)' }}>
                            Total: {settings.currency} {order.total}
                          </div>
                        </div>
                      </div>
                    ))}

                    <Pagination
                      currentPage={orderPage}
                      totalPages={Math.ceil(filteredOrders.length / orderPageSize) || 1}
                      totalCount={filteredOrders.length}
                      pageSize={orderPageSize}
                      pageSizeOptions={[10, 20, 50, 100]}
                      onPageChange={setOrderPage}
                      onPageSizeChange={(sz) => { setOrderPageSize(sz); setOrderPage(1); }}
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCT MANAGEMENT */}
          {activeTab === 'products' && (
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem', margin: '0 0 0.35rem 0' }}>Bakehouse Products Catalog</h2>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                    Add, edit, manage sizes, prices, flavors, and availability for Cakes, Donuts, and Momos.
                  </p>
                </div>

                <button onClick={handleOpenNewProduct} className="btn btn-primary">
                  <Plus size={18} />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Product Search */}
              <div style={{ position: 'relative', maxWidth: '340px', marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products..."
                  className="form-control"
                  style={{ paddingLeft: '2.5rem', height: '42px', fontSize: '0.9rem' }}
                />
                <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>

              {/* Products Table */}
              <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '0.85rem 1rem' }}>Image</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Product Name</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Category &amp; Type</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Price</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Variants</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                        <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.slice((productPage - 1) * productPageSize, productPage * productPageSize).map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <img
                              src={p.images[0] || '/images/hero_cake.jpg'}
                              alt={p.name}
                              style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                            />
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</div>
                            {p.is_demo && <span className="badge badge-demo">Demo</span>}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ textTransform: 'capitalize', fontWeight: 600 }}>{p.category}</div>
                            {p.cake_type && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.cake_type}</div>}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--brand-primary)' }}>
                            {settings.currency} {p.discount_price || p.price}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', fontSize: '0.82rem' }}>
                            {p.variants.length} variant(s)
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{
                              padding: '0.2rem 0.55rem',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: p.availability ? '#ECFDF5' : '#FEF2F2',
                              color: p.availability ? '#047857' : '#B91C1C'
                            }}>
                              {p.availability ? 'Available' : 'Unavailable'}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                              <button
                                onClick={() => {
                                  setEditingProduct(p);
                                  setIsProductModalOpen(true);
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-primary)', padding: '4px' }}
                                title="Edit"
                              >
                                <Edit size={17} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C62828', padding: '4px' }}
                                title="Delete"
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ padding: '0 1rem 1rem 1rem' }}>
                  <Pagination
                    currentPage={productPage}
                    totalPages={Math.ceil(filteredProducts.length / productPageSize) || 1}
                    totalCount={filteredProducts.length}
                    pageSize={productPageSize}
                    pageSizeOptions={[10, 20, 50, 100]}
                    onPageChange={setProductPage}
                    onPageSizeChange={(sz) => { setProductPageSize(sz); setProductPage(1); }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOM CAKE REQUESTS */}
          {activeTab === 'custom-cakes' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', margin: '0 0 0.35rem 0' }}>Custom Cake Quotes &amp; Orders</h2>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                  Review submitted cake inspirations, theme requirements, and send custom quotations.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {customCakes.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)' }}>
                    No custom cake requests submitted yet.
                  </div>
                ) : (
                  <>
                    {customCakes.slice((customCakesPage - 1) * customCakesPageSize, customCakesPage * customCakesPageSize).map(req => (
                      <div
                        key={req.id}
                        style={{
                          backgroundColor: 'var(--bg-surface)',
                          borderRadius: 'var(--radius-xl)',
                          border: '1px solid var(--border-subtle)',
                          padding: '1.75rem',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--brand-primary)' }}>
                                {req.id} &bull; {req.occasion}
                              </h3>
                              <span className="badge badge-gold">{req.quotation_status}</span>
                            </div>
                            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              Customer: <strong>{req.customer_name}</strong> &bull; {req.customer_phone} &bull; Required Date: <strong>{req.delivery_date}</strong> ({req.delivery_time || 'Anytime'})
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => handleOpenQuotation(req)}
                              className="btn btn-primary btn-sm"
                            >
                              <span>Set Quotation</span>
                            </button>

                            <a
                              href={`https://wa.me/${req.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${req.customer_name}! This is FRESH CAKE by PROVA regarding your Custom Cake request #${req.id} for ${req.occasion}.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-whatsapp btn-sm"
                            >
                              <MessageCircle size={15} />
                              <span>WhatsApp Quote</span>
                            </a>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1rem' }}>
                          <div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                              <div><strong>Cake Size:</strong> {req.cake_size} &bull; {req.cake_tiers}</div>
                              <div><strong>Flavor:</strong> {req.cake_flavor}</div>
                              <div><strong>Color Palette:</strong> {req.color_preference}</div>
                              {req.custom_message && (
                                <div><strong>Piped Message:</strong> &ldquo;{req.custom_message}&rdquo;</div>
                              )}
                              <div><strong>Delivery:</strong> {req.delivery_type === 'delivery' ? `Delivery to: ${req.delivery_address}` : 'Store Pickup'}</div>
                            </div>

                            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                              <strong>Design Description:</strong>
                              <p style={{ margin: '2px 0 0 0', color: 'var(--text-secondary)' }}>{req.design_description}</p>
                            </div>
                          </div>

                          {/* Reference Image Preview */}
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                              Customer Reference Photo:
                            </div>
                            {req.reference_image ? (
                              <div style={{ width: '140px', height: '140px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                                <img src={req.reference_image} alt="Reference" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            ) : (
                              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                No reference photo attached.
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Current Quote Status */}
                        {req.quotation_amount !== undefined && (
                          <div style={{
                            backgroundColor: 'var(--brand-accent-light)',
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.9rem'
                          }}>
                            <span>Current Quotation Amount:</span>
                            <strong style={{ fontSize: '1.15rem', color: 'var(--brand-primary)', fontFamily: 'var(--font-serif)' }}>
                              {settings.currency} {req.quotation_amount}
                            </strong>
                          </div>
                        )}
                      </div>
                    ))}

                    <Pagination
                      currentPage={customCakesPage}
                      totalPages={Math.ceil(customCakes.length / customCakesPageSize) || 1}
                      totalCount={customCakes.length}
                      pageSize={customCakesPageSize}
                      pageSizeOptions={[5, 10, 20]}
                      onPageChange={setCustomCakesPage}
                      onPageSizeChange={(sz) => { setCustomCakesPageSize(sz); setCustomCakesPage(1); }}
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: STORE SETTINGS */}
          {activeTab === 'settings' && (
            <div style={{ maxWidth: '800px' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', margin: '0 0 0.35rem 0' }}>Bakehouse &amp; Store Settings</h2>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                  Manage store contact details, announcement text, WhatsApp coordinator, delivery fees, and payment accounts.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                  Brand &amp; Announcement
                </h3>

                <div className="form-group">
                  <label className="form-label">Top Announcement Bar Text:</label>
                  <input
                    type="text"
                    value={settingsForm.announcement_bar}
                    onChange={(e) => setSettingsForm({ ...settingsForm, announcement_bar: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Brand Tagline:</label>
                  <input
                    type="text"
                    value={settingsForm.tagline}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                    className="form-control"
                  />
                </div>

                <h3 style={{ fontSize: '1.15rem', margin: '1.5rem 0 1rem 0', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                  Contact Information &amp; WhatsApp
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Store Hotline Phone:</label>
                    <input
                      type="text"
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">WhatsApp Number (e.g. 8801308516242):</label>
                    <input
                      type="text"
                      value={settingsForm.whatsapp_number}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_number: e.target.value })}
                      className="form-control"
                      placeholder="01308516242"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Baking House Address:</label>
                    <input
                      type="text"
                      value={settingsForm.baking_house_address || settingsForm.address || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, baking_house_address: e.target.value, address: e.target.value })}
                      className="form-control"
                      placeholder="Upazila Road, Indra Mor, Kushtia, Bangladesh"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pickup Point Address:</label>
                    <input
                      type="text"
                      value={settingsForm.pickup_point_address || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, pickup_point_address: e.target.value })}
                      className="form-control"
                      placeholder="Upazila Mor, Disha Tower, Kushtia, Bangladesh"
                    />
                  </div>
                </div>

                <h3 style={{ fontSize: '1.15rem', margin: '1.5rem 0 1rem 0', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                  Delivery Charges &amp; Mobile Payments
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Inside Kushtia Town (৳):</label>
                    <input
                      type="number"
                      value={settingsForm.delivery_charge_inside}
                      onChange={(e) => setSettingsForm({ ...settingsForm, delivery_charge_inside: Number(e.target.value) })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Outside Kushtia Town (৳):</label>
                    <input
                      type="number"
                      value={settingsForm.delivery_charge_outside}
                      onChange={(e) => setSettingsForm({ ...settingsForm, delivery_charge_outside: Number(e.target.value) })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pickup Point (৳):</label>
                    <input
                      type="number"
                      value={settingsForm.delivery_charge_pickup ?? 0}
                      onChange={(e) => setSettingsForm({ ...settingsForm, delivery_charge_pickup: Number(e.target.value) })}
                      className="form-control"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">bKash Account Details:</label>
                    <input
                      type="text"
                      value={settingsForm.bkash_number}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bkash_number: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nagad Account Details:</label>
                    <input
                      type="text"
                      value={settingsForm.nagad_number}
                      onChange={(e) => setSettingsForm({ ...settingsForm, nagad_number: e.target.value })}
                      className="form-control"
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: '1rem' }}>
                  <span>Save All Store Settings</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB: CUSTOMER CONVERSATIONS */}
          {activeTab === 'conversations' && <ConversationsTab />}

          {/* TAB: WHATSAPP CHAT SETTINGS */}
          {activeTab === 'whatsapp' && <WhatsAppSettingsTab />}

          {/* TAB 7: INVENTORY */}
          {activeTab === 'inventory' && <InventoryTab />}

          {/* TAB 8: FINANCE */}
          {activeTab === 'finance' && <FinanceTab />}

          {/* TAB 9: PAYMENTS */}
          {activeTab === 'payments' && <PaymentsTab />}

        </main>
      </div>

      {/* PRODUCT ADD / EDIT MODAL */}
      {isProductModalOpen && editingProduct && (
        <div className="modal-overlay" onClick={() => setIsProductModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>
              {editingProduct.id.includes(Date.now().toString().slice(0, 4)) ? 'Add New Product' : `Edit: ${editingProduct.name}`}
            </h3>

            <form onSubmit={handleSaveProduct}>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="e.g. Salted Caramel Celebration Cake"
                  className="form-control"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category (ONLY 3):</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as Category })}
                    className="form-select"
                  >
                    <option value="cakes">Cakes</option>
                    <option value="donuts">Donuts</option>
                    <option value="momos">Momos</option>
                  </select>
                </div>

                {editingProduct.category === 'cakes' && (
                  <div className="form-group">
                    <label className="form-label">Cake Variety / Format:</label>
                    <select
                      value={editingProduct.cake_type || 'Celebration Cakes'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, cake_type: e.target.value as CakeType })}
                      className="form-select"
                    >
                      <option value="Celebration Cakes">Celebration Cakes</option>
                      <option value="Tub Cakes">Tub Cakes</option>
                      <option value="Mart Cakes">Mart Cakes (Bento)</option>
                      <option value="Cup Cakes">Cup Cakes</option>
                      <option value="Customized Cakes">Customized Cakes</option>
                      <option value="Chocolate Cakes">Chocolate Cakes</option>
                      <option value="Red Velvet Cakes">Red Velvet Cakes</option>
                      <option value="Fresh Cream Cakes">Fresh Cream Cakes</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Base Price ({settings.currency}) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Discount Price (Optional)</label>
                  <input
                    type="number"
                    value={editingProduct.discount_price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, discount_price: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="Leave empty if none"
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Preparation Notice (e.g. 24 Hours Notice):</label>
                <input
                  type="text"
                  value={editingProduct.prep_time || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, prep_time: e.target.value })}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={editingProduct.availability}
                    onChange={(e) => setEditingProduct({ ...editingProduct, availability: e.target.checked })}
                  />
                  <span>Available for Order</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={editingProduct.is_bestseller}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_bestseller: e.target.checked })}
                  />
                  <span>Mark as Bestseller</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUOTATION MODAL */}
      {quotingRequest && (
        <div className="modal-overlay" onClick={() => setQuotingRequest(null)}>
          <div className="modal-content" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>
              Send Quotation: {quotingRequest.id}
            </h3>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Customer: <strong>{quotingRequest.customer_name}</strong> &bull; {quotingRequest.occasion} ({quotingRequest.cake_size}, {quotingRequest.cake_tiers})
            </p>

            <div className="form-group">
              <label className="form-label">Quotation Amount ({settings.currency}) *</label>
              <input
                type="number"
                required
                value={quoteAmount}
                onChange={(e) => setQuoteAmount(Number(e.target.value))}
                className="form-control"
                placeholder="e.g. 3800"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Admin Notes / Specs:</label>
              <textarea
                rows={3}
                value={quoteNotes}
                onChange={(e) => setQuoteNotes(e.target.value)}
                placeholder="e.g. Includes gold leaf accents and fresh flowers"
                className="form-control"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setQuotingRequest(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleSaveQuotation('Quotation Sent')}
                className="btn btn-primary"
              >
                Update &amp; Send Quote
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
