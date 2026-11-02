import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreSettings } from '../types';
import { storeService } from '../services/storeService';
import { INITIAL_SETTINGS } from '../data/initialData';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

interface SettingsContextType {
  settings: StoreSettings;
  updateSettings: (newSettings: StoreSettings) => Promise<void>;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const refreshSettings = async () => {
    try {
      const data = await storeService.getSettings();
      setSettings(data);
    } catch {
      setSettings(INITIAL_SETTINGS);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  const updateSettings = async (newSettings: StoreSettings) => {
    await storeService.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        toasts,
        showToast,
        removeToast,
        refreshSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
