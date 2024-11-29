import { socket } from './socket';

export interface Notification {
  id: number;
  type: 'follow' | 'like' | 'retweet';
  actorId: number;
  actorUsername: string;
  targetId: number;
  createdAt: string;
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