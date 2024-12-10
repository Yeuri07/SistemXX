import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { User, getFollowers } from '../services/api';
import { useUser } from '../context/UserContext';

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: User) => void;
  authToken: string;
  currentUser: any;
}

const NewMessageModal: React.FC<NewMessageModalProps> = ({
  isOpen,
  onClose,
  onSelectUser,
  authToken,
  currentUser
}) => {
  const [followers, setFollowers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { profilePicture } = useUser();

  useEffect(() => {
    if (isOpen) {
      loadFollowers();
    }
  }, [isOpen, authToken]);

  const loadFollowers = async () => {
    try {
      setLoading(true);
      const fetchedFollowers = await getFollowers(authToken);
      setFollowers(fetchedFollowers);
    } catch (error) {
      console.error('Error loading followers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFollowers = followers.filter((follower) =>
    follower.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserProfilePicture = (user: User) => {
    if (user.username === currentUser.username && profilePicture) {
      return `http://localhost:5000${profilePicture}`;
    }
    return user.profile_picture
      ? `http://localhost:5000${user.profile_picture}`
      : `https://api.dicebear.com/6.x/initials/svg?seed=${user.username}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-96 max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold">New Message</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            filteredFollowers.map((follower) => (
              <div
                key={follower.id}
                className="p-4 hover:bg-gray-50 cursor-pointer flex items-center"
                onClick={() => {
                  onSelectUser(follower);
                  onClose();
                }}
              >
                <img
                  src={getUserProfilePicture(follower)}
                  alt={follower.username}
                  className="w-10 h-10 rounded-full mr-3 object-cover"
                />
                <span className="font-medium">{follower.username}</span>
              </div>
            ))
          )}
          {!loading && filteredFollowers.length === 0 && (
            <p className="text-center text-gray-500 p-4">
              {searchTerm ? 'No users found' : 'No followers yet'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewMessageModal;