import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home, Bell, Mail, User, LogOut } from 'lucide-react';
import Feed from './components/Feed';
import Profile from './components/Profile';
import Notifications from './components/Notifications';
import Messages from './components/Messages';
import Login from './components/Login';
import Register from './components/Register';
import Sidebar from './components/Sidebar';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('currentUser');
    if (storedToken && storedUser) {
      setAuthToken(storedToken);
      setIsLoggedIn(true);
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (user: any, token: string) => {
    setIsLoggedIn(true);
    setCurrentUser({ ...user, username: user.username || user.email });
    setAuthToken(token);
    localStorage.setItem('currentUser', JSON.stringify({ ...user, username: user.username || user.email }));
    localStorage.setItem('authToken', token);
  };

  const handleRegister = (user: any, token: string) => {
    // setIsLoggedIn(true);
    setCurrentUser({ ...user, username: user.username || user.email });
    setAuthToken(token);
    localStorage.setItem('currentUser', JSON.stringify({ ...user, username: user.username || user.email }));
    localStorage.setItem('authToken', token);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setAuthToken('');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {isLoggedIn ? (
          <div className="flex">
            <Sidebar onLogout={handleLogout} activeTab={undefined} setActiveTab={undefined} />
            <main className="flex-1 border-l border-r border-gray-200 max-w-2xl">
              <Routes>
                <Route path="/" element={<Feed currentUser={currentUser} authToken={authToken} />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/messages" element={<Messages currentUser={currentUser} />} />
                <Route path="/profile" element={<Profile user={currentUser} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        ) : (
          <div className="container mx-auto px-4">
            <Routes>
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/register" element={<Register onRegister={handleRegister} />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
