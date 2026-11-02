export type Category = 'cakes' | 'donuts' | 'momos';

export type CakeType =
  | 'Tub Cakes'
  | 'Mart Cakes'
  | 'Cup Cakes'
  | 'Customized Cakes'
  | 'Birthday Cakes'
  | 'Chocolate Cakes'
  | 'Vanilla Cakes'
  | 'Red Velvet Cakes'
  | 'Fresh Cream Cakes'
  | 'Theme Cakes'
  | 'Anniversary Cakes'
  | 'Celebration Cakes';

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  is_default?: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category;
  cake_type?: CakeType;
  description: string;
  price: number;
  discount_price?: number;
  images: string[];
  variants: ProductVariant[];
  flavors?: string[];
  availability: boolean;
  prep_time?: string;
  is_featured: boolean;
  is_bestseller: boolean;
  rating?: number;
  review_count?: number;
  is_demo?: boolean;
}

export interface CartItem {
  product: Product;
  selectedVariant: ProductVariant;
  selectedFlavor?: string;
  quantity: number;
}

export type OrderStatus =
  | 'Order Placed'
  | 'Order Confirmed'
  | 'Preparing'
  | 'Ready for Delivery'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'bank';
export type PaymentStatus = 'pending' | 'verified' | 'failed';

export interface OrderTimelineItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_type: 'delivery' | 'pickup';
  delivery_address?: string;
  delivery_area?: string;
  delivery_fee: number;
  delivery_instructions?: string;
  order_notes?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  coupon_code?: string;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_trx_id?: string;
  payment_sender_phone?: string;
  order_status: OrderStatus;
  timeline: OrderTimelineItem[];
}

export type QuotationStatus =
  | 'Pending Review'
  | 'Quotation Sent'
  | 'Accepted'
  | 'Rejected'
  | 'Completed';

export interface CustomCakeRequest {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  occasion: string;
  cake_size: string;
  cake_flavor: string;
  cake_type: string;
  cake_tiers: string;
  color_preference: string;
  custom_message?: string;
  design_description: string;
  reference_image?: string;
  delivery_type: 'delivery' | 'pickup';
  delivery_date: string;
  delivery_time?: string;
  delivery_address?: string;
  quotation_status: QuotationStatus;
  quotation_amount?: number;
  admin_notes?: string;
}

export interface StoreSettings {
  store_name: string;
  brand_signature: string;
  tagline: string;
  announcement_bar: string;
  phone: string;
  whatsapp_number: string;
  email: string;
  address: string;
  baking_house_address?: string;
  pickup_point_address?: string;
  currency: string;
  delivery_charge_inside: number;
  delivery_charge_outside: number;
  delivery_charge_pickup?: number;
  bkash_number: string;
  nagad_number: string;
  bank_details: string;
  is_store_open: boolean;
  social_instagram: string;
  social_facebook: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: {
    id: string;
    label: string;
    address: string;
    is_default: boolean;
  }[];
}

export interface PaginatedResult<T> {
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
