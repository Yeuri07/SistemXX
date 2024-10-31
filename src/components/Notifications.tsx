import React from 'react'
import { Heart, Repeat2, User } from 'lucide-react'

const notifications = [
  { id: 1, type: 'like', user: 'John Doe', content: 'liked your tweet', time: '2h ago' },
  { id: 2, type: 'retweet', user: 'Jane Smith', content: 'retweeted your tweet', time: '4h ago' },
  { id: 3, type: 'follow', user: 'Bob Johnson', content: 'followed you', time: '1d ago' },
]

const NotificationItem = ({ notification }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />
      case 'retweet':
        return <Repeat2 className="w-5 h-5 text-green-500" />
      case 'follow':
        return <User className="w-5 h-5 text-blue-500" />
      default:
        return null
    }
  }

  return (
    <div className="flex items-start p-4 hover:bg-gray-50 border-b border-gray-200">
      <div className="mr-3">{getIcon()}</div>
      <div>
        <p>
          <span className="font-bold">{notification.user}</span> {notification.content}
        </p>
        <p className="text-gray-500 text-sm">{notification.time}</p>
      </div>
    </div>
  )
}

const Notifications = () => {
  return (
    <div>
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  )
}

export default Notifications