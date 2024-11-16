import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Bell, Mail, User, LogOut } from 'lucide-react'

interface SidebarProps {
  currentUser: any;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser, onLogout }) => {
  const location = useLocation()
  
  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Mail, label: 'Messages', path: '/messages' },
    { icon: User, label: 'Profile', path: '/profile' },
  ]

  return (
    <div className="w-64 p-4">
      <div className="flex items-center mb-8">
        <img
          src={currentUser.profile_picture ? `http://localhost:5000${currentUser.profile_picture}` : `https://api.dicebear.com/6.x/initials/svg?seed=${currentUser.username}`}
          alt={currentUser.username}
          className="w-10 h-10 rounded-full mr-3"
        />
        <div>
          <h2 className="font-bold">{currentUser.username}</h2>
          <p className="text-sm text-gray-500">{currentUser.status || 'No status'}</p>
        </div>
      </div>
      <nav>
        <ul>
          {menuItems.map((item) => (
            <li key={item.path} className="mb-4">
              <Link
                to={item.path}
                className={`flex items-center p-2 rounded-full hover:bg-blue-100 w-full ${
                  location.pathname === item.path ? 'text-blue-500' : 'text-gray-700'
                }`}
              >
                <item.icon className="w-6 h-6 mr-4" />
                <span className="text-lg">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <button
        onClick={onLogout}
        className="flex items-center p-2 mt-8 text-red-500 hover:bg-red-100 rounded-full w-full"
      >
        <LogOut className="w-6 h-6 mr-4" />
        <span className="text-lg">Logout</span>
      </button>
    </div>
  )
}

export default Sidebar