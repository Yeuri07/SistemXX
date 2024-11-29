import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import NotificationItem from './NotificationItem';
import { Notification, subscribeToNotifications, markNotificationAsRead } from '../services/notifications';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  

  useEffect(() => {
    const unsubscribe = subscribeToNotifications((notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    // Fetch existing notifications
    fetch('http://localhost:5000/notifications', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    })
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(err => console.error('Error fetching notifications:', err));

    return () => {
      unsubscribe();
    };
  }, []);

  const handleMarkAsRead = (notificationId: number) => {
    markNotificationAsRead(notificationId);
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <div className="flex items-center">
              <Bell className="w-5 h-5 text-blue-500" />
              <span className="ml-2 bg-blue-500 text-white px-2 py-1 rounded-full text-sm">
                {unreadCount}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
            />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            No notifications yet
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;