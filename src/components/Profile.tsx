import React from 'react'
import { Calendar, MapPin } from 'lucide-react'

const Profile = ({ user }) => {
  return (
    <div>
      <div className="relative">
        <img
          src="https://images.unsplash.com/photo-1500964757637-c85e8a162699?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
          alt="Cover"
          className="w-full h-48 object-cover"
        />
        <img
          src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.username}`}
          alt={user.username}
          className="absolute bottom-0 left-4 transform translate-y-1/2 w-32 h-32 rounded-full border-4 border-white"
        />
      </div>
      <div className="mt-16 px-4">
        <h2 className="text-2xl font-bold">{user.username}</h2>
        <p className="text-gray-500">@{user.username.toLowerCase()}</p>
        <p className="mt-2">Passionate about technology and social networking. Love to connect with people from all around the world!</p>
        <div className="flex mt-2 text-gray-500">
          <div className="flex items-center mr-4">
            <MapPin className="w-4 h-4 mr-1" />
            New York, USA
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            Joined January 2024
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