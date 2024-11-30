import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { User, getFollowers } from '../services/api';

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: User) => void;
  authToken: string;
}

const NewMessageModal: React.FC<NewMessageModalProps> = ({
  isOpen,
  onClose,
  onSelectUser,
  authToken,
}) => {
  const [followers, setFollowers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadFollowers();
    }
  }, [isOpen, authToken]);

  const loadFollowers = async () => {
    const fetchedFollowers = await getFollowers(authToken);
    setFollowers(fetchedFollowers);
  };

  const filteredFollowers = followers.filter((follower) =>
    follower.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <input
            type="text"
            placeholder="Search followers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded-lg mb-4"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredFollowers.map((follower) => (
            <div
              key={follower.id}
              className="p-4 hover:bg-gray-50 cursor-pointer flex items-center"
              onClick={() => {
                onSelectUser(follower);
                onClose();
              }}
            >
              <img
                src={`https://api.dicebear.com/6.x/initials/svg?seed=${follower.username}`}
                alt={follower.username}
                className="w-10 h-10 rounded-full mr-3"
              />
              <span className="font-medium">{follower.username}</span>
            </div>
          ))}
          {filteredFollowers.length === 0 && (
            <p className="text-center text-gray-500 p-4">No followers found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewMessageModal;