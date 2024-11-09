import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Bell, Mail, User, LogOut } from 'lucide-react'

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate()
  const location = useLocation()
  
  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Mail, label: 'Messages', path: '/messages' },
    { icon: User, label: 'Profile', path: '/profile' },
  ]

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <div className="w-64 p-4">
      <h1 className="text-2xl font-bold mb-8 text-blue-500">XX</h1>
      <nav>
        <ul>
          {menuItems.map((item) => (
            <li key={item.path} className="mb-4">
              <button
                onClick={() => navigate(item.path)}
                className={`flex items-center p-2 rounded-full hover:bg-blue-100 w-full ${
                  location.pathname === item.path ? 'text-blue-500' : 'text-gray-700'
                }`}
              >
                <item.icon className="w-6 h-6 mr-4" />
                <span className="text-lg">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <button
        onClick={handleLogout}
        className="flex items-center p-2 mt-8 text-red-500 hover:bg-red-100 rounded-full w-full"
      >
        <LogOut className="w-6 h-6 mr-4" />
        <span className="text-lg">Logout</span>
      </button>
    </div>
  )
}

export default Sidebar