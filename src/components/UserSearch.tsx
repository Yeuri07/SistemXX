import React, { useState, useEffect } from 'react';
import { Search, UserPlus, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface User {
  id: number;
  username: string;
  isFollowing: boolean;
}

interface UserSearchProps {
  authToken: string;
  currentUser: any;
}

const UserSearch: React.FC<UserSearchProps> = ({ authToken, currentUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsers();
    } else {
      setUsers([]);
    }
  }, [searchQuery]);

  const searchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/users/search?q=${searchQuery}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/users/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, isFollowing: true } : user
        ));
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/users/${userId}/unfollow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, isFollowing: false } : user
        ));
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  return (
    <div className="mb-6 bg-white rounded-lg shadow p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
              <Link to={`/profile/${user.username}`} className="flex items-center space-x-3">
                <img
                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.username}`}
                  alt={user.username}
                  className="w-10 h-10 rounded-full"
                />
                <span className="font-medium">{user.username}</span>
              </Link>
              {user.username !== currentUser.username && (
                <button
                  onClick={() => user.isFollowing ? handleUnfollow(user.id) : handleFollow(user.id)}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-full ${
                    user.isFollowing
                      ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {user.isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ))}
          {!loading && searchQuery && users.length === 0 && (
            <p className="text-center text-gray-500 py-4">No users found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearch;