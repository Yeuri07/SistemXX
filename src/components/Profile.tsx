// import React, { useState, useRef } from 'react'
// import { Calendar, MapPin, Camera, Edit3 } from 'lucide-react'

// interface ProfileProps {
//   user: any;
//   authToken: string;
// }

// const Profile: React.FC<ProfileProps> = ({ user, authToken }) => {
//   const [status, setStatus] = useState(user.status || '')
//   const [isEditingStatus, setIsEditingStatus] = useState(false)
//   const [profilePicture, setProfilePicture] = useState(user.profile_picture || null)
//   const fileInputRef = useRef<HTMLInputElement>(null)

//   const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (!file) return

//     const formData = new FormData()
//     formData.append('profile_picture', file)

//     try {
//       const response = await fetch('http://localhost:5000/users/profile-picture', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${authToken}`
//         },
//         body: formData
//       })

//       if (!response.ok) throw new Error('Failed to update profile picture')

//       const data = await response.json()
//       setProfilePicture(data.profile_picture)
//     } catch (error) {
//       console.error('Error updating profile picture:', error)
//       alert('Failed to update profile picture')
//     }
//   }

//   const handleStatusUpdate = async () => {
//     try {
//       const response = await fetch('http://localhost:5000/users/status', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${authToken}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ status })
//       })

//       if (!response.ok) throw new Error('Failed to update status')

//       setIsEditingStatus(false)
//     } catch (error) {
//       console.error('Error updating status:', error)
//       alert('Failed to update status')
//     }
//   }

//   return (
//     <div>
//       <div className="relative">
//         <img
//           src="https://images.unsplash.com/photo-1500964757637-c85e8a162699?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
//           alt="Cover"
//           className="w-full h-48 object-cover"
//         />
//         <div className="absolute bottom-0 left-4 transform translate-y-1/2">
//           <div className="relative group">
//             <img
//               src={profilePicture ? `http://localhost:5000${profilePicture}` : `https://api.dicebear.com/6.x/initials/svg?seed=${user.username}`}
//               alt={user.username}
//               className="w-32 h-32 rounded-full border-4 border-white object-cover"
//             />
//             <button
//               onClick={() => fileInputRef.current?.click()}
//               className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity"
//             >
//               <Camera className="w-4 h-4" />
//             </button>
//             <input
//               type="file"
//               ref={fileInputRef}
//               onChange={handleProfilePictureChange}
//               accept="image/*"
//               className="hidden"
//             />
//           </div>
//         </div>
//       </div>
//       <div className="mt-20 px-4">
//         <h2 className="text-2xl font-bold">{user.username}</h2>
//         <p className="text-gray-500">@{user.username.toLowerCase()}</p>
        
//         <div className="mt-2">
//           {isEditingStatus ? (
//             <div className="flex gap-2">
//               <input
//                 type="text"
//                 value={status}
//                 onChange={(e) => setStatus(e.target.value)}
//                 className="flex-grow p-2 border rounded-lg"
//                 placeholder="What's on your mind?"
//               />
//               <button
//                 onClick={handleStatusUpdate}
//                 className="px-4 py-2 bg-blue-500 text-white rounded-lg"
//               >
//                 Save
//               </button>
//               <button
//                 onClick={() => setIsEditingStatus(false)}
//                 className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
//               >
//                 Cancel
//               </button>
//             </div>
//           ) : (
//             <div className="flex items-center gap-2">
//               <p className="text-gray-700">{status || 'No status set'}</p>
//               <button
//                 onClick={() => setIsEditingStatus(true)}
//                 className="text-blue-500 hover:text-blue-600"
//               >
//                 <Edit3 className="w-4 h-4" />
//               </button>
//             </div>
//           )}
//         </div>

//         <div className="flex mt-4 text-gray-500">
//           <div className="flex items-center mr-4">
//             <MapPin className="w-4 h-4 mr-1" />
//             New York, USA
//           </div>
//           <div className="flex items-center">
//             <Calendar className="w-4 h-4 mr-1" />
//             Joined {new Date(user.created_at).toLocaleDateString()}
//           </div>
//         </div>
//         <div className="flex mt-4">
//           <div className="mr-4">
//             <span className="font-bold">250</span> <span className="text-gray-500">Following</span>
//           </div>
//           <div>
//             <span className="font-bold">1,234</span> <span className="text-gray-500">Followers</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Profile




import React, { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Calendar, MapPin, Camera, Edit3, Users } from 'lucide-react'
import { getUserProfile, getUserPosts } from '../services/api'

interface ProfileProps {
  user: any;
  authToken: string;
}

interface ProfileData {
  id: number;
  username: string;
  email: string;
  profile_picture?: string;
  status?: string;
  followers_count: number;
  following_count: number;
}

const Profile: React.FC<ProfileProps> = ({ user: currentUser, authToken }) => {
  const { username } = useParams()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [userPosts, setUserPosts] = useState([])
  const [isEditingStatus, setIsEditingStatus] = useState(false)
  const [status, setStatus] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
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
        }

        // Fetch user posts
        const posts = await getUserPosts(targetUsername, authToken)
        setUserPosts(posts)
      } catch (error) {
        console.error('Error fetching profile data:', error)
      }
    }

    fetchData()
  }, [username, currentUser.username, authToken])

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
      setProfileData(prev => prev ? { ...prev, profile_picture: data.profile_picture } : null)
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
      setProfileData(prev => prev ? { ...prev, status } : null)
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  if (!profileData) {
    return <div className="p-4">Loading...</div>
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
            <button className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
              Follow
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