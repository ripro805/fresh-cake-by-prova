import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Filter, 
  Search, 
  Grid3X3, 
  LayoutList, 
  RotateCcw, 
  Cake, 
  SlidersHorizontal,
  X,
  Star,
  Check,
  Tag,
  Loader2
} from 'lucide-react';
import { Product, Category, CakeType } from '../types';
import { storeService } from '../services/storeService';
import { ProductCard } from '../components/product/ProductCard';
import { useSettings } from '../context/SettingsContext';
import { BrandLogo } from '../components/common/BrandLogo';
import { Pagination } from '../components/common/Pagination';

interface ShopPageProps {
  forcedCategory?: Category;
}

const CAKE_TYPES: CakeType[] = [
  'Tub Cakes',
  'Mart Cakes',
  'Cup Cakes',
  'Customized Cakes',
  'Birthday Cakes',
  'Chocolate Cakes',
  'Vanilla Cakes',
  'Red Velvet Cakes',
  'Fresh Cream Cakes',
  'Theme Cakes',
  'Anniversary Cakes',
  'Celebration Cakes'
];

const FLAVORS = [
  'Belgian Chocolate',
  'Salted Caramel',
  'Madagascar Vanilla',
  'Red Velvet Cream Cheese',
  'Dark Truffle',
  'Lotus Biscoff',
  'Mango Passion',
  'Nutella Hazelnut',
  'Mocha Espresso'
];

export const ShopPage: React.FC<ShopPageProps> = ({ forcedCategory }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { settings } = useSettings();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Active filters from URL or defaults
  const categoryParam = (forcedCategory || searchParams.get('category') || 'all') as Category | 'all';
  const typeParam = searchParams.get('cake_type') || 'all';
  const flavorParam = searchParams.get('flavor') || 'all';
  const queryParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'featured';
  const maxPriceParam = Number(searchParams.get('max_price')) || 10000;
  const inStockParam = searchParams.get('in_stock') === 'true';
  const discountedParam = searchParams.get('is_discounted') === 'true';
  const minRatingParam = Number(searchParams.get('min_rating')) || 0;

  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>(categoryParam);
  const [selectedType, setSelectedType] = useState<string>(typeParam);
  const [selectedFlavor, setSelectedFlavor] = useState<string>(flavorParam);
  const [searchQuery, setSearchQuery] = useState<string>(queryParam);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(queryParam);
  const [sortBy, setSortBy] = useState<string>(sortParam);
  const [maxPrice, setMaxPrice] = useState<number>(maxPriceParam);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(inStockParam);
  const [onlyDiscounted, setOnlyDiscounted] = useState<boolean>(discountedParam);
  const [minRating, setMinRating] = useState<number>(minRatingParam);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Pagination state
  const pageParam = Math.max(1, Number(searchParams.get('page')) || 1);
  const pageSizeParam = Number(searchParams.get('page_size')) || 12;
  const [currentPage, setCurrentPage] = useState<number>(pageParam);
  const [pageSize, setPageSize] = useState<number>(pageSizeParam);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sync forcedCategory
  useEffect(() => {
    if (forcedCategory) {
      setSelectedCategory(forcedCategory);
    }
  }, [forcedCategory]);

  // Reset to page 1 on filter changes (skip first mount to preserve ?page= URL param)
  const isFirstMount = React.useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setCurrentPage(1);
  }, [selectedCategory, debouncedSearch, selectedType, selectedFlavor, maxPrice, onlyInStock, onlyDiscounted, minRating, sortBy]);

  // Sync state to URL & Fetch from backend
  const fetchFilteredProducts = useCallback(async () => {
    setLoading(true);

    const queryParams: Record<string, string> = {
      page: currentPage.toString(),
      page_size: pageSize.toString(),
    };

    if (selectedCategory !== 'all') queryParams.category = selectedCategory;
    if (debouncedSearch.trim()) queryParams.search = debouncedSearch.trim();
    if (selectedType !== 'all') queryParams.cake_type = selectedType;
    if (selectedFlavor !== 'all') queryParams.flavor = selectedFlavor;
    if (maxPrice < 10000) queryParams.max_price = maxPrice.toString();
    if (onlyInStock) queryParams.in_stock = 'true';
    if (onlyDiscounted) queryParams.is_discounted = 'true';
    if (minRating > 0) queryParams.min_rating = minRating.toString();

    // Map frontend sorting to backend ordering parameter
    if (sortBy === 'price-low') queryParams.ordering = 'base_price';
    else if (sortBy === 'price-high') queryParams.ordering = '-base_price';
    else if (sortBy === 'rating') queryParams.ordering = '-rating';
    else if (sortBy === 'bestseller') queryParams.is_bestseller = 'true';
    else if (sortBy === 'newest') queryParams.ordering = '-created_at';

    // Update URL query parameters for shareability & browser Back/Forward
    const newParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([k, v]) => newParams.set(k, v));
    setSearchParams(newParams, { replace: true });

    try {
      const data = await storeService.getProductsPaginated(queryParams);
      setProducts(data.results);
      setTotalCount(data.count);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error('Failed to fetch filtered products:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, selectedCategory, debouncedSearch, selectedType, selectedFlavor, maxPrice, onlyInStock, onlyDiscounted, minRating, sortBy, setSearchParams]);

  useEffect(() => {
    fetchFilteredProducts();
  }, [fetchFilteredProducts]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setSelectedCategory(forcedCategory || 'all');
    setSelectedType('all');
    setSelectedFlavor('all');
    setSearchQuery('');
    setDebouncedSearch('');
    setMaxPrice(10000);
    setOnlyInStock(false);
    setOnlyDiscounted(false);
    setMinRating(0);
    setSortBy('featured');
    setCurrentPage(1);
    setSearchParams({}, { replace: true });
  };

  // Active filter count and chips
  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];
    if (!forcedCategory && selectedCategory !== 'all') {
      chips.push({
        key: 'category',
        label: `Category: ${selectedCategory.toUpperCase()}`,
        onRemove: () => setSelectedCategory('all')
      });
    }
    if (debouncedSearch.trim()) {
      chips.push({
        key: 'search',
        label: `Search: "${debouncedSearch}"`,
        onRemove: () => { setSearchQuery(''); setDebouncedSearch(''); }
      });
    }
    if (selectedType !== 'all') {
      chips.push({
        key: 'type',
        label: `Type: ${selectedType}`,
        onRemove: () => setSelectedType('all')
      });
    }
    if (selectedFlavor !== 'all') {
      chips.push({
        key: 'flavor',
        label: `Flavor: ${selectedFlavor}`,
        onRemove: () => setSelectedFlavor('all')
      });
    }
    if (maxPrice < 10000) {
      chips.push({
        key: 'price',
        label: `Under ৳${maxPrice}`,
        onRemove: () => setMaxPrice(10000)
      });
    }
    if (onlyInStock) {
      chips.push({
        key: 'stock',
        label: 'In Stock Only',
        onRemove: () => setOnlyInStock(false)
      });
    }
    if (onlyDiscounted) {
      chips.push({
        key: 'discount',
        label: 'Discounted Deals',
        onRemove: () => setOnlyDiscounted(false)
      });
    }
    if (minRating > 0) {
      chips.push({
        key: 'rating',
        label: `${minRating}★ & Up`,
        onRemove: () => setMinRating(0)
      });
    }
    return chips;
  }, [forcedCategory, selectedCategory, debouncedSearch, selectedType, selectedFlavor, maxPrice, onlyInStock, onlyDiscounted, minRating]);

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '85vh', padding: '2.5rem 0 5rem 0' }}>
      <div className="container">
        
        {/* Page Header Banner */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem 2rem',
          marginBottom: '2rem',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '0.75rem'
        }}>
          <BrandLogo size="md" showWordmark={false} />
          <span className="section-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Cake size={14} /> Official Bakehouse Collection
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.7rem)', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            {forcedCategory === 'cakes' && 'Artisan Cakes Collection'}
            {forcedCategory === 'donuts' && 'Gourmet Donuts'}
            {forcedCategory === 'momos' && 'Savory Himalayan Momos'}
            {!forcedCategory && 'Shop Our Bakery Creations'}
          </h1>
          <p style={{ maxWidth: '640px', color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
            {forcedCategory === 'cakes' && 'Explore luxury tub cakes, Korean lunchbox mart cakes, celebration cupcakes, and custom fondant tier cakes baked fresh to order in Kushtia.'}
            {forcedCategory === 'donuts' && 'Handcrafted brioche donuts dipped in Belgian chocolate, salted caramel glaze, and toasted nuts.'}
            {forcedCategory === 'momos' && 'Steamed and crispy pan-fried Himalayan dumplings served with signature spicy roasted sesame chutney.'}
            {!forcedCategory && 'Artisan cakes, handcrafted gourmet donuts, and steamed momos prepared with premium patisserie ingredients.'}
          </p>
        </div>

        {/* Catalog Control Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          backgroundColor: 'var(--bg-surface)',
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '1.5rem'
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cakes, flavors, ingredients..."
              className="form-control"
              style={{ paddingLeft: '2.5rem', height: '42px', fontSize: '0.9rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          {/* Right Controls: Sort, View, Mobile Filter Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
              className="btn btn-secondary btn-sm mobile-filter-btn"
              style={{ display: 'none', alignItems: 'center', gap: '6px' }}
            >
              <SlidersHorizontal size={16} />
              <span>Filters ({activeChips.length})</span>
            </button>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-select"
                style={{ width: 'auto', height: '42px', padding: '0.4rem 1rem', fontSize: '0.88rem' }}
              >
                <option value="featured">Featured First</option>
                <option value="bestseller">Bestsellers</option>
                <option value="newest">New Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            {/* Grid vs List View */}
            <div style={{ display: 'flex', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  background: viewMode === 'grid' ? 'var(--brand-accent-light)' : 'var(--bg-surface)',
                  color: viewMode === 'grid' ? 'var(--brand-primary)' : 'var(--text-muted)',
                  border: 'none',
                  padding: '8px 12px',
                  cursor: 'pointer'
                }}
                aria-label="Grid view"
              >
                <Grid3X3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  background: viewMode === 'list' ? 'var(--brand-accent-light)' : 'var(--bg-surface)',
                  color: viewMode === 'list' ? 'var(--brand-primary)' : 'var(--text-muted)',
                  border: 'none',
                  padding: '8px 12px',
                  cursor: 'pointer'
                }}
                aria-label="List view"
              >
                <LayoutList size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {activeChips.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Filters:</span>
            {activeChips.map(chip => (
              <span
                key={chip.key}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: 'var(--brand-accent-light)',
                  color: 'var(--brand-primary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: '999px',
                  border: '1px solid rgba(139, 44, 44, 0.15)'
                }}
              >
                {chip.label}
                <button
                  onClick={chip.onRemove}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--brand-primary)',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  aria-label={`Remove filter ${chip.label}`}
                >
                  <X size={13} />
                </button>
              </span>
            ))}
            <button
              onClick={resetFilters}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color: 'var(--brand-secondary)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: 600,
                textDecoration: 'underline'
              }}
            >
              Clear All
            </button>
          </div>
        )}

        {/* Main Catalog Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem' }}>
          
          {/* Sidebar Filter Column (3 cols) */}
          <div style={{ gridColumn: 'span 3' }} className={`shop-sidebar ${isMobileDrawerOpen ? 'drawer-open' : ''}`}>
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              padding: '1.5rem',
              position: 'sticky',
              top: '100px'
            }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  <Filter size={18} style={{ color: 'var(--brand-primary)' }} />
                  <span>Refine Catalog</span>
                </div>
                <button
                  onClick={resetFilters}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--brand-secondary)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 600
                  }}
                >
                  <RotateCcw size={12} /> Reset
                </button>
              </div>

              {/* 1. Category Switcher (Cakes, Donuts, Momos) */}
              {!forcedCategory && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Primary Category</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {[
                      { id: 'all', label: 'All Bakery Creations' },
                      { id: 'cakes', label: '🎂 Cakes (Primary)' },
                      { id: 'donuts', label: '🍩 Gourmet Donuts' },
                      { id: 'momos', label: '🥟 Savory Momos' }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id as any);
                          setSelectedType('all');
                        }}
                        style={{
                          textAlign: 'left',
                          padding: '0.45rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          border: 'none',
                          backgroundColor: selectedCategory === cat.id ? 'var(--brand-accent-light)' : 'transparent',
                          color: selectedCategory === cat.id ? 'var(--brand-primary)' : 'var(--text-secondary)',
                          fontWeight: selectedCategory === cat.id ? 700 : 500,
                          fontSize: '0.88rem',
                          cursor: 'pointer'
                        }}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Cake Types (Shown when cakes active) */}
              {(selectedCategory === 'cakes' || forcedCategory === 'cakes') && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Cake Variety / Format</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                    <button
                      onClick={() => setSelectedType('all')}
                      style={{
                        textAlign: 'left',
                        padding: '0.35rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        backgroundColor: selectedType === 'all' ? 'var(--brand-accent-light)' : 'transparent',
                        color: selectedType === 'all' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                        fontSize: '0.82rem',
                        fontWeight: selectedType === 'all' ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      All Cake Types
                    </button>
                    {CAKE_TYPES.map(ct => (
                      <button
                        key={ct}
                        onClick={() => setSelectedType(ct)}
                        style={{
                          textAlign: 'left',
                          padding: '0.35rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                          border: 'none',
                          backgroundColor: selectedType === ct ? 'var(--brand-accent-light)' : 'transparent',
                          color: selectedType === ct ? 'var(--brand-primary)' : 'var(--text-secondary)',
                          fontSize: '0.82rem',
                          fontWeight: selectedType === ct ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        {ct}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Flavors (Visible for Cakes) */}
              {(selectedCategory === 'cakes' || forcedCategory === 'cakes') && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Flavor Profile</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' }}>
                    <button
                      onClick={() => setSelectedFlavor('all')}
                      style={{
                        textAlign: 'left',
                        padding: '0.35rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        backgroundColor: selectedFlavor === 'all' ? 'var(--brand-accent-light)' : 'transparent',
                        color: selectedFlavor === 'all' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                        fontSize: '0.82rem',
                        fontWeight: selectedFlavor === 'all' ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      All Flavors
                    </button>
                    {FLAVORS.map(flavor => (
                      <button
                        key={flavor}
                        onClick={() => setSelectedFlavor(flavor)}
                        style={{
                          textAlign: 'left',
                          padding: '0.35rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                          border: 'none',
                          backgroundColor: selectedFlavor === flavor ? 'var(--brand-accent-light)' : 'transparent',
                          color: selectedFlavor === flavor ? 'var(--brand-primary)' : 'var(--text-secondary)',
                          fontSize: '0.82rem',
                          fontWeight: selectedFlavor === flavor ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        {flavor}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Price Filter Slider */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem' }}>Max Price</label>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
                    {settings.currency} {maxPrice.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="10000"
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>৳200</span>
                  <span>৳10,000+</span>
                </div>
              </div>

              {/* 5. Toggles: In Stock & Deals */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    style={{ accentColor: 'var(--brand-primary)', width: '16px', height: '16px' }}
                  />
                  <span>Ready to Bake / In Stock</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                  <input
                    type="checkbox"
                    checked={onlyDiscounted}
                    onChange={(e) => setOnlyDiscounted(e.target.checked)}
                    style={{ accentColor: 'var(--brand-primary)', width: '16px', height: '16px' }}
                  />
                  <span>Special Offers &amp; Discounts</span>
                </label>
              </div>

              {/* 6. Customer Rating */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block' }}>Minimum Rating</label>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {[0, 4, 4.5, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      style={{
                        flex: 1,
                        padding: '5px 0',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: minRating === rating ? 'var(--brand-primary)' : 'var(--bg-surface)',
                        color: minRating === rating ? '#fff' : 'var(--text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      {rating === 0 ? 'All' : `${rating}★`}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Products Grid Column (9 cols) */}
          <div style={{ gridColumn: 'span 9' }} className="shop-content">
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Showing <strong style={{ color: 'var(--text-primary)' }}>{products.length}</strong> {products.length === 1 ? 'item' : 'items'}
                {selectedCategory !== 'all' && ` in ${selectedCategory}`}
              </p>
            </div>

            {loading ? (
              <div style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '5rem 2rem',
                textAlign: 'center',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem'
              }}>
                <Loader2 size={36} className="animate-spin" style={{ color: 'var(--brand-primary)' }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
                  Fetching freshest bakes from kitchen...
                </p>
              </div>
            ) : products.length === 0 ? (
              <div style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '4rem 2rem',
                textAlign: 'center',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto',
                  color: 'var(--brand-secondary)'
                }}>
                  <Search size={28} />
                </div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No bakery items found</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
                  No items matched your specific filter combination. Try resetting your price bounds or searching another flavor.
                </p>
                <button onClick={resetFilters} className="btn btn-primary btn-sm">
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' ? 'grid-3' : 'grid-1'}>
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  pageSize={pageSize}
                  pageSizeOptions={[12, 24, 48]}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              </>
            )}
          </div>

        </div>

      </div>

      {/* Responsive layout styles */}
      <style>{`
        @media (max-width: 900px) {
          .mobile-filter-btn { display: inline-flex !important; }
          .shop-sidebar {
            display: none;
            grid-column: span 12 !important;
          }
          .shop-sidebar.drawer-open {
            display: block;
            margin-bottom: 2rem;
          }
          .shop-content { grid-column: span 12 !important; }
        }
      `}</style>
    </div>
  );
};
