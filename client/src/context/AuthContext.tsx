import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, NotificationItem } from '../types';
import { apiRequest } from '../lib/api';

// Seed demo users for quick role switching
export const DEMO_USERS: Record<string, UserProfile> = {
  customer: {
    id: 'u1000000-0000-0000-0000-000000000001',
    email: 'rahul.sharma@example.com',
    full_name: 'Rahul Sharma',
    phone: '+91 98765 43210',
    role: 'customer',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80',
  },
  provider: {
    id: 'p1000000-0000-0000-0000-000000000001',
    email: 'ramesh.electrician@example.com',
    full_name: 'Ramesh Kumar',
    phone: '+91 91234 56789',
    role: 'provider',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
  },
  admin: {
    id: 'a1000000-0000-0000-0000-000000000001',
    email: 'admin@fixnear.in',
    full_name: 'FixNear Admin',
    phone: '+91 99999 88888',
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
  },
};

interface AuthContextType {
  currentUser: UserProfile;
  switchRole: (role: 'customer' | 'provider' | 'admin') => void;
  notifications: NotificationItem[];
  unreadCount: number;
  refreshNotifications: () => void;
  markNotificationAsRead: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('fixnear_active_role');
    if (saved && DEMO_USERS[saved]) return DEMO_USERS[saved];
    return DEMO_USERS.customer;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchNotifications = async () => {
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
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [currentUser.id]);

  const switchRole = (role: 'customer' | 'provider' | 'admin') => {
    const user = DEMO_USERS[role];
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('fixnear_active_role', role);
    }
  };

  const markNotificationAsRead = async (id: string) => {
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
