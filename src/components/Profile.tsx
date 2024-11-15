import React, { useState, useRef } from 'react'
import { Calendar, MapPin, Camera, Edit3 } from 'lucide-react'

interface ProfileProps {
  user: any;
  authToken: string;
}

const Profile: React.FC<ProfileProps> = ({ user, authToken }) => {
  const [status, setStatus] = useState(user.status || '')
  const [isEditingStatus, setIsEditingStatus] = useState(false)
  const [profilePicture, setProfilePicture] = useState(user.profile_picture || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('profile_picture', file)

    try {
      const response = await fetch('http://localhost:5000/users/profile-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      })

      if (!response.ok) throw new Error('Failed to update profile picture')

      const data = await response.json()
      setProfilePicture(data.profile_picture)
    } catch (error) {
      console.error('Error updating profile picture:', error)
      alert('Failed to update profile picture')
    }
  }

  const handleStatusUpdate = async () => {
    try {
      const response = await fetch('http://localhost:5000/users/status', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      if (!response.ok) throw new Error('Failed to update status')

      setIsEditingStatus(false)
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  return (
    <div>
      <div className="relative">
        <img
          src="https://images.unsplash.com/photo-1500964757637-c85e8a162699?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
          alt="Cover"
          className="w-full h-48 object-cover"
        />
        <div className="absolute bottom-0 left-4 transform translate-y-1/2">
          <div className="relative group">
            <img
              src={profilePicture ? `http://localhost:5000${profilePicture}` : `https://api.dicebear.com/6.x/initials/svg?seed=${user.username}`}
              alt={user.username}
              className="w-32 h-32 rounded-full border-4 border-white object-cover"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleProfilePictureChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>
      </div>
      <div className="mt-20 px-4">
        <h2 className="text-2xl font-bold">{user.username}</h2>
        <p className="text-gray-500">@{user.username.toLowerCase()}</p>
        
        <div className="mt-2">
          {isEditingStatus ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex-grow p-2 border rounded-lg"
                placeholder="What's on your mind?"
              />
              <button
                onClick={handleStatusUpdate}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditingStatus(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-gray-700">{status || 'No status set'}</p>
              <button
                onClick={() => setIsEditingStatus(true)}
                className="text-blue-500 hover:text-blue-600"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex mt-4 text-gray-500">
          <div className="flex items-center mr-4">
            <MapPin className="w-4 h-4 mr-1" />
            New York, USA
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            Joined {new Date(user.created_at).toLocaleDateString()}
          </div>
        </div>
        <div className="flex mt-4">
          <div className="mr-4">
            <span className="font-bold">250</span> <span className="text-gray-500">Following</span>
          </div>
          <div>
            <span className="font-bold">1,234</span> <span className="text-gray-500">Followers</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile