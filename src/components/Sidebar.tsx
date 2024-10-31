import React from 'react'
import { Home, Bell, Mail, User, LogOut } from 'lucide-react'

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { icon: Home, label: 'Home', tab: 'feed' },
    { icon: Bell, label: 'Notifications', tab: 'notifications' },
    { icon: Mail, label: 'Messages', tab: 'messages' },
    { icon: User, label: 'Profile', tab: 'profile' },
  ]

  return (
    <div className="w-64 p-4">
      <h1 className="text-2xl font-bold mb-8 text-blue-500">XX</h1>
      <nav>
        <ul>
          {menuItems.map((item) => (
            <li key={item.tab} className="mb-4">
              <button
                onClick={() => setActiveTab(item.tab)}
                className={`flex items-center p-2 rounded-full hover:bg-blue-100 w-full ${
                  activeTab === item.tab ? 'text-blue-500' : 'text-gray-700'
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