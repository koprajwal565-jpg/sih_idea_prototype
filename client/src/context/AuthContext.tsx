import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, NotificationItem } from '../types';
import { apiRequest } from '../lib/api';

export const DEMO_CREDENTIALS = {
  customer: {
    email: 'rahul.sharma@example.com',
    password: 'Password@123',
    role: 'customer' as const,
  },
  provider: {
    email: 'ramesh.electrician@example.com',
    password: 'Password@123',
    role: 'provider' as const,
  },
  admin: {
    email: 'admin@fixnear.in',
    password: 'Password@123',
    role: 'admin' as const,
  },
};

export interface RegisterData {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  role: 'customer' | 'provider';
}

interface AuthContextType {
  currentUser: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user: UserProfile }>;
  register: (data: RegisterData) => Promise<{ success: boolean; user: UserProfile }>;
  logout: () => void;
  switchRole: (role: 'customer' | 'provider' | 'admin') => Promise<void>;
  notifications: NotificationItem[];
  unreadCount: number;
  refreshNotifications: () => void;
  markNotificationAsRead: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('fixnear_token'));
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('fixnear_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('fixnear_token');
      if (savedToken) {
        try {
          const res = await apiRequest<UserProfile>('/auth/me');
          if (res.success && res.user) {
            setCurrentUser(res.user);
            setToken(savedToken);
            localStorage.setItem('fixnear_user', JSON.stringify(res.user));
          } else {
            logout();
          }
        } catch {
          logout();
        }
      } else {
        setIsLoading(false);
      }
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  const fetchNotifications = async () => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      const res = await apiRequest<NotificationItem[]>('/notifications', {}, currentUser.id);
      if (res.success) {
        setNotifications(res.data);
        setUnreadCount(res.unread_count || 0);
      }
    } catch {
      // ignore in offline mode
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [currentUser?.id]);

  const login = async (email: string, password: string) => {
    const res = await apiRequest<{ token: string; user: UserProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.token && res.user) {
      setToken(res.token);
      setCurrentUser(res.user);
      localStorage.setItem('fixnear_token', res.token);
      localStorage.setItem('fixnear_user', JSON.stringify(res.user));
      return { success: true, user: res.user };
    }

    throw new Error(res.error?.message || 'Login failed');
  };

  const register = async (data: RegisterData) => {
    const res = await apiRequest<{ token: string; user: UserProfile }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res.success && res.token && res.user) {
      setToken(res.token);
      setCurrentUser(res.user);
      localStorage.setItem('fixnear_token', res.token);
      localStorage.setItem('fixnear_user', JSON.stringify(res.user));
      return { success: true, user: res.user };
    }

    throw new Error(res.error?.message || 'Registration failed');
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('fixnear_token');
    localStorage.removeItem('fixnear_user');
    setNotifications([]);
    setUnreadCount(0);
  };

  const switchRole = async (role: 'customer' | 'provider' | 'admin') => {
    const creds = DEMO_CREDENTIALS[role];
    if (creds) {
      try {
        await login(creds.email, creds.password);
      } catch (err) {
        console.error('Failed to switch demo role:', err);
      }
    }
  };

  const markNotificationAsRead = async (id: string) => {
    if (!currentUser) return;
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }, currentUser.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isAuthenticated: !!currentUser && !!token,
        isLoading,
        login,
        register,
        logout,
        switchRole,
        notifications,
        unreadCount,
        refreshNotifications: fetchNotifications,
        markNotificationAsRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
