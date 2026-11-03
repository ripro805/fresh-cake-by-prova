import { Product, StoreSettings, CustomCakeRequest, Order } from '../types';

export const INITIAL_SETTINGS: StoreSettings = {
  store_name: 'FRESH CAKE',
  brand_signature: 'by PROVA',
  tagline: 'Every Celebration Deserves a Sweeter Story.',
  announcement_bar: 'Freshly Baked in Kushtia — Order Artisan Cakes, Brioche Donuts & Hot Momos!',
  phone: '01305612767',
  whatsapp_number: '01305612767',
  email: 'freshcakebyprova.official@gmail.com',
  address: 'Upazila Road, Indra Mor, Kushtia, Bangladesh',
  baking_house_address: 'Upazila Road, Indra Mor, Kushtia, Bangladesh',
  pickup_point_address: 'Upazila Mor, Disha Tower, Kushtia, Bangladesh',
  currency: '৳',
  delivery_charge_inside: 50,
  delivery_charge_outside: 150,
  delivery_charge_pickup: 0,
  bkash_number: '01305612767',
  nagad_number: '01305612767',
  bank_details: 'City Bank / Eastern Bank (Available upon request)',
  is_store_open: true,
  social_instagram: 'https://instagram.com/',
  social_facebook: 'https://www.facebook.com/profile.php?id=61558676760968'
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-cake-01',
    slug: 'golden-caramel-celebration-cake',
    name: 'Golden Caramel Drip Celebration Cake',
    category: 'cakes',
    cake_type: 'Celebration Cakes',
    description: 'Signature multi-tiered artisan sponge smothered in velvety Swiss meringue buttercream, luscious salted caramel drip, delicate edible gold leaf accents, and fresh blush blooms. Perfect for memorable birthdays and milestone celebrations.',
    price: 1850,
    discount_price: 1650,
    images: ['/images/hero_cake.jpg', '/images/chocolate_cake.jpg'],
    variants: [
      { id: 'v-1lb', name: '1 Pound (Serves 4-6)', price: 1650, is_default: true },
      { id: 'v-2lb', name: '2 Pound (Serves 8-12)', price: 3100 },
      { id: 'v-3lb', name: '3 Pound Tiered (Serves 15-20)', price: 4600 }
    ],
    flavors: ['Salted Caramel Vanilla', 'Chocolate Hazelnut', 'Red Velvet Dream', 'Fresh Strawberry Vanilla'],
    availability: true,
    prep_time: '24 Hours Advance Notice',
    is_featured: true,
    is_bestseller: true,
    rating: 5.0,
    review_count: 24,
    is_demo: true
  },
  {
    id: 'prod-cake-02',
    slug: 'belgian-dark-chocolate-truffle-cake',
    name: 'Belgian Dark Chocolate Truffle Cake',
    category: 'cakes',
    cake_type: 'Chocolate Cakes',
    description: 'An indulgent, rich 70% dark Belgian chocolate fudge cake layered with silky chocolate mousse, cloaked in mirror chocolate ganache and crowned with handmade chocolate truffles and edible gold flakes.',
    price: 1950,
    discount_price: 1750,
    images: ['/images/chocolate_cake.jpg', '/images/tub_cake.jpg'],
    variants: [
      { id: 'v-1lb', name: '1 Pound (Serves 4-6)', price: 1750, is_default: true },
      { id: 'v-2lb', name: '2 Pound (Serves 8-12)', price: 3300 },
      { id: 'v-3lb', name: '3 Pound (Serves 15-20)', price: 4800 }
    ],
    flavors: ['Intense Dark Chocolate', 'Mocha Espresso Ganache'],
    availability: true,
    prep_time: '12-24 Hours Notice',
    is_featured: true,
    is_bestseller: true,
    rating: 4.9,
    review_count: 38,
    is_demo: true
  },
  {
    id: 'prod-cake-03',
    slug: 'salted-caramel-fudge-tub-cake',
    name: 'Salted Caramel Fudge Tub Cake',
    category: 'cakes',
    cake_type: 'Tub Cakes',
    description: 'Grab a spoon and dive into pure bliss! Layered in a transparent dessert tub with rich chocolate sponge, house-cooked salted caramel sauce, silky whipped mousse, and crunchy hazelnut praline.',
    price: 650,
    discount_price: 580,
    images: ['/images/tub_cake.jpg'],
    variants: [
      { id: 'v-regular', name: 'Regular Tub (350g)', price: 580, is_default: true },
      { id: 'v-large', name: 'Large Sharing Tub (600g)', price: 950 }
    ],
    flavors: ['Caramel Chocolate', 'Triple Belgian Chocolate'],
    availability: true,
    prep_time: 'Ready Same Day / 4 Hours',
    is_featured: true,
    is_bestseller: true,
    rating: 5.0,
    review_count: 19,
    is_demo: true
  },
  {
    id: 'prod-cake-04',
    slug: 'sweet-moments-korean-mart-cake',
    name: 'Vintage Korean Bento Mart Cake',
    category: 'cakes',
    cake_type: 'Mart Cakes',
    description: 'Cute, minimalist Korean lunchbox bento cake packed in an eco-friendly sugarcane clamshell. Adorned with pastel buttercream piping, sugar pearls, and customizable vintage hand-piped greeting.',
    price: 850,
    discount_price: 750,
    images: ['/images/mart_cake.jpg'],
    variants: [
      { id: 'v-bento', name: 'Mini Bento 4" (Serves 1-2)', price: 750, is_default: true },
      { id: 'v-bento-l', name: 'Midi Bento 5" (Serves 3-4)', price: 1100 }
    ],
    flavors: ['Vanilla Cream Cheese', 'Chocolate Fudge', 'Lotus Biscoff'],
    availability: true,
    prep_time: 'Same Day / 6 Hours Notice',
    is_featured: true,
    is_bestseller: false,
    rating: 4.8,
    review_count: 14,
    is_demo: true
  },
  {
    id: 'prod-cake-05',
    slug: 'classic-red-velvet-berry-cake',
    name: 'Classic Red Velvet Berry Cake',
    category: 'cakes',
    cake_type: 'Red Velvet Cakes',
    description: 'Tender crimson cocoa sponge crowned with tart, silky cream cheese frosting, decorative velvety cake crumb dust, and fresh farm-picked raspberries and red rose petals.',
    price: 1800,
    discount_price: 1600,
    images: ['/images/red_velvet_cake.jpg'],
    variants: [
      { id: 'v-1lb', name: '1 Pound (Serves 4-6)', price: 1600, is_default: true },
      { id: 'v-2lb', name: '2 Pound (Serves 8-12)', price: 3000 }
    ],
    flavors: ['Classic Cream Cheese', 'White Chocolate Cream Cheese'],
    availability: true,
    prep_time: '24 Hours Advance Notice',
    is_featured: true,
    is_bestseller: true,
    rating: 4.9,
    review_count: 22,
    is_demo: true
  },
  {
    id: 'prod-cake-06',
    slug: 'artisan-cupcake-gift-box',
    name: 'Artisan Swirl Cupcakes (Box of 4)',
    category: 'cakes',
    cake_type: 'Cup Cakes',
    description: 'An elegant gift box of 4 luxury cupcakes: Salted Caramel Drizzle, Madagascar Vanilla Bean, Hazelnut Espresso, and Toffee Crunch with edible gold flakes.',
    price: 720,
    discount_price: 650,
    images: ['/images/cupcakes.jpg'],
    variants: [
      { id: 'v-4pk', name: 'Box of 4 Cupcakes', price: 650, is_default: true },
      { id: 'v-6pk', name: 'Box of 6 Cupcakes', price: 920 },
      { id: 'v-12pk', name: 'Party Box of 12 Cupcakes', price: 1750 }
    ],
    flavors: ['Assorted Flavors', 'All Chocolate', 'All Vanilla Caramel'],
    availability: true,
    prep_time: 'Same Day / 4 Hours',
    is_featured: true,
    is_bestseller: false,
    rating: 4.9,
    review_count: 16,
    is_demo: true
  },
  {
    id: 'prod-cake-07',
    slug: 'vanilla-bean-fresh-cream-berry-cake',
    name: 'Vanilla Bean Fresh Cream & Berry Cake',
    category: 'cakes',
    cake_type: 'Fresh Cream Cakes',
    description: 'Feather-light Japanese style chiffon sponge infused with real Madagascar vanilla bean, filled with whipped fresh chantilly cream, and crowned with fresh strawberries, blueberries, and blackberries.',
    price: 1750,
    discount_price: 1550,
    images: ['/images/fresh_cream_cake.jpg'],
    variants: [
      { id: 'v-1lb', name: '1 Pound (Serves 4-6)', price: 1550, is_default: true },
      { id: 'v-2lb', name: '2 Pound (Serves 8-12)', price: 2900 }
    ],
    flavors: ['Madagascar Vanilla', 'Mixed Berry Chantilly'],
    availability: true,
    prep_time: '24 Hours Notice',
    is_featured: false,
    is_bestseller: false,
    rating: 4.8,
    review_count: 11,
    is_demo: true
  },
  {
    id: 'prod-cake-08',
    slug: 'bespoke-tiered-gold-leaf-cake',
    name: 'Bespoke Tiered Celebration Cake',
    category: 'cakes',
    cake_type: 'Customized Cakes',
    description: 'Our pinnacle showstopper masterpiece for weddings, grand anniversaries, and luxury celebrations. Hand-sculpted sugar florals, gold foil leafing, and customized flavor tiers tailored to your vision.',
    price: 5500,
    discount_price: undefined,
    images: ['/images/custom_cake_art.jpg', '/images/hero_cake.jpg'],
    variants: [
      { id: 'v-2tier', name: '2-Tier (Serves 25-30)', price: 5500, is_default: true },
      { id: 'v-3tier', name: '3-Tier (Serves 45-55)', price: 8900 }
    ],
    flavors: ['Custom Combination', 'Salted Caramel & Belgian Truffle'],
    availability: true,
    prep_time: '48-72 Hours Advance Notice',
    is_featured: true,
    is_bestseller: false,
    rating: 5.0,
    review_count: 9,
    is_demo: true
  },

  /* B. DONUTS CATEGORY */
  {
    id: 'prod-donut-01',
    slug: 'artisan-gourmet-donuts-box',
    name: 'The Artisan Bakery Donut Box (6-Pack)',
    category: 'donuts',
    description: 'Handcrafted brioche donuts fried to golden perfection and dipped in luxurious glazes: 2x Belgian Chocolate Hazelnut Crunch, 2x Salted Caramel Toasted Almond, and 2x Madagascar Vanilla Bean Glaze.',
    price: 750,
    discount_price: 680,
    images: ['/images/category_donuts.jpg'],
    variants: [
      { id: 'd-6pk', name: 'Box of 6 Assorted Donuts', price: 680, is_default: true },
      { id: 'd-12pk', name: 'Party Box of 12 Donuts', price: 1290 }
    ],
    flavors: ['Assorted Chef Selection', 'All Chocolate Glazed', 'All Caramel Almond'],
    availability: true,
    prep_time: 'Freshly Baked Daily / 3 Hours',
    is_featured: true,
    is_bestseller: true,
    rating: 4.9,
    review_count: 31,
    is_demo: true
  },
  {
    id: 'prod-donut-02',
    slug: 'salted-caramel-almond-donut',
    name: 'Salted Caramel Toasted Almond Donut',
    category: 'donuts',
    description: 'Fluffy pillowy donut coated in sticky house-made sea-salt caramel glaze and generously topped with crisp sliced toasted California almonds.',
    price: 130,
    discount_price: 120,
    images: ['/images/category_donuts.jpg'],
    variants: [
      { id: 'd-1pc', name: 'Individual Donut (1 Pc)', price: 120, is_default: true },
      { id: 'd-3pc', name: 'Trio Pack (3 Pcs)', price: 340 }
    ],
    availability: true,
    prep_time: 'Fresh Daily',
    is_featured: false,
    is_bestseller: false,
    rating: 4.7,
    review_count: 12,
    is_demo: true
  },

  /* C. MOMOS CATEGORY */
  {
    id: 'prod-momo-01',
    slug: 'steamed-artisan-gourmet-momos',
    name: 'Steamed Himalayan Gourmet Momos (8 Pcs)',
    category: 'momos',
    description: 'Hand-pleated delicate translucent dumplings steamed fresh in bamboo baskets, filled with seasoned minced filling and fresh herbs, served with our signature fiery roasted tomato sesame chili dip.',
    price: 360,
    discount_price: 320,
    images: ['/images/category_momos.jpg'],
    variants: [
      { id: 'm-8pc', name: 'Steamed Basket (8 Pcs)', price: 320, is_default: true },
      { id: 'm-16pc', name: 'Party Platter (16 Pcs)', price: 600 }
    ],
    flavors: ['Classic Chicken Herbs', 'Cheese & Mushroom (Vegetarian)'],
    availability: true,
    prep_time: 'Fresh Made to Order / 30-45 Mins',
    is_featured: true,
    is_bestseller: true,
    rating: 4.9,
    review_count: 45,
    is_demo: true
  },
  {
    id: 'prod-momo-02',
    slug: 'pan-fried-kothey-crispy-momos',
    name: 'Pan-Fried Crispy Kothey Momos (8 Pcs)',
    category: 'momos',
    description: 'Half-steamed, half pan-crisped dumplings boasting an addictive golden-brown crispy crust at the bottom while staying juicy and tender inside. Served with spicy dip and scallions.',
    price: 390,
    discount_price: 350,
    images: ['/images/category_momos.jpg'],
    variants: [
      { id: 'm-fried-8', name: 'Pan-Fried Crispy (8 Pcs)', price: 350, is_default: true },
      { id: 'm-fried-16', name: 'Crispy Platter (16 Pcs)', price: 660 }
    ],
    flavors: ['Chicken Scallion', 'Spicy Veg Schezwan'],
    availability: true,
    prep_time: 'Fresh Made to Order / 35-45 Mins',
    is_featured: false,
    is_bestseller: true,
    rating: 4.8,
    review_count: 27,
    is_demo: true
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'PROVA-2026-8812',
    created_at: '2026-10-25T14:30:00Z',
    customer_name: 'Anika Rahman',
    customer_phone: '01308516242',
    customer_email: 'anika.rahman@example.com',
    delivery_type: 'delivery',
    delivery_address: 'Holding 45, Upazila Road, Kushtia',
    delivery_area: 'Inside Kushtia Town',
    delivery_fee: 50,
    delivery_instructions: 'Please call before arriving, ring bell 3A.',
    order_notes: 'Please add birthday candle pack.',
    items: [
      {
        product: INITIAL_PRODUCTS[0],
        selectedVariant: INITIAL_PRODUCTS[0].variants[0],
        selectedFlavor: 'Salted Caramel Vanilla',
        quantity: 1
      }
    ],
    subtotal: 1650,
    discount: 0,
    total: 1700,
    payment_method: 'bkash',
    payment_status: 'verified',
    payment_trx_id: 'BK994827X1',
    payment_sender_phone: '01308516242',
    order_status: 'Preparing',
    timeline: [
      { status: 'Order Placed', timestamp: '2026-10-25 02:30 PM', note: 'Order received via online shop' },
      { status: 'Order Confirmed', timestamp: '2026-10-25 02:45 PM', note: 'bKash payment verified (Trx: BK994827X1)' },
      { status: 'Preparing', timestamp: '2026-10-25 03:15 PM', note: 'Pastry chef baking fresh sponge & caramel frosting' }
    ]
  },
  {
    id: 'PROVA-2026-8809',
    created_at: '2026-10-24T18:10:00Z',
    customer_name: 'Tanvir Hossain',
    customer_phone: '01899112233',
    delivery_type: 'pickup',
    delivery_fee: 0,
    order_notes: 'Will pick up at 6 PM sharp',
    items: [
      {
        product: INITIAL_PRODUCTS[8],
        selectedVariant: INITIAL_PRODUCTS[8].variants[0],
        selectedFlavor: 'Assorted Chef Selection',
        quantity: 1
      },
      {
        product: INITIAL_PRODUCTS[10],
        selectedVariant: INITIAL_PRODUCTS[10].variants[0],
        selectedFlavor: 'Classic Chicken Herbs',
        quantity: 2
      }
    ],
    subtotal: 1320,
    discount: 0,
    total: 1320,
    payment_method: 'cod',
    payment_status: 'pending',
    order_status: 'Delivered',
    timeline: [
      { status: 'Order Placed', timestamp: '2026-10-24 06:10 PM', note: 'Store pickup order placed' },
      { status: 'Order Confirmed', timestamp: '2026-10-24 06:15 PM', note: 'Kitchen confirmed order' },
      { status: 'Ready for Delivery', timestamp: '2026-10-24 06:50 PM', note: 'Boxed and ready at counter' },
      { status: 'Delivered', timestamp: '2026-10-24 07:05 PM', note: 'Customer collected package. Cash received.' }
    ]
  }
];

export const INITIAL_CUSTOM_CAKES: CustomCakeRequest[] = [
  {
    id: 'CC-7041',
    created_at: '2026-10-25T11:00:00Z',
    customer_name: 'Sabrina Chowdhury',
    customer_phone: '01308516242',
    occasion: 'Anniversary',
    cake_size: '2 Pound (Serves 8-12)',
    cake_flavor: 'Salted Caramel & Belgian Truffle',
    cake_type: 'Customized Tiered Cake',
    cake_tiers: '2 Tiers',
    color_preference: 'Warm cream, muted beige, and edible gold flakes',
    custom_message: 'Happy 5th Anniversary Sabrina & Fahim',
    design_description: 'Need a romantic minimalist luxury aesthetic with hand-painted gold leaf strokes and natural champagne dried florals. Similar to the studio bespoke cake design.',
    reference_image: '/images/custom_cake_art.jpg',
    delivery_type: 'delivery',
    delivery_date: '2026-10-29',
    delivery_time: '04:00 PM',
    delivery_address: 'Indra Mor, Kushtia',
    quotation_status: 'Quotation Sent',
    quotation_amount: 3800,
    admin_notes: 'Contacted on WhatsApp. Customer approved gold leafing and dried florals.'
  }
];
