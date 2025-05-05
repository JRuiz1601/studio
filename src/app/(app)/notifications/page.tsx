'use client';

import { useState } from 'react';
import Link from 'next/link'; // Import Link
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { useNotifications } from '@/context/notifications-context'; // Import context

// Interface is now defined in context
// interface Notification { ... }

// Initial data now comes from context
// const initialNotifications: Notification[] = [ ... ];

export default function NotificationsPage() {
  // Use context state and actions
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  // State management is handled by context now
  // const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  // const markAsRead = (id: string) => { ... };
  // const markAllAsRead = () => { ... };
  // const deleteNotification = (id: string) => { ... };
  // const unreadCount = notifications.filter(n => !n.read).length;


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
               <div className="flex"> {/* Flex container for content and actions */}
                  <CardContent className="p-4 flex items-start gap-4 flex-1"> {/* Content takes most space */}
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
                       {/* "Ver Detalles" Button */}
                       {notification.link && (
                         <Button variant="link" size="sm" asChild className="p-0 h-auto mt-1 text-primary">
                           <Link href={notification.link}>
                             Ver Detalles
                           </Link>
                         </Button>
                       )}
                    </div>
                  </CardContent>

                  {/* Actions Column */}
                   <div className="flex flex-col gap-1 items-end p-4 border-l border-border/50">
                       {!notification.read && (
                           <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)} className="h-auto p-1 text-xs whitespace-nowrap">
                              Mark read
                           </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => deleteNotification(notification.id)} className="h-6 w-6 text-muted-foreground hover:text-destructive">
                          <X className="h-4 w-4" />
                          <span className="sr-only">Delete notification</span>
                        </Button>
                   </div>
                </div>


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
