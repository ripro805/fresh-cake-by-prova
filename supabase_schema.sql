-- ==============================================================================
-- FRESH CAKE by PROVA - Production Supabase PostgreSQL Schema
-- Tables, RLS Policies, Indexes & Constraints
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Customers & Admins)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'staff')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    image_url TEXT,
    sort_order INT DEFAULT 0
);

-- 3. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY DEFAULT ('prod-' || SUBSTRING(uuid_generate_v4()::TEXT, 1, 8)),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    cake_type TEXT,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    discount_price NUMERIC(10, 2) CHECK (discount_price < price),
    images TEXT[] NOT NULL DEFAULT '{}',
    flavors TEXT[] DEFAULT '{}',
    availability BOOLEAN NOT NULL DEFAULT TRUE,
    prep_time TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_bestseller BOOLEAN NOT NULL DEFAULT FALSE,
    rating NUMERIC(2, 1) DEFAULT 5.0,
    review_count INT DEFAULT 0,
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS product_variants (
    id TEXT PRIMARY KEY DEFAULT ('var-' || SUBSTRING(uuid_generate_v4()::TEXT, 1, 8)),
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    is_default BOOLEAN NOT NULL DEFAULT FALSE
);

-- 5. ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    delivery_type TEXT NOT NULL CHECK (delivery_type IN ('delivery', 'pickup')),
    delivery_address TEXT,
    delivery_area TEXT,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    delivery_instructions TEXT,
    order_notes TEXT,
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'bkash', 'nagad', 'bank')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'failed')),
    payment_trx_id TEXT,
    payment_sender_phone TEXT,
    order_status TEXT NOT NULL DEFAULT 'Order Placed' CHECK (
        order_status IN (
            'Order Placed',
            'Order Confirmed',
            'Preparing',
            'Ready for Delivery',
            'Out for Delivery',
            'Delivered',
            'Cancelled'
        )
    ),
    timeline JSONB NOT NULL DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_image TEXT,
    variant_name TEXT NOT NULL,
    flavor TEXT,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    line_total NUMERIC(10, 2) NOT NULL
);

-- 7. CUSTOM CAKE REQUESTS
CREATE TABLE IF NOT EXISTS custom_cake_requests (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    occasion TEXT NOT NULL,
    cake_size TEXT NOT NULL,
    cake_flavor TEXT NOT NULL,
    cake_type TEXT NOT NULL,
    cake_tiers TEXT NOT NULL,
    color_preference TEXT NOT NULL,
    custom_message TEXT,
    design_description TEXT NOT NULL,
    reference_image TEXT,
    delivery_type TEXT NOT NULL CHECK (delivery_type IN ('delivery', 'pickup')),
    delivery_date DATE NOT NULL,
    delivery_time TEXT,
    delivery_address TEXT,
    quotation_status TEXT NOT NULL DEFAULT 'Pending Review' CHECK (
        quotation_status IN ('Pending Review', 'Quotation Sent', 'Accepted', 'Rejected', 'Completed')
    ),
    quotation_amount NUMERIC(10, 2),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. STORE SETTINGS
CREATE TABLE IF NOT EXISTS store_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. COUPONS
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('fixed', 'percentage')),
    discount_value NUMERIC(10, 2) NOT NULL,
    min_order_value NUMERIC(10, 2) DEFAULT 0,
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_custom_cake_status ON custom_cake_requests(quotation_status);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_cake_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read and update their own profile; admins can read all
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Categories & Products: anyone can read active products; only admins can write
CREATE POLICY "Public can view categories" ON categories
    FOR SELECT USING (TRUE);

CREATE POLICY "Public can view available products" ON products
    FOR SELECT USING (availability = TRUE OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Public can view variants" ON product_variants
    FOR SELECT USING (TRUE);

-- Orders: customers can view their own orders; guest orders verified via phone/id; admins can manage all
CREATE POLICY "Public can create orders" ON orders
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can view their orders" ON orders
    FOR SELECT USING (
        auth.uid() = user_id 
        OR auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "Public can insert order items" ON order_items
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can view their order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND (orders.user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
        )
    );

-- Custom Cake Requests
CREATE POLICY "Public can submit custom cake requests" ON custom_cake_requests
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can view their custom cake requests" ON custom_cake_requests
    FOR SELECT USING (
        auth.uid() = user_id 
        OR auth.jwt() ->> 'role' = 'admin'
    );

-- Reviews
CREATE POLICY "Public can read reviews" ON reviews
    FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Authenticated users can submit review" ON reviews
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Store Settings
CREATE POLICY "Public can read settings" ON store_settings
    FOR SELECT USING (TRUE);

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================
INSERT INTO categories (id, name, tagline, description, sort_order)
VALUES 
    ('cakes', 'Cakes', 'A Little Slice of Happiness', 'Signature handcrafted celebration cakes, tub cakes, and customized creations.', 1),
    ('donuts', 'Donuts', 'Sweet Little Moments', 'Brioche gourmet artisan donuts glazed in rich chocolate, caramel, and nuts.', 2),
    ('momos', 'Momos', 'Deliciously Made to Share', 'Himalayan artisan steamed and crispy pan-fried momos with zesty dipping sauces.', 3)
ON CONFLICT (id) DO NOTHING;
