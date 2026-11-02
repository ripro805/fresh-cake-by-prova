/**
 * Central API Client for FRESH CAKE by PROVA
 * Communicates with Django REST Framework backend at /api/v1/
 */

const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const API_BASE = `${BASE_URL}/api/v1`;

export interface TokenResponse {
  access: string;
  refresh: string;
  user: {
    id: string;
    phone: string;
    full_name: string;
    email: string;
    role: 'CUSTOMER' | 'OWNER_ADMIN';
  };
}

class ApiClient {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('fresh_cake_jwt_access');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...((options.headers as Record<string, string>) || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 && localStorage.getItem('fresh_cake_jwt_refresh')) {
      // Attempt token refresh
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry with new token
        const retryHeaders = {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
          ...((options.headers as Record<string, string>) || {}),
        };
        const retryRes = await fetch(url, { ...options, headers: retryHeaders });
        if (!retryRes.ok) {
          const errData = await retryRes.json().catch(() => ({}));
          throw new Error(errData.detail || errData.error || `HTTP error ${retryRes.status}`);
        }
        return retryRes.json();
      }
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errorMsg =
        errData.detail ||
        errData.error ||
        (typeof errData === 'object' ? Object.values(errData).flat().join(' ') : `HTTP ${response.status}`);
      throw new Error(errorMsg || `Request failed with status ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  private async refreshToken(): Promise<boolean> {
    const refresh = localStorage.getItem('fresh_cake_jwt_refresh');
    if (!refresh) return false;

    try {
      const res = await fetch(`${API_BASE}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('fresh_cake_jwt_access', data.access);
        return true;
      }
    } catch {
      // Fall through to logout
    }

    this.logout();
    return false;
  }

  // --- AUTH ---
  async login(identifier: string, password: string): Promise<TokenResponse> {
    const data = await this.request<TokenResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    localStorage.setItem('fresh_cake_jwt_access', data.access);
    localStorage.setItem('fresh_cake_jwt_refresh', data.refresh);
    localStorage.setItem('fresh_cake_user', JSON.stringify(data.user));
    return data;
  }

  async register(payload: { phone: string; full_name: string; email?: string; password: string; password_confirm: string }): Promise<any> {
    return this.request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getMe(): Promise<any> {
    return this.request('/auth/me/');
  }

  logout(): void {
    localStorage.removeItem('fresh_cake_jwt_access');
    localStorage.removeItem('fresh_cake_jwt_refresh');
    localStorage.removeItem('fresh_cake_user');
  }

  getCurrentUser() {
    try {
      const stored = localStorage.getItem('fresh_cake_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  // --- CATALOG ---
  async getCategories() {
    return this.request<any[]>('/catalog/categories/');
  }

  async getProducts(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await this.request<any>(`/catalog/products/${qs}`);
    return res.results ? res.results : res;
  }

  async getProductsPaginated(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await this.request<any>(`/catalog/products/${qs}`);
    if (res.results && typeof res.count === 'number') {
      return res;
    }
    // Fallback if returned as raw array
    const results = Array.isArray(res) ? res : [];
    return {
      count: results.length,
      total_pages: 1,
      current_page: 1,
      page_size: results.length || 12,
      next: null,
      previous: null,
      results
    };
  }

  async getProductBySlug(slug: string) {
    return this.request<any>(`/catalog/products/${slug}/`);
  }

  async getFeaturedProducts() {
    return this.request<any[]>('/catalog/products/featured/');
  }

  async getBestsellerProducts() {
    return this.request<any[]>('/catalog/products/bestsellers/');
  }

  async createProduct(data: any) {
    return this.request('/catalog/products/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: any) {
    return this.request(`/catalog/products/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/catalog/products/${id}/`, {
      method: 'DELETE',
    });
  }

  // --- ORDERS & CHECKOUT ---
  async getDeliveryZones() {
    const res = await this.request<any>('/orders/delivery-zones/');
    return res.results ? res.results : res;
  }

  async previewOrder(payload: any) {
    return this.request('/orders/orders/preview/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async createOrder(payload: any) {
    return this.request('/orders/orders/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async trackOrder(orderNumber: string, phone: string) {
    return this.request('/orders/orders/track/', {
      method: 'POST',
      body: JSON.stringify({ order_number: orderNumber, phone }),
    });
  }

  async getOrders(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await this.request<any>(`/orders/orders/${qs}`);
    return res.results ? res.results : res;
  }

  async getOrdersPaginated(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await this.request<any>(`/orders/orders/${qs}`);
    if (res.results && typeof res.count === 'number') {
      return res;
    }
    const results = Array.isArray(res) ? res : [];
    return {
      count: results.length,
      total_pages: 1,
      current_page: 1,
      page_size: results.length || 10,
      next: null,
      previous: null,
      results
    };
  }

  async getOrderById(id: string) {
    return this.request(`/orders/orders/${id}/`);
  }

  async updateOrderStatus(id: string, newStatus: string, note?: string) {
    return this.request(`/orders/orders/${id}/update-status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus, note }),
    });
  }

  async updateOrderPaymentStatus(id: string, paymentStatus: string) {
    return this.request(`/orders/orders/${id}/update-payment-status/`, {
      method: 'PATCH',
      body: JSON.stringify({ payment_status: paymentStatus }),
    });
  }

  // --- CUSTOM CAKE QUOTATIONS ---
  async submitCustomCakeRequest(payload: any) {
    return this.request('/custom-cakes/requests/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async trackCustomCakeRequest(requestNumber: string, phone: string) {
    return this.request('/custom-cakes/requests/track/', {
      method: 'POST',
      body: JSON.stringify({ request_number: requestNumber, phone }),
    });
  }

  async getCustomCakeRequests() {
    const res = await this.request<any>('/custom-cakes/requests/');
    return res.results ? res.results : res;
  }

  async sendCustomCakeQuotation(id: string, quotationAmount: number, adminNotes?: string) {
    return this.request(`/custom-cakes/requests/${id}/send-quotation/`, {
      method: 'POST',
      body: JSON.stringify({ quotation_amount: quotationAmount, admin_notes: adminNotes }),
    });
  }

  async respondToQuotation(id: string, action: 'accept' | 'reject', feedback?: string) {
    return this.request(`/custom-cakes/requests/${id}/respond/`, {
      method: 'POST',
      body: JSON.stringify({ action, feedback }),
    });
  }

  async createOrderFromCustomCake(id: string, payload: {
    payment_method: string;
    delivery_zone_code?: string;
    payment_trx_id?: string;
    payment_sender_phone?: string;
    delivery_address?: string;
  }) {
    return this.request(`/custom-cakes/requests/${id}/create-order/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- PAYMENTS ---
  async getPaymentConfig() {
    return this.request('/payments/submissions/config/');
  }

  async submitPayment(payload: any) {
    return this.request('/payments/submissions/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getPaymentSubmissions() {
    const res = await this.request<any>('/payments/submissions/');
    return res.results ? res.results : res;
  }

  async verifyPayment(id: string, action: 'verify' | 'reject', rejectionReason?: string) {
    return this.request(`/payments/submissions/${id}/verify/`, {
      method: 'POST',
      body: JSON.stringify({ action, rejection_reason: rejectionReason }),
    });
  }

  async recordCashCollection(payload: { order: string; amount_collected: number; collected_by: string; notes?: string }) {
    return this.request('/payments/cash-collections/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- INVENTORY ---
  async getIngredients() {
    const res = await this.request<any>('/inventory/ingredients/');
    return res.results ? res.results : res;
  }

  async getLowStockIngredients() {
    return this.request<any[]>('/inventory/ingredients/low_stock/');
  }

  async restockIngredient(id: string, quantity: number, notes?: string) {
    return this.request(`/inventory/ingredients/${id}/restock/`, {
      method: 'POST',
      body: JSON.stringify({ quantity, notes }),
    });
  }

  async getFinishedGoodsStock() {
    const res = await this.request<any>('/inventory/finished-goods/');
    return res.results ? res.results : res;
  }

  async adjustFinishedGoodStock(id: string, quantity: number, reason?: string) {
    return this.request(`/inventory/finished-goods/${id}/adjust/`, {
      method: 'POST',
      body: JSON.stringify({ quantity, reason }),
    });
  }

  async getStockMovements() {
    const res = await this.request<any>('/inventory/movements/');
    return res.results ? res.results : res;
  }

  // --- FINANCE & P&L ---
  async getFinanceSummary() {
    return this.request('/finance/expenses/summary/');
  }

  async getExpenseCategories() {
    const res = await this.request<any>('/finance/categories/');
    return res.results ? res.results : res;
  }

  async getExpenses() {
    const res = await this.request<any>('/finance/expenses/');
    return res.results ? res.results : res;
  }

  async recordExpense(payload: any) {
    return this.request('/finance/expenses/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- CMS & STORE SETTINGS ---
  async getStoreSettings() {
    return this.request('/cms/settings/');
  }

  async updateStoreSettings(payload: any) {
    return this.request('/cms/settings/', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async getHeroBanners() {
    const res = await this.request<any>('/cms/banners/');
    return res.results ? res.results : res;
  }

  // --- COUPONS ---
  async validateCoupon(code: string, subtotal: number) {
    return this.request<{ valid: boolean; discount_amount: string; message: string }>('/coupons/validate/', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    });
  }

  // --- WHATSAPP & LIVE SUPPORT CHAT ---
  async createSupportConversation(payload: {
    guest_name?: string;
    guest_phone?: string;
    guest_email?: string;
    session_key?: string;
    initial_message: string;
  }) {
    return this.request<any>('/support/conversations/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getSupportConversation(refOrId: string, sessionKey?: string) {
    const headers: Record<string, string> = sessionKey ? { 'X-Support-Session-Key': sessionKey } : {};
    return this.request<any>(`/support/conversations/${refOrId}/`, { headers });
  }

  async sendSupportMessage(refOrId: string, text: string, sessionKey?: string) {
    const headers: Record<string, string> = sessionKey ? { 'X-Support-Session-Key': sessionKey } : {};
    return this.request<any>(`/support/conversations/${refOrId}/messages/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ text, session_key: sessionKey }),
    });
  }

  async pollSupportMessages(refOrId: string, sessionKey?: string) {
    const headers: Record<string, string> = sessionKey ? { 'X-Support-Session-Key': sessionKey } : {};
    return this.request<{ status: string; last_message_at: string; messages: any[] }>(
      `/support/conversations/${refOrId}/poll/`,
      { headers }
    );
  }

  // --- ADMIN SUPPORT & WHATSAPP CONFIG ---
  async getAdminSupportConversations(params?: { status?: string; search?: string }) {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    const res = await this.request<any>(`/support/admin/conversations/${qs}`);
    return res.results ? res.results : res;
  }

  async adminReplySupportConversation(id: string, text: string) {
    return this.request<any>(`/support/admin/conversations/${id}/reply/`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async adminResolveSupportConversation(id: string) {
    return this.request<any>(`/support/admin/conversations/${id}/resolve/`, {
      method: 'POST',
    });
  }

  async adminReopenSupportConversation(id: string) {
    return this.request<any>(`/support/admin/conversations/${id}/reopen/`, {
      method: 'POST',
    });
  }

  async getWhatsAppSettings() {
    return this.request<any>('/support/admin/settings/');
  }

  async updateWhatsAppSettings(payload: any) {
    return this.request<any>('/support/admin/settings/', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }
}

export const api = new ApiClient();
