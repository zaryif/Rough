import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { requestNotificationPermission } from '../services/notificationService';
import { DEFAULT_ENTRY_TYPE_ORDER, ModuleType } from '../constants';

type Theme = 'light' | 'dark';

interface SettingsContextType {
  theme: Theme;
  toggleTheme: () => void;
  notificationsEnabled: boolean;
  toggleNotifications: () => Promise<void>;
  customBackground: string | null;
  setCustomBackground: (dataUrl: string) => void;
  clearCustomBackground: () => void;
  isOrganizedView: boolean;
  toggleOrganizedView: () => void;
  entryTypeOrder: (ModuleType | 'Note' | 'Custom' | 'Code')[];
  setEntryTypeOrder: (order: (ModuleType | 'Note' | 'Custom' | 'Code')[]) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined' && document.documentElement.classList.contains('dark')) {
    return 'dark';
  }
  return 'light';
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
     if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('notificationsEnabled');
        // Check permission status on load to sync with reality
        if (Notification.permission !== 'granted') return false;
        return stored ? JSON.parse(stored) : false;
     }
     return false;
  });
  const [customBackground, _setCustomBackground] = useState<string | null>(null);
  const [isOrganizedView, setIsOrganizedView] = useState<boolean>(() => {
      if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('isOrganizedView');
          return stored ? JSON.parse(stored) : false;
      }
      return false;
  });
  const [entryTypeOrder, _setEntryTypeOrder] = useState<(ModuleType | 'Note' | 'Custom' | 'Code')[]>(() => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('entryTypeOrder');
        try {
            if (stored) {
                const parsed = JSON.parse(stored);
                // Basic validation to prevent crashes if constants change
                if (Array.isArray(parsed) && parsed.every(item => DEFAULT_ENTRY_TYPE_ORDER.includes(item)) && parsed.length === DEFAULT_ENTRY_TYPE_ORDER.length) {
                    return parsed;
                }
            }
        } catch (e) {
            console.error("Failed to parse entry type order from localStorage", e);
        }
    }
    return DEFAULT_ENTRY_TYPE_ORDER;
  });

  useEffect(() => {
    const storedBg = localStorage.getItem('customBackground');
    if (storedBg) {
      _setCustomBackground(storedBg);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  useEffect(() => {
      localStorage.setItem('notificationsEnabled', JSON.stringify(notificationsEnabled));
  }, [notificationsEnabled]);
  
  useEffect(() => {
      localStorage.setItem('isOrganizedView', JSON.stringify(isOrganizedView));
  }, [isOrganizedView]);

  const setCustomBackground = (dataUrl: string) => {
    localStorage.setItem('customBackground', dataUrl);
    _setCustomBackground(dataUrl);
  };

  const clearCustomBackground = () => {
      localStorage.removeItem('customBackground');
      _setCustomBackground(null);
  };

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const toggleNotifications = useCallback(async () => {
    const isEnabling = !notificationsEnabled;
    if (isEnabling) {
      try {
        await requestNotificationPermission();
        if (Notification.permission === 'granted') {
          setNotificationsEnabled(true);
        } else {
          setNotificationsEnabled(false);
        }
      } catch (error) {
        console.error("Error handling notification permission:", error);
      }
    } else {
      setNotificationsEnabled(false);
    }
  }, [notificationsEnabled]);

  const toggleOrganizedView = useCallback(() => {
    setIsOrganizedView(prev => !prev);
  }, []);

  const setEntryTypeOrder = useCallback((order: (ModuleType | 'Note' | 'Custom' | 'Code')[]) => {
      _setEntryTypeOrder(order);
      localStorage.setItem('entryTypeOrder', JSON.stringify(order));
  }, []);

  return (
    <SettingsContext.Provider value={{ theme, toggleTheme, notificationsEnabled, toggleNotifications, customBackground, setCustomBackground, clearCustomBackground, isOrganizedView, toggleOrganizedView, entryTypeOrder, setEntryTypeOrder }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
};
