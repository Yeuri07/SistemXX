import React, { useState, useEffect } from 'react';

const Settings = () => {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isEditing, setIsEditing] = useState({
    username: false,
    email: false,
    password: false,
  });

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [userId, setUserId] = useState<number | null>(null);

  
  useEffect(() => {
    const fetchData = async () => {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        console.error('Token not found');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/users/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();
        console.log('API response data:', data);

        setFormData({
          username: data.username || '',
          email: data.email || '',
          password: '',
        });

        setUserId(data.id);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchData();
  }, []);

  const handleUsernameUpdate = async (newUsername: string) => {
    try {
      const authToken = localStorage.getItem('authToken');
  
      if (!newUsername || newUsername.trim() === '') {
        alert('Please provide a valid username');
        return;
      }
  
      const response = await fetch('http://localhost:5000/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: newUsername }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
  
        if (response.status === 409) {
          alert(`Username "${newUsername}" is already in use. Please choose another.`);
        } else if (response.status === 400) {
          alert('Invalid request. Please check the data you entered.');
        } else {
          throw new Error(errorData.message || 'Failed to update username');
        }
  
        return; 
      }
  
      alert('Username updated successfully!');
    } catch (error) {
      console.error('Username in use', error);
      alert('Username in use');
    }
  };


  const handleEmailUpdate = async (newEmail: string) => {
    try {
      const authToken = localStorage.getItem('authToken');
  
      // Verificar si el nuevo email fue proporcionado
      if (!newEmail || newEmail.trim() === '') {
        alert('Please provide a valid email address');
        return;
      }
  
      // Realizar la solicitud PUT para actualizar el email
      const response = await fetch('http://localhost:5000/users/profile/email', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newEmail }),
      });
  
      // Manejar posibles errores de la solicitud
      if (!response.ok) {
        const errorData = await response.json();
  
        // Validar si el error es porque el email ya está en uso
        if (response.status === 409) {
          alert(`Email "${newEmail}" is already in use. Please choose another.`);
        } else if (response.status === 400) {
          alert('Invalid request. Please check the data you entered.');
        } else {
          throw new Error(errorData.message || 'Failed to update email');
        }
  
        return; // Salir si hay error
      }
  
      // Si la actualización es exitosa
      alert('Email updated successfully!');
    } catch (error) {
      console.error('Error updating email:', error);
      alert('An unexpected error occurred while updating the email.');
    }
  };


  
      const handlePasswordUpdate = async (newPassword: string) => {
        try {
          const authToken = localStorage.getItem('authToken');
      
          if (!newPassword || newPassword.trim() === '') {
            alert('Please provide a valid new password');
            return;
          }
      
          const response = await fetch('http://localhost:5000/users/profile/password', {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newPassword }),
          });
      
          if (!response.ok) {
            const errorData = await response.json();
      
            if (response.status === 400) {
              alert('Invalid request. Please check the data you entered.');
            } else {
              throw new Error(errorData.message || 'Failed to update password');
            }
      
            return; 
          }
      
          alert('Password updated successfully!');
        } catch (error) {
          console.error('Error updating password:', error);
          alert('An unexpected error occurred while updating the password.');
        }
      };
     
      

      const handleDeleteAccount = async () => {
        try {
          const authToken = localStorage.getItem('authToken');
      
          if (!authToken) {
            alert('You are not authenticated. Please log in again.');
            return;
          }
      
         
          const confirmDelete = window.confirm('Are you sure you want to delete your account? This action is irreversible.');
          
          if (!confirmDelete) {
            return; 
          }
          console.log(userId)
      
          const response = await fetch(`http://localhost:5000/users/profile/${userId}/del`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          
          });
      
          if (!response.ok) {
            const errorData = await response.json();
      
            if (response.status === 400) {
              alert('Invalid request. Please try again later.');
            } else {
              throw new Error(errorData.message || 'Failed to delete account');
            }
      
            return;
          }
      
          alert('Your account has been deleted successfully.');
          window.location.href = '/login'; // Redirigir a la página de inicio de sesión o donde prefieras
      
        } catch (error) {
          console.error('Error deleting account:', error);
          alert('An unexpected error occurred while deleting the account.');
        }
      };
      

  const handleEdit = (field) => {
    setIsEditing((prev) => ({ ...prev, [field]: true }));
  };

  const handleSaveField = (field) => {
    setIsEditing((prev) => ({ ...prev, [field]: false }));
    console.log(formData[field]);
  };

  const handleCancelEdit = (field) => {
    setIsEditing((prev) => ({ ...prev, [field]: false }));
    console.log(`Cancelled edit for ${field}`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="settings-container max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h1 className="text-2xl font-semibold mb-6 text-gray-900">Account Settings</h1>

      {/* Main Settings Menu */}
      <div className="settings-menu">
        {/* Account Settings */}
        <div className="menu-item mb-4">
          <button
            onClick={() => setIsAccountOpen(!isAccountOpen)}
            className="w-full text-left py-3 px-4 bg-gray-100 text-lg font-semibold rounded-lg hover:bg-gray-200 transition"
          >
            Account Info
          </button>
          {isAccountOpen && (
            <div className="submenu bg-gray-50 p-4 rounded-lg shadow-sm">
              {/* Username Field */}
              <div className="mb-4 relative flex items-center">
                <div className="flex-grow">
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  {isEditing.username ? (
                    <>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="mt-2 p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => handleUsernameUpdate(formData.username)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => handleCancelEdit('username')}
                          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 focus:outline-none"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="mt-2 text-gray-800">{formData.username}</p>
                      <button
                        onClick={() => handleEdit('username')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-blue-500 hover:text-blue-700 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="mb-4 relative flex items-center">
                <div className="flex-grow">
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  {isEditing.email ? (
                    <>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-2 p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => handleEmailUpdate(formData.email)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => handleCancelEdit('email')}
                          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 focus:outline-none"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="mt-2 text-gray-800">{formData.email}</p>
                      <button
                        onClick={() => handleEdit('email')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-blue-500 hover:text-blue-700 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div className="mb-4 relative flex items-center">
                <div className="flex-grow">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  {isEditing.password ? (
                    <>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="mt-2 p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => handlePasswordUpdate(formData.password)}
 
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => handleCancelEdit('password')}
                          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 focus:outline-none"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="mt-2 text-gray-800">********</p>
                      <button
                        onClick={() => handleEdit('password')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-blue-500 hover:text-blue-700 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help */}
        <div className="menu-item mb-4">
          <button
            onClick={() => setIsHelpOpen(!isHelpOpen)}
            className="w-full text-left py-3 px-4 bg-gray-100 text-lg font-semibold rounded-lg hover:bg-gray-200 transition"
          >
            Help
          </button>
          {isHelpOpen && (
            <div className="submenu bg-gray-50 p-4 rounded-lg shadow-sm">
              <p>If you need assistance, please reach out to our support team.</p>
            </div>
          )}
        </div>

        {/* Delete Account */}
        <div className="menu-item mb-4">
          <button
            onClick={() => setIsDeleteAccountOpen(!isDeleteAccountOpen)}
            className="w-full text-left py-3 px-4 bg-gray-100 text-lg font-semibold rounded-lg hover:bg-gray-200 transition"
          >
            Delete Account
          </button>
          {isDeleteAccountOpen && (
            <div className="submenu bg-gray-50 p-4 rounded-lg shadow-sm">
              <p>
                Are you sure you want to delete your account? This action is irreversible.
              </p>
              <button
                onClick={handleDeleteAccount}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none">
                Confirm Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
