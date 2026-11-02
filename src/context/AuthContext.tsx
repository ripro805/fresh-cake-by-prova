import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomerProfile } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  isAdmin: boolean;
  currentUser: CustomerProfile | null;
  unifiedLogin: (identifier: string, password: string) => Promise<{ success: boolean; role?: 'CUSTOMER' | 'OWNER_ADMIN'; error?: string }>;
  customerRegister: (data: { name: string; phone: string; email?: string; password: string; password_confirm: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  // Backward compatibility helpers
  adminLogin: (password: string, phone?: string) => Promise<boolean>;
  adminLogout: () => void;
  customerLogin: (phone: string, password?: string, name?: string) => Promise<boolean>;
  customerLogout: () => void;
  updateCustomerProfile: (profile: Partial<CustomerProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_AUTH_KEY = 'fresh_cake_admin_session_v1';
const USER_AUTH_KEY = 'fresh_cake_user_session_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  });

  const [currentUser, setCurrentUser] = useState<CustomerProfile | null>(() => {
    try {
      const stored = localStorage.getItem(USER_AUTH_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem(ADMIN_AUTH_KEY, isAdmin ? 'true' : 'false');
  }, [isAdmin]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(USER_AUTH_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(USER_AUTH_KEY);
    }
  }, [currentUser]);

  // Unified login connected to Django REST Framework backend
  const unifiedLogin = async (identifier: string, password: string): Promise<{ success: boolean; role?: 'CUSTOMER' | 'OWNER_ADMIN'; error?: string }> => {
    try {
      const res = await api.login(identifier, password);
      if (res && res.user) {
        if (res.user.role === 'OWNER_ADMIN') {
          setIsAdmin(true);
          setCurrentUser(null);
          return { success: true, role: 'OWNER_ADMIN' };
        } else {
          setIsAdmin(false);
          const profile: CustomerProfile = {
            id: res.user.id,
            name: res.user.full_name || 'Valued Customer',
            email: res.user.email || '',
            phone: res.user.phone,
            addresses: [
              {
                id: 'addr-1',
                label: 'Home',
                address: 'Kushtia Town, Kushtia',
                is_default: true,
              },
            ],
          };
          setCurrentUser(profile);
          return { success: true, role: 'CUSTOMER' };
        }
      }
      return { success: false, error: 'Login failed. Please verify your credentials.' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Login failed. Please verify your credentials.' };
    }
  };

  const customerRegister = async (data: { name: string; phone: string; email?: string; password: string; password_confirm: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.register({
        full_name: data.name,
        phone: data.phone,
        email: data.email,
        password: data.password,
        password_confirm: data.password_confirm,
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Registration failed.' };
    }
  };

  const logout = () => {
    api.logout();
    localStorage.removeItem(ADMIN_AUTH_KEY);
    localStorage.removeItem(USER_AUTH_KEY);
    localStorage.removeItem('fresh_cake_jwt_access');
    localStorage.removeItem('fresh_cake_jwt_refresh');
    localStorage.removeItem('fresh_cake_user');
    localStorage.removeItem('fresh_cake_cart_v1');
    localStorage.removeItem('fresh_cake_wishlist_v1');
    setIsAdmin(false);
    setCurrentUser(null);
  };

  // Backward compatibility implementations
  const adminLogin = async (pass: string, phone = '01308516242'): Promise<boolean> => {
    const res = await unifiedLogin(phone, pass);
    return res.success && res.role === 'OWNER_ADMIN';
  };

  const adminLogout = () => {
    logout();
  };

  const customerLogin = async (phoneOrEmail: string, password = 'password123', name = 'Customer'): Promise<boolean> => {
    const res = await unifiedLogin(phoneOrEmail, password);
    if (res.success) return true;
    // Fallback for guest session simulation
    const guestUser: CustomerProfile = {
      id: `usr-${Date.now()}`,
      name,
      email: phoneOrEmail.includes('@') ? phoneOrEmail : '',
      phone: !phoneOrEmail.includes('@') ? phoneOrEmail : '',
      addresses: [
        {
          id: 'addr-1',
          label: 'Home',
          address: 'Kushtia Town, Kushtia',
          is_default: true,
        },
      ],
    };
    setCurrentUser(guestUser);
    setIsAdmin(false);
    return true;
  };

  const customerLogout = () => {
    logout();
  };

  const updateCustomerProfile = (updates: Partial<CustomerProfile>) => {
    if (!currentUser) return;
    setCurrentUser({ ...currentUser, ...updates });
  };

  return (
    <AuthContext.Provider
      value={{
        isAdmin,
        currentUser,
        unifiedLogin,
        customerRegister,
        logout,
        adminLogin,
        adminLogout,
        customerLogin,
        customerLogout,
        updateCustomerProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
