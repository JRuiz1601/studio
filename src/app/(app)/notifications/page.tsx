'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: Date;
  read: boolean;
}

// Mock data for simulated notifications
const initialNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'Policy Activated',
    description: 'Your "Accidentes Personales Plus" policy was automatically activated due to detected risk factors.',
    type: 'success',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    read: false,
  },
  {
    id: 'n2',
    title: 'Wearable Battery Low',
    description: 'Your connected wearable device battery is below 20%. Please charge it soon.',
    type: 'warning',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
  },
  {
    id: 'n3',
    title: 'New Recommendation',
    description: 'We have a new recommendation for you regarding pension savings. Check it out!',
    type: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
  },
   {
    id: 'n4',
    title: 'Payment Due Soon',
    description: 'Your premium payment for "Salud Esencial" is due in 3 days.',
    type: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    read: true,
   },
    {
      id: 'n5',
      title: 'Profile Update Suggested',
      description: 'Consider updating your dependents information for more accurate educational insurance recommendations.',
      type: 'info',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      read: true,
    },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    // TODO: Add API call to mark notification as read on the backend
  };

   const markAllAsRead = () => {
     setNotifications(prev => prev.map(n => ({ ...n, read: true })));
     // TODO: Add API call to mark all as read
   };


  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    // TODO: Add API call to delete notification
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
         <h1 className="text-2xl font-semibold">Notifications</h1>
          {unreadCount > 0 && (
             <Button variant="link" onClick={markAllAsRead} className="p-0 h-auto text-sm">
               Mark all as read
             </Button>
          )}
      </div>


      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`relative overflow-hidden transition-opacity ${notification.read ? 'opacity-70' : 'bg-card'}`}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className="mt-1 shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <CardTitle className="text-base font-medium">{notification.title}</CardTitle>
                  <CardDescription className="text-sm">{notification.description}</CardDescription>
                  <p className="text-xs text-muted-foreground">
                     {/* Format timestamp (e.g., using date-fns) */}
                     {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {notification.timestamp.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                    {!notification.read && (
                        <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)} className="h-auto p-1 text-xs">
                           Mark read
                        </Button>
                     )}
                     <Button variant="ghost" size="icon" onClick={() => deleteNotification(notification.id)} className="h-6 w-6 text-muted-foreground hover:text-destructive">
                       <X className="h-4 w-4" />
                       <span className="sr-only">Delete notification</span>
                     </Button>
                </div>

              </CardContent>
               {/* Optional: Add subtle indicator for unread */}
               {!notification.read && (
                 <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
               )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center p-8 border-dashed">
          <CardHeader>
            <CardTitle>All caught up!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">You have no new notifications.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
