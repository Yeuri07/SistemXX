import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, Repeat2, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Notification } from '../services/notifications';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'retweet':
        return <Repeat2 className="w-5 h-5 text-green-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getMessage = () => {
    switch (notification.type) {
      case 'like':
        return 'liked your post';
      case 'retweet':
        return 'retweeted your post';
      case 'follow':
        return 'started following you';
      default:
        return '';
    }
  };

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div
      className={`flex items-start p-4 hover:bg-gray-50 border-b border-gray-200 cursor-pointer ${
        !notification.read ? 'bg-blue-50' : ''
      }`}
      onClick={handleClick}
    >
      <div className="mr-3">{getIcon()}</div>
      <div className="flex-1">
        <Link to={`/profile/${notification.actor_username}`} className="hover:underline">
          <span className="font-bold">{notification.actor_username}</span>
        </Link>{' '}
        <span>{getMessage()}</span>
        <p className="text-gray-500 text-sm">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>
      {!notification.read && (
        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
      )}
    </div>
  );
};

export default NotificationItem;