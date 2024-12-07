
import React, { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Camera, Edit3, Users } from 'lucide-react'
import { getUserProfile, getUserPosts } from '../services/api'
import { useUser } from '../context/UserContext'
import LoadingScreen from './LoadingScreen'


interface ProfileProps {
  user: any;
  authToken: string;
}

interface ProfileData {
  id: number;
  username: string;
  email: string;
  profileData?: string;
  status?: string;
  followers_count: number;
  following_count: number;
}

const Profile: React.FC<ProfileProps> = ({ user: currentUser, authToken }) => {
  const { username } = useParams()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [userPosts, setUserPosts] = useState([])
  const [isEditingStatus, setIsEditingStatus] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false); 
  const [status, setStatus] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { updateProfilePicture } = useUser()
  
  
  const isOwnProfile = !username || username === currentUser.username

  useEffect(() => {
    
    const fetchData = async () => {
      const targetUsername = username || currentUser.username
      try {
        // Fetch user profile
        const profile = await getUserProfile(targetUsername, authToken)
        if (profile) {
          setProfileData(profile)
          setStatus(profile.status || '')
          if (profile.profile_picture && isOwnProfile) {
            updateProfilePicture(profile.profile_picture)
          }
        }

        // Fetch user posts
        const posts = await getUserPosts(targetUsername, authToken)
        setUserPosts(posts)
         // Check if the current user is following the profile
         const response = await fetch(`http://localhost:5000/users/${profile.id}/is-following`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });
        const data = await response.json();
        setIsFollowing(data.isFollowing);
      } catch (error) {
        console.error('Error fetching profile data:', error)
      }
    }

    fetchData()
  }, [username, currentUser.username, authToken])

  const handleFollow = async () => {
    try {
      const response = await fetch(`http://localhost:5000/users/${profileData?.id}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        setIsFollowing(true); // Actualizamos el estado a "siguiendo"
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };
  const handleUnfollow = async () => {
    try {
      const response = await fetch(`http://localhost:5000/users/${profileData?.id}/unfollow`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        setIsFollowing(false); // Actualizamos el estado a "no siguiendo"
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };
 

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append('profile_picture', file);
  
    try {
      const response = await fetch('http://localhost:5000/users/profile-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });
  
      if (!response.ok) throw new Error('Failed to update profile picture');
  
      const data = await response.json();
      setProfileData(prev => prev ? { ...prev, profile_picture: data.profile_picture } : null);
  
      // Aquí actualizamos el contexto global
      updateProfilePicture(data.profile_picture);
    } catch (error) {
      console.error('Error updating profile picture:', error);
      alert('Failed to update profile picture');
    }
  };

  
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
      setProfileData(prev => prev ? { ...prev, status } : null)
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  if (!profileData) {
    return <LoadingScreen />
  }

  return (
    <div>
      <div className="relative">
        <img
          src="https://images.unsplash.com/photo-1500964757637-c85e8a162699"
          alt="Cover"
          className="w-full h-48 object-cover"
        />
        <div className="absolute bottom-0 left-4 transform translate-y-1/2">
          <div className="relative group">
         
            <img
              src={profileData.profile_picture ? `http://localhost:5000${profileData.profile_picture}` : `https://api.dicebear.com/6.x/initials/svg?seed=${profileData.username}`}
              alt={profileData.username}
              className="w-32 h-32 rounded-full border-4 border-white object-cover"
            />
            {isOwnProfile && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
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
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{profileData.username}</h2>
            <p className="text-gray-500">@{profileData.username.toLowerCase()}</p>
          </div>
          {!isOwnProfile && (
              <button
              onClick={isFollowing ? handleUnfollow : handleFollow} // Cambiar entre Follow y Unfollow
              className={`px-4 py-2 rounded-full ${
                isFollowing ? 'bg-gray-100 text-gray-800' : 'bg-blue-500 text-white'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            <span className="font-bold">{profileData.followers_count}</span>
            <span className="text-gray-500 ml-1">Followers</span>
          </div>
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            <span className="font-bold">{profileData.following_count}</span>
            <span className="text-gray-500 ml-1">Following</span>
          </div>
        </div>

        <div className="mt-4">
          {isOwnProfile ? (
            isEditingStatus ? (
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
                <p className="text-gray-700">{profileData.status || 'No status set'}</p>
                <button
                  onClick={() => setIsEditingStatus(true)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )
          ) : (
            <p className="text-gray-700">{profileData.status || 'No status set'}</p>
          )}
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Posts</h3>
          {userPosts.map(post => (
            <div key={post.id} className="border-b border-gray-200 py-4">
              <p className="mb-2">{post.content}</p>
              {post.media_url && (
                <div className="mb-2">
                  {post.media_type === 'image' ? (
                    <img 
                      src={`http://localhost:5000${post.media_url}`} 
                      alt="Post media" 
                      className="rounded-lg max-h-96 w-full object-cover" 
                    />
                  ) : (
                    <video 
                      src={`http://localhost:5000${post.media_url}`} 
                      className="rounded-lg max-h-96 w-full" 
                      controls 
                    />
                  )}
                </div>
              )}
              <p className="text-gray-500 text-sm">{new Date(post.created_at).toLocaleString()}</p>
            </div>
          ))}
          {userPosts.length === 0 && (
            <p className="text-gray-500 text-center py-8">No posts yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile