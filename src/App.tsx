import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';

import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { WhatsAppButton } from './components/common/WhatsAppButton';
import { ToastContainer } from './components/common/ToastContainer';
import { ScrollToTop } from './components/common/ScrollToTop';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { CustomCakePage } from './pages/CustomCakePage';
import { LoginPage } from './pages/LoginPage';
import { AccountPage } from './pages/AccountPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { BrandSplashIntro } from './components/common/BrandSplashIntro';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [splashDone, setSplashDone] = React.useState<boolean>(() => {
    try {
      return sessionStorage.getItem('prova_splash_presented') === 'true';
    } catch {
      return true;
    }
  });

  const handleSplashComplete = () => {
    try {
      sessionStorage.setItem('prova_splash_presented', 'true');
    } catch {}
    setSplashDone(true);
  };

  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ScrollToTop />

      {!splashDone && !isAdminRoute && (
        <BrandSplashIntro onComplete={handleSplashComplete} />
      )}
      
      {!isAdminRoute && <Navbar />}

      <div style={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/cakes" element={<ShopPage forcedCategory="cakes" />} />
          <Route path="/donuts" element={<ShopPage forcedCategory="donuts" />} />
          <Route path="/momos" element={<ShopPage forcedCategory="momos" />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
          <Route path="/track-order" element={<TrackOrderPage />} />
          <Route path="/custom-cake" element={<CustomCakePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* Fallback 404 */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </div>

      {!isAdminRoute && <Footer />}

      <CartDrawer />
      {!isAdminRoute && <WhatsAppButton />}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <CartProvider>
            <AppLayout />
          </CartProvider>
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}

export default App;
