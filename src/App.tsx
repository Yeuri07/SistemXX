import React, { useState } from 'react'
import { Home, Bell, Mail, User, LogOut } from 'lucide-react'
import Feed from './components/Feed'
import Profile from './components/Profile'
import Notifications from './components/Notifications'
import Messages from './components/Messages'
import Login from './components/Login'
import Register from './components/Register'
import Sidebar from './components/Sidebar'

function App() {
  const [activeTab, setActiveTab] = useState('feed')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [isRegistering, setIsRegistering] = useState(false)

  const handleLogin = (user) => {
    setIsLoggedIn(true)
    setCurrentUser(user)
  }

  const handleRegister = (user) => {
    setIsLoggedIn(true)
    setCurrentUser(user)
    setIsRegistering(false)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentUser(null)
    setActiveTab('feed')
  }

  const renderContent = () => {
    if (!isLoggedIn) {
      if (isRegistering) {
        return <Register onRegister={handleRegister} />
      }
      return <Login onLogin={handleLogin} />
    }

    switch (activeTab) {
      case 'feed':
        return <Feed currentUser={currentUser} />
      case 'profile':
        return <Profile user={currentUser} />
      case 'notifications':
        return <Notifications />
      case 'messages':
        return <Messages currentUser={currentUser} />
      default:
        return <Feed currentUser={currentUser} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {isLoggedIn ? (
        <div className="flex">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
          <main className="flex-1 border-l border-r border-gray-200 max-w-2xl">
            <header className="bg-white p-4 border-b border-gray-200">
              <h1 className="text-xl font-bold">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            </header>
            <div className="p-4">
              {renderContent()}
            </div>
          </main>
        </div>
      ) : (
        <div className="container mx-auto px-4">
          {renderContent()}
          <div className="text-center mt-4">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-blue-500 hover:underline"
            >
              {isRegistering ? 'Already have an account? Login' : 'Don\'t have an account? Register'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App