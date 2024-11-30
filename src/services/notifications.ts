import { socket } from './socket';

export interface Notification {
  id: number;
  type: 'follow' | 'like' | 'comment';
  actorId: number;
  actor_username: string;
  targetId: number;
  created_at: string;
  read: boolean;
}

export const subscribeToNotifications = (callback: (notification: Notification) => void) => {
  socket.on('notification', callback);
  return () => {
    socket.off('notification', callback);
  };
};

export const markNotificationAsRead = (notificationId: number) => {
    socket.emit('markNotificationAsRead', notificationId);
  };