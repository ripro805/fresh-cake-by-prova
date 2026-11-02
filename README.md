# Fresh Cake by Prova (provashop) 🎂✨

A full-stack bakery & custom cake e-commerce platform built with React, TypeScript, Django REST Framework, and Neon PostgreSQL. Features custom cake builder, order tracking, inventory management, and WhatsApp support chat.

---

## 🚀 Features

- **Interactive Custom Cake Builder**: Real-time interactive cake customization with custom flavors, weights, and toppings.
- **Full-Featured E-Commerce**: Product catalog, category filtering, cart drawer, checkout, and coupon management.
- **Live WhatsApp Support Chat**: Meta WhatsApp Business Cloud API integration and in-app customer support conversations.
- **Order Tracking & Management**: Real-time order status timeline from baking to delivery.
- **Admin Dashboard**: Comprehensive operations suite covering Finance (revenue/expenses), Inventory & Ingredients, Order Fulfillment, and Payments.
- **Enterprise-Ready Database**: Powered by **Neon Serverless PostgreSQL** with connection pooling and SSL encryption.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Tailwind CSS & Lucide Icons
- **Routing & State**: React Context API & React Router

### Backend
- **Framework**: Django 5.x & Django REST Framework (DRF)
- **Authentication**: SimpleJWT (JSON Web Tokens)
- **Database**: PostgreSQL (Neon Cloud Database) with `dj-database-url` & `psycopg2-binary`
- **Documentation**: OpenAPI 3.0 via `drf-spectacular`

---

## ⚙️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/ripro805/fresh-cake-by-prova.git
cd fresh-cake-by-prova
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Update .env with your DATABASE_URL and secret keys

python manage.py migrate
python manage.py runserver
```

### 3. Frontend Setup
```bash
# In the root directory:
npm install
npm run dev
```

---

## 🔒 Environment Variables
Configure `backend/.env` according to `backend/.env.example`:
- `DATABASE_URL`: Your Neon PostgreSQL connection string.
- `DJANGO_SECRET_KEY`: Django secret key.
- `JWT_SIGNING_KEY`: Secret key for JWT token generation.
- `WHATSAPP_*`: Optional Meta WhatsApp Cloud API credentials.

---

## 📄 License
This project is proprietary and built for Fresh Cake by Prova.
