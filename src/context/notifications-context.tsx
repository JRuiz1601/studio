'use client';

import React, { createContext, useState, useContext, type ReactNode, useCallback } from 'react';

interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: Date;
  read: boolean;
  link?: string;
}

// Mock data for initial state
const initialNotificationsData: Notification[] = [
   {
    id: 'n1',
    title: 'Policy Activated',
    description: 'Your "Accidentes Personales Plus" policy was automatically activated due to detected risk factors.',
    type: 'success',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    read: false,
    link: '/insurances#accident1',
  },
  {
    id: 'n2',
    title: 'Wearable Battery Low',
    description: 'Your connected wearable device battery is below 20%. Please charge it soon.',
    type: 'warning',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    link: '/profile/settings',
  },
  {
    id: 'n3',
    title: 'New Recommendation',
    description: 'We have a new recommendation for you regarding pension savings. Check it out!',
    type: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    link: '/recommendations#rec_pension_boost',
  },
   {
    id: 'n4',
    title: 'Payment Due Soon',
    description: 'Your premium payment for "Salud Esencial" is due in 3 days.',
    type: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    read: true,
    link: '/insurances#health1',
   },
    {
      id: 'n5',
      title: 'Profile Update Suggested',
      description: 'Consider updating your dependents information for more accurate educational insurance recommendations.',
      type: 'info',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      read: true,
      link: '/profile/edit',
    },
];


interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  // Add function to add notifications if needed in future
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotificationsData);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    // TODO: Add API call to mark notification as read on the backend
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    // TODO: Add API call to mark all as read
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    // TODO: Add API call to delete notification
  }, []);

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = (): NotificationsContextType => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
