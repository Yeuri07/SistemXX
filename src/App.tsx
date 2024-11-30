import React, { useState, useEffect } from 'react'
import { 
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  Navigate,
} from 'react-router-dom'
import Feed from './components/Feed'
import Profile from './components/Profile'
import Notifications from './components/Notifications'
import Messages from './components/Messages'
import Login from './components/Login'
import Register from './components/Register'
import Sidebar from './components/Sidebar'
import { connectSocket, disconnectSocket } from './services/socket'
import { Outlet } from "react-router-dom";
import  UserSearch  from './components/UserSearch'
import LoadingScreen from './components/LoadingScreen'



function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [authToken, setAuthToken] = useState('')
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken')
    const storedUser = localStorage.getItem('currentUser')
    if (storedToken && storedUser) {
      setAuthToken(storedToken)
      setIsLoggedIn(true)
      setCurrentUser(JSON.parse(storedUser))
   
    }
    setLoading(false);
  }, [])

  const handleLogin = (user: any, token: string) => {
    setIsLoggedIn(true)
    setCurrentUser(user)
    setAuthToken(token)
    localStorage.setItem('currentUser', JSON.stringify(user))
    localStorage.setItem('authToken', token)
    connectSocket(token)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentUser(null)
    setAuthToken('')
    localStorage.removeItem('currentUser')
    localStorage.removeItem('authToken')
    disconnectSocket()
  }
  const Layout = ({ currentUser, onLogout }) => {
    return (
      
      <div className="flex h-screen">
        <div className="w-64 fixed h-full border-r border-gray-200">
          <Sidebar currentUser={currentUser} onLogout={onLogout} />
        </div>
        <main className="flex-1 ml-64 border-l border-r border-gray-200 max-w-2xl">
          <Outlet />
        </main>
        <div className=""><UserSearch authToken={authToken} currentUser={currentUser} /></div>
      </div>
      
    )
  }
  
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/">
        {isLoggedIn ? (
          <Route element={<Layout currentUser={currentUser} onLogout={handleLogout} />}>
            <Route index element={<Feed currentUser={currentUser} authToken={authToken} />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="messages" element={<Messages currentUser={currentUser} authToken={authToken} />} />
            <Route path="profile" element={<Profile user={currentUser} authToken={authToken} />} />
            <Route path="profile/:username" element={<Profile user={currentUser} authToken={authToken} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        ) : (
          <Route>
            <Route index element={<Navigate to="/login" replace />} />
            <Route path="login" element={<Login onLogin={handleLogin} />} />
            <Route path="register" element={<Register onRegister={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Route>
        )}
      </Route>
    ),
    {
      future: {
        v7_startTransition: true
      }
    }
  )
  if (loading) {
    // Muestra una pantalla de carga mientras se verifica el token
    return <LoadingScreen />
  }

  return (

    <div className="min-h-screen bg-gray-100">
      <RouterProvider router={router} />
    </div>

  )
}

export default App