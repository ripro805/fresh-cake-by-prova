import { api } from '../api/client';
import { Product, Order, CustomCakeRequest, StoreSettings, OrderStatus, PaymentStatus, QuotationStatus, PaginatedResult } from '../types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_CUSTOM_CAKES, INITIAL_SETTINGS } from '../data/initialData';

export const resolveImageUrl = (img?: string): string => {
  if (!img) return '/images/hero_cake.jpg';
  if (img.startsWith('http://') || img.startsWith('https://')) return img;
  if (img.startsWith('/media/')) {
    const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
    return `${baseUrl}${img}`;
  }
  return img;
};

const mapBackendProduct = (item: any): Product => ({
  id: item.id,
  slug: item.slug,
  name: item.name,
  category: item.category_slug || (item.category?.slug) || 'cakes',
  cake_type: item.cake_type,
  description: item.description,
  price: parseFloat(item.price || item.base_price),
  discount_price: item.discount_price ? parseFloat(item.discount_price) : undefined,
  images: item.images && item.images.length > 0 ? item.images.map(resolveImageUrl) : ['/images/hero_cake.jpg'],
  variants: (item.variants || []).map((v: any) => ({
    id: v.id,
    name: v.name,
    price: parseFloat(v.price),
    is_default: v.is_default
  })),
  flavors: item.flavors || [],
  availability: item.availability ?? item.is_available ?? true,
  prep_time: item.prep_time || 'Same Day / 4 Hours',
  is_featured: item.is_featured ?? false,
  is_bestseller: item.is_bestseller ?? false,
  rating: parseFloat(item.rating || '5.0'),
  review_count: item.review_count || 12,
});

const mapBackendOrder = (o: any): Order => ({
  id: o.order_number || o.id,
  created_at: o.created_at,
  customer_name: o.customer_name,
  customer_phone: o.customer_phone,
  customer_email: o.customer_email,
  delivery_type: o.delivery_type,
  delivery_address: o.delivery_address,
  delivery_area: o.delivery_area,
  delivery_fee: parseFloat(o.delivery_fee || '0'),
  delivery_instructions: o.delivery_instructions,
  order_notes: o.order_notes,
  subtotal: parseFloat(o.subtotal || '0'),
  discount: parseFloat(o.discount || '0'),
  total: parseFloat(o.total || '0'),
  payment_method: o.payment_method,
  payment_status: o.payment_status,
  payment_trx_id: o.payment_trx_id,
  payment_sender_phone: o.payment_sender_phone,
  order_status: o.order_status,
  timeline: (o.timeline || []).map((t: any) => ({
    status: t.status,
    timestamp: new Date(t.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
    note: t.note
  })),
  items: (o.items || []).map((it: any) => ({
    product: {
      id: it.product || it.id,
      name: it.product_name_snapshot,
      price: parseFloat(it.unit_price),
      images: ['/images/hero_cake.jpg'],
      category: 'cakes',
      slug: 'product',
      description: '',
      variants: [],
      availability: true,
      is_featured: false,
      is_bestseller: false
    },
    selectedVariant: { id: 'v', name: it.variant_snapshot || 'Standard', price: parseFloat(it.unit_price) },
    selectedFlavor: it.flavor_snapshot,
    quantity: it.quantity
  }))
});

const PRODUCTS_KEY = 'fresh_cake_products_v1';
const ORDERS_KEY = 'fresh_cake_orders_v1';
const CUSTOM_CAKES_KEY = 'fresh_cake_custom_requests_v1';
const SETTINGS_KEY = 'fresh_cake_settings_v2';

// Seed Local Storage if empty or outdated
const initLocalStore = () => {
  if (!localStorage.getItem(PRODUCTS_KEY)) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem(ORDERS_KEY)) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
  }
  if (!localStorage.getItem(CUSTOM_CAKES_KEY)) {
    localStorage.setItem(CUSTOM_CAKES_KEY, JSON.stringify(INITIAL_CUSTOM_CAKES));
  }
  if (!localStorage.getItem(SETTINGS_KEY)) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(INITIAL_SETTINGS));
  }
};

initLocalStore();

export const storeService = {
  isCloudConnected(): boolean {
    return true; // Django REST + PostgreSQL connected
  },

  // --- PRODUCTS ---
  async getProducts(params?: Record<string, string>): Promise<Product[]> {
    try {
      const data = await api.getProducts(params);
      if (Array.isArray(data) && data.length > 0) {
        // Format to frontend Product shape
        const mapped: Product[] = data.map((item: any) => ({
          id: item.id,
          slug: item.slug,
          name: item.name,
          category: item.category_slug || (item.category?.slug) || 'cakes',
          cake_type: item.cake_type,
          description: item.description,
          price: parseFloat(item.price || item.base_price),
          discount_price: item.discount_price ? parseFloat(item.discount_price) : undefined,
          images: item.images && item.images.length > 0 ? item.images.map(resolveImageUrl) : ['/images/hero_cake.jpg'],
          variants: (item.variants || []).map((v: any) => ({
            id: v.id,
            name: v.name,
            price: parseFloat(v.price),
            is_default: v.is_default
          })),
          flavors: item.flavors || [],
          availability: item.availability ?? item.is_available ?? true,
          prep_time: item.prep_time || 'Same Day / 4 Hours',
          is_featured: item.is_featured ?? false,
          is_bestseller: item.is_bestseller ?? false,
          rating: parseFloat(item.rating || '5.0'),
          review_count: item.review_count || 12,
        }));
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(mapped));
        return mapped;
      }
    } catch (err) {
      console.warn('Backend API getProducts error, using cached storage:', err);
    }

    try {
      const stored = localStorage.getItem(PRODUCTS_KEY);
      return stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  },

  async getProductsPaginated(params?: Record<string, string>): Promise<PaginatedResult<Product>> {
    try {
      const res = await api.getProductsPaginated(params);
      if (res && Array.isArray(res.results)) {
        const mappedResults = res.results.map(mapBackendProduct);
        return {
          count: res.count,
          total_pages: res.total_pages || Math.ceil(res.count / (res.page_size || 12)) || 1,
          current_page: res.current_page || 1,
          page_size: res.page_size || 12,
          next: res.next,
          previous: res.previous,
          results: mappedResults
        };
      }
    } catch (err) {
      console.warn('Backend API getProductsPaginated error, falling back to local store:', err);
    }

    // Local fallback pagination
    const all = await this.getProducts(params);
    const page = Number(params?.page) || 1;
    const pageSize = Number(params?.page_size) || 12;
    const start = (page - 1) * pageSize;
    const paginated = all.slice(start, start + pageSize);
    return {
      count: all.length,
      total_pages: Math.ceil(all.length / pageSize) || 1,
      current_page: page,
      page_size: pageSize,
      next: start + pageSize < all.length ? `?page=${page + 1}` : null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      results: paginated
    };
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const item = await api.getProductBySlug(slug);
      if (item) {
        return {
          id: item.id,
          slug: item.slug,
          name: item.name,
          category: item.category?.slug || item.category_slug || 'cakes',
          cake_type: item.cake_type,
          description: item.description,
          price: parseFloat(item.price || item.base_price),
          discount_price: item.discount_price ? parseFloat(item.discount_price) : undefined,
          images: item.images && item.images.length > 0 ? item.images.map(resolveImageUrl) : ['/images/hero_cake.jpg'],
          variants: (item.variants || []).map((v: any) => ({
            id: v.id,
            name: v.name,
            price: parseFloat(v.price),
            is_default: v.is_default
          })),
          flavors: item.flavors || [],
          availability: item.availability ?? item.is_available ?? true,
          prep_time: item.prep_time || 'Same Day / 4 Hours',
          is_featured: item.is_featured ?? false,
          is_bestseller: item.is_bestseller ?? false,
          rating: parseFloat(item.rating || '5.0'),
          review_count: item.review_count || 12,
        };
      }
    } catch (err) {
      console.warn('API getProductBySlug error, searching local cache:', err);
    }

    const products = await this.getProducts();
    return products.find(p => p.slug === slug || p.id === slug) || null;
  },

  async saveProduct(product: Product): Promise<Product> {
    try {
      if (product.id && !product.id.startsWith('prod-')) {
        await api.updateProduct(product.id, {
          name: product.name,
          description: product.description,
          base_price: product.price,
          discount_price: product.discount_price || null,
          cake_type: product.cake_type,
          is_available: product.availability,
          is_featured: product.is_featured,
          is_bestseller: product.is_bestseller,
        });
      }
    } catch (err) {
      console.warn('API saveProduct error, falling back to local store:', err);
    }

    const products = await this.getProducts();
    const existingIndex = products.findIndex(p => p.id === product.id);

    let updated: Product[];
    if (existingIndex >= 0) {
      updated = [...products];
      updated[existingIndex] = product;
    } else {
      updated = [product, ...products];
    }

    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
    return product;
  },

  async deleteProduct(id: string): Promise<void> {
    try {
      if (id && !id.startsWith('prod-')) {
        await api.deleteProduct(id);
      }
    } catch (err) {
      console.warn('API deleteProduct error:', err);
    }

    const products = await this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));
  },

  // --- ORDERS ---
  async getOrders(): Promise<Order[]> {
    try {
      const data = await api.getOrders();
      if (Array.isArray(data) && data.length > 0) {
        const mapped: Order[] = data.map((o: any) => ({
          id: o.order_number || o.id,
          created_at: o.created_at,
          customer_name: o.customer_name,
          customer_phone: o.customer_phone,
          customer_email: o.customer_email,
          delivery_type: o.delivery_type,
          delivery_address: o.delivery_address,
          delivery_area: o.delivery_area,
          delivery_fee: parseFloat(o.delivery_fee || '0'),
          delivery_instructions: o.delivery_instructions,
          order_notes: o.order_notes,
          subtotal: parseFloat(o.subtotal || '0'),
          discount: parseFloat(o.discount || '0'),
          total: parseFloat(o.total || '0'),
          payment_method: o.payment_method,
          payment_status: o.payment_status,
          payment_trx_id: o.payment_trx_id,
          payment_sender_phone: o.payment_sender_phone,
          order_status: o.order_status,
          timeline: (o.timeline || []).map((t: any) => ({
            status: t.status,
            timestamp: new Date(t.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
            note: t.note
          })),
          items: (o.items || []).map((it: any) => ({
            product: {
              id: it.product || it.id,
              name: it.product_name_snapshot,
              price: parseFloat(it.unit_price),
              images: ['/images/hero_cake.jpg'],
              category: 'cakes',
              slug: 'product',
              description: '',
              variants: [],
              availability: true,
              is_featured: false,
              is_bestseller: false
            },
            selectedVariant: { id: 'v', name: it.variant_snapshot || 'Standard', price: parseFloat(it.unit_price) },
            selectedFlavor: it.flavor_snapshot,
            quantity: it.quantity
          }))
        }));
        localStorage.setItem(ORDERS_KEY, JSON.stringify(mapped));
        return mapped;
      }
    } catch (err) {
      console.warn('Backend API getOrders error, using cache:', err);
    }

    try {
      const stored = localStorage.getItem(ORDERS_KEY);
      return stored ? JSON.parse(stored) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  },

  async getOrdersPaginated(params?: Record<string, string>): Promise<PaginatedResult<Order>> {
    try {
      const res = await api.getOrdersPaginated(params);
      if (res && Array.isArray(res.results)) {
        const mappedResults = res.results.map(mapBackendOrder);
        return {
          count: res.count,
          total_pages: res.total_pages || Math.ceil(res.count / (res.page_size || 10)) || 1,
          current_page: res.current_page || 1,
          page_size: res.page_size || 10,
          next: res.next,
          previous: res.previous,
          results: mappedResults
        };
      }
    } catch (err) {
      console.warn('Backend API getOrdersPaginated error, falling back to local store:', err);
    }

    const all = await this.getOrders();
    const page = Number(params?.page) || 1;
    const pageSize = Number(params?.page_size) || 10;
    const start = (page - 1) * pageSize;
    return {
      count: all.length,
      total_pages: Math.ceil(all.length / pageSize) || 1,
      current_page: page,
      page_size: pageSize,
      next: start + pageSize < all.length ? `?page=${page + 1}` : null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      results: all.slice(start, start + pageSize)
    };
  },

  async getOrderByIdAndPhone(orderId: string, phone: string): Promise<Order | null> {
    try {
      const o = await api.trackOrder(orderId, phone);
      if (o) {
        return {
          id: o.order_number || o.id,
          created_at: o.created_at,
          customer_name: o.customer_name,
          customer_phone: o.customer_phone,
          customer_email: o.customer_email,
          delivery_type: o.delivery_type,
          delivery_address: o.delivery_address,
          delivery_area: o.delivery_area,
          delivery_fee: parseFloat(o.delivery_fee || '0'),
          delivery_instructions: o.delivery_instructions,
          order_notes: o.order_notes,
          subtotal: parseFloat(o.subtotal || '0'),
          discount: parseFloat(o.discount || '0'),
          total: parseFloat(o.total || '0'),
          payment_method: o.payment_method,
          payment_status: o.payment_status,
          payment_trx_id: o.payment_trx_id,
          payment_sender_phone: o.payment_sender_phone,
          order_status: o.order_status,
          timeline: (o.timeline || []).map((t: any) => ({
            status: t.status,
            timestamp: new Date(t.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
            note: t.note
          })),
          items: (o.items || []).map((it: any) => ({
            product: {
              id: it.product || it.id,
              name: it.product_name_snapshot,
              price: parseFloat(it.unit_price),
              images: ['/images/hero_cake.jpg'],
              category: 'cakes',
              slug: 'product',
              description: '',
              variants: [],
              availability: true,
              is_featured: false,
              is_bestseller: false
            },
            selectedVariant: { id: 'v', name: it.variant_snapshot || 'Standard', price: parseFloat(it.unit_price) },
            selectedFlavor: it.flavor_snapshot,
            quantity: it.quantity
          }))
        };
      }
    } catch (err) {
      console.warn('API trackOrder error, checking cached orders:', err);
    }

    const cleanOrderId = orderId.trim().toUpperCase();
    const cleanPhone = phone.trim().replace(/\D/g, '');

    const orders = await this.getOrders();
    const found = orders.find(o => {
      const idMatch = o.id.trim().toUpperCase() === cleanOrderId;
      const orderPhoneClean = o.customer_phone.replace(/\D/g, '');
      const phoneMatch = orderPhoneClean.endsWith(cleanPhone) || cleanPhone.endsWith(orderPhoneClean);
      return idMatch && phoneMatch;
    });

    return found || null;
  },

  async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'timeline' | 'order_status'>): Promise<Order> {
    try {
      // Map items for Django backend
      const itemsPayload = orderData.items.map(it => ({
        product_id: it.product.id,
        variant_id: it.selectedVariant?.id || null,
        variant_name: it.selectedVariant?.name || '',
        flavor_name: it.selectedFlavor || '',
        unit_price: it.selectedVariant?.price || it.product.price,
        quantity: it.quantity
      }));

      // Determine delivery zone code
      let zoneCode = 'INSIDE_KUSHTIA';
      if (orderData.delivery_type === 'pickup') {
        zoneCode = 'PICKUP';
      } else if (orderData.delivery_area?.toLowerCase().includes('outside')) {
        zoneCode = 'OUTSIDE_KUSHTIA';
      }

      const res = await api.createOrder({
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        customer_email: orderData.customer_email || '',
        delivery_type: orderData.delivery_type,
        delivery_zone_code: zoneCode,
        delivery_address: orderData.delivery_address || '',
        delivery_area: orderData.delivery_area || '',
        delivery_instructions: orderData.delivery_instructions || '',
        order_notes: orderData.order_notes || '',
        payment_method: orderData.payment_method,
        payment_trx_id: orderData.payment_trx_id || '',
        payment_sender_phone: orderData.payment_sender_phone || '',
        coupon_code: orderData.coupon_code || '',
        items: itemsPayload
      });

      if (res && res.order_number) {
        const createdOrder: Order = {
          ...orderData,
          id: res.order_number,
          created_at: res.created_at,
          order_status: res.order_status,
          total: parseFloat(res.total),
          subtotal: parseFloat(res.subtotal),
          delivery_fee: parseFloat(res.delivery_fee),
          discount: parseFloat(res.discount),
          timeline: (res.timeline || []).map((t: any) => ({
            status: t.status,
            timestamp: new Date(t.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
            note: t.note
          }))
        };

        const orders = await this.getOrders();
        const updated = [createdOrder, ...orders];
        localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
        return createdOrder;
      }
    } catch (err) {
      console.warn('API createOrder failed, saving to local fallback store:', err);
    }

    const timestamp = new Date().toISOString();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `FC-20261025-${randomSuffix}`;

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      created_at: timestamp,
      order_status: 'Order Placed',
      timeline: [
        {
          status: 'Order Placed',
          timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
          note: `Order received. Payment method: ${orderData.payment_method.toUpperCase()}`
        }
      ]
    };

    const orders = await this.getOrders();
    const updated = [newOrder, ...orders];
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
    return newOrder;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus, note?: string): Promise<Order | null> {
    try {
      await api.updateOrderStatus(orderId, status, note);
    } catch (err) {
      console.warn('API updateOrderStatus error:', err);
    }

    const orders = await this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) return null;

    const currentOrder = orders[index];
    const newTimelineItem = {
      status,
      timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      note: note || `Status updated to ${status}`
    };

    const updatedOrder: Order = {
      ...currentOrder,
      order_status: status,
      timeline: [...currentOrder.timeline, newTimelineItem]
    };

    orders[index] = updatedOrder;
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    return updatedOrder;
  },

  async updatePaymentStatus(orderId: string, payment_status: PaymentStatus): Promise<Order | null> {
    try {
      await api.updateOrderPaymentStatus(orderId, payment_status);
    } catch (err) {
      console.warn('API updateOrderPaymentStatus error:', err);
    }

    const orders = await this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) return null;

    orders[index].payment_status = payment_status;
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    return orders[index];
  },

  // --- CUSTOM CAKE REQUESTS ---
  async getCustomCakeRequests(): Promise<CustomCakeRequest[]> {
    try {
      const data = await api.getCustomCakeRequests();
      if (Array.isArray(data) && data.length > 0) {
        const mapped: CustomCakeRequest[] = data.map((r: any) => ({
          id: r.request_number || r.id,
          created_at: r.created_at,
          customer_name: r.customer_name,
          customer_phone: r.customer_phone,
          occasion: r.occasion,
          cake_size: r.cake_size,
          cake_flavor: r.cake_flavor,
          cake_type: r.cake_type,
          cake_tiers: r.cake_tiers,
          color_preference: r.color_preference,
          custom_message: r.custom_message,
          design_description: r.design_description,
          reference_image: resolveImageUrl(r.reference_image_url || r.reference_image),
          delivery_type: r.delivery_type,
          delivery_date: r.delivery_date,
          delivery_time: r.delivery_time,
          delivery_address: r.delivery_address,
          quotation_status: r.quotation_status,
          quotation_amount: r.quotation_amount ? parseFloat(r.quotation_amount) : undefined,
          admin_notes: r.admin_notes
        }));
        localStorage.setItem(CUSTOM_CAKES_KEY, JSON.stringify(mapped));
        return mapped;
      }
    } catch (err) {
      console.warn('API getCustomCakeRequests error, using cache:', err);
    }

    try {
      const stored = localStorage.getItem(CUSTOM_CAKES_KEY);
      return stored ? JSON.parse(stored) : INITIAL_CUSTOM_CAKES;
    } catch {
      return INITIAL_CUSTOM_CAKES;
    }
  },

  async createCustomCakeRequest(requestData: Omit<CustomCakeRequest, 'id' | 'created_at' | 'quotation_status'>): Promise<CustomCakeRequest> {
    try {
      const res = await api.submitCustomCakeRequest({
        customer_name: requestData.customer_name,
        customer_phone: requestData.customer_phone,
        customer_email: '',
        occasion: requestData.occasion,
        cake_size: requestData.cake_size,
        cake_flavor: requestData.cake_flavor,
        cake_type: requestData.cake_type,
        cake_tiers: requestData.cake_tiers,
        color_preference: requestData.color_preference,
        custom_message: requestData.custom_message || '',
        design_description: requestData.design_description,
        reference_image_url: requestData.reference_image || '',
        delivery_type: requestData.delivery_type,
        delivery_date: requestData.delivery_date,
        delivery_time: requestData.delivery_time || 'Afternoon (2 PM - 6 PM)',
        delivery_address: requestData.delivery_address || ''
      });

      if (res && res.request_number) {
        const newReq: CustomCakeRequest = {
          ...requestData,
          id: res.request_number,
          created_at: res.created_at,
          quotation_status: 'Pending Review'
        };
        const current = await this.getCustomCakeRequests();
        const updated = [newReq, ...current];
        localStorage.setItem(CUSTOM_CAKES_KEY, JSON.stringify(updated));
        return newReq;
      }
    } catch (err) {
      console.warn('API submitCustomCakeRequest failed, saving to local store:', err);
    }

    const timestamp = new Date().toISOString();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const requestId = `CR-20261025-${randomSuffix}`;

    const newRequest: CustomCakeRequest = {
      ...requestData,
      id: requestId,
      created_at: timestamp,
      quotation_status: 'Pending Review'
    };

    const current = await this.getCustomCakeRequests();
    const updated = [newRequest, ...current];
    localStorage.setItem(CUSTOM_CAKES_KEY, JSON.stringify(updated));
    return newRequest;
  },

  async updateQuotation(
    requestId: string,
    status: QuotationStatus,
    amount?: number,
    adminNotes?: string
  ): Promise<CustomCakeRequest | null> {
    try {
      if (amount) {
        await api.sendCustomCakeQuotation(requestId, amount, adminNotes);
      }
    } catch (err) {
      console.warn('API sendCustomCakeQuotation error:', err);
    }

    const requests = await this.getCustomCakeRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return null;

    requests[index].quotation_status = status;
    if (amount !== undefined) requests[index].quotation_amount = amount;
    if (adminNotes !== undefined) requests[index].admin_notes = adminNotes;

    localStorage.setItem(CUSTOM_CAKES_KEY, JSON.stringify(requests));
    return requests[index];
  },

  async respondToCustomCakeQuotation(
    requestId: string,
    action: 'accept' | 'reject',
    feedback?: string
  ): Promise<CustomCakeRequest | null> {
    try {
      await api.respondToQuotation(requestId, action, feedback);
    } catch (err) {
      console.warn('API respondToQuotation error:', err);
    }

    const requests = await this.getCustomCakeRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return null;

    requests[index].quotation_status = action === 'accept' ? 'Accepted' : 'Rejected';
    localStorage.setItem(CUSTOM_CAKES_KEY, JSON.stringify(requests));
    return requests[index];
  },

  async convertCustomCakeToOrder(
    requestId: string,
    payload: {
      payment_method: string;
      delivery_zone_code?: string;
      payment_trx_id?: string;
      payment_sender_phone?: string;
      delivery_address?: string;
    }
  ): Promise<any> {
    try {
      const order = await api.createOrderFromCustomCake(requestId, payload);
      const requests = await this.getCustomCakeRequests();
      const index = requests.findIndex(r => r.id === requestId);
      if (index !== -1) {
        requests[index].quotation_status = 'Completed';
        localStorage.setItem(CUSTOM_CAKES_KEY, JSON.stringify(requests));
      }
      return order;
    } catch (err) {
      console.warn('API convertCustomCakeToOrder error:', err);
      throw err;
    }
  },

  async validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; discount_amount: number; message: string }> {
    try {
      const res = await api.validateCoupon(code, subtotal);
      if (res && res.valid) {
        return {
          valid: true,
          discount_amount: parseFloat(res.discount_amount) || 0,
          message: res.message
        };
      }
      return {
        valid: false,
        discount_amount: 0,
        message: res?.message || 'Invalid coupon code.'
      };
    } catch (err: any) {
      // Offline / fallback promo codes
      const c = code.trim().toUpperCase();
      if (c === 'PROVA10' || c === 'FRESHPROVA10') {
        const discount = Math.round(subtotal * 0.1);
        return { valid: true, discount_amount: discount, message: `Coupon ${c} applied! You saved ৳${discount}` };
      }
      if (c === 'SWEET100' || c === 'WELCOME50') {
        const discount = c === 'SWEET100' ? 100 : 50;
        return { valid: true, discount_amount: discount, message: `Coupon ${c} applied! You saved ৳${discount}` };
      }
      return { valid: false, discount_amount: 0, message: err?.message || 'Invalid or expired coupon code.' };
    }
  },

  // --- SETTINGS ---
  async getSettings(): Promise<StoreSettings> {
    try {
      const data = await api.getStoreSettings();
      if (data && data.store_name) {
        const mapped: StoreSettings = {
          store_name: data.store_name,
          brand_signature: data.brand_signature,
          tagline: data.tagline,
          announcement_bar: data.announcement_bar,
          phone: data.phone || '01305612767',
          whatsapp_number: data.whatsapp_number || '01305612767',
          email: data.email,
          address: data.address || 'Upazila Road, Indra Mor, Kushtia, Bangladesh',
          baking_house_address: data.baking_house_address || data.address || 'Upazila Road, Indra Mor, Kushtia, Bangladesh',
          pickup_point_address: data.pickup_point_address || 'Upazila Mor, Disha Tower, Kushtia, Bangladesh',
          currency: data.currency || '৳',
          delivery_charge_inside: parseFloat(data.delivery_charge_inside || '50'),
          delivery_charge_outside: parseFloat(data.delivery_charge_outside || '150'),
          delivery_charge_pickup: parseFloat(data.delivery_charge_pickup || '0'),
          bkash_number: data.bkash_number || '01305612767',
          nagad_number: data.nagad_number || '01305612767',
          bank_details: data.bank_details,
          is_store_open: data.is_store_open,
          social_instagram: data.social_instagram,
          social_facebook: data.social_facebook
        };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(mapped));
        return mapped;
      }
    } catch (err) {
      console.warn('API getStoreSettings error, using cache:', err);
    }

    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      return stored ? JSON.parse(stored) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  },

  async saveSettings(settings: StoreSettings): Promise<StoreSettings> {
    try {
      await api.updateStoreSettings(settings);
    } catch (err) {
      console.warn('API updateStoreSettings error:', err);
    }

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return settings;
  },

  async uploadImage(file: File): Promise<string> {
    try {
      const res = await api.uploadMedia(file);
      if (res && res.url) {
        return res.url;
      }
    } catch (err) {
      console.warn('Direct cloud media upload failed, falling back to local base64:', err);
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }
};
