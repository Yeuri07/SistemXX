import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Bell, Mail, User, LogOut,Settings } from 'lucide-react'
import logo from '../../public/Logoxx.png'

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
    { icon: Settings, label: 'Settings', path: '/settings' },
  ]

  return (
    <div className="w-64 p-4">
      <div className="flex items-center mb-2">
        <Link to={'/'}>
        <img
          src={logo}
          alt={currentUser.username}
          className="w-24 h-24 rounded-full mr-2"
        />
        </Link>
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