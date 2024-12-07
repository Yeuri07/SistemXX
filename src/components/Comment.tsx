import React, { useState } from 'react';
import EditableContent from './EditableContent';
import { formatRelativeTime } from '../utils/dateUtils';
import { useUser } from '../context/UserContext';
import { Edit2, Trash2 } from 'lucide-react';
import { useParams } from 'react-router-dom';



interface CommentProps {
  id: number;
  content: string;
  username: string;
  created_at: string;
  currentUser: any;
  authToken: string;
  onCommentUpdate: (commentId: number, newContent: string) => Promise<void>;
  onCommentDelete: (commentId: number) => Promise<void>;
}

const Comment: React.FC<CommentProps> = ({
  id,
  content,
  username,
  created_at,
  currentUser,
  authToken,
  onCommentUpdate,
  onCommentDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const { profilePicture } = useUser();
 
  const handleUpdateComment = async () => {
    try {
      const body = JSON.stringify({
        comment: onCommentUpdate, // Asegúrate de que esta variable es un string o un objeto plano
      });
  
      const response = await fetch(`/posts/${postId}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update comment');
      }
  
      console.log('Comment updated successfully!');
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await onCommentDelete(id);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const getUserProfilePicture = () => {
    
    if (username === currentUser.username && profilePicture) {
      return `http://localhost:5000${profilePicture}`;
    }
   
    return `https://api.dicebear.com/6.x/initials/svg?seed=${username}`;
  };

  return (
    
    <div className="py-2">
      <div className="flex items-start space-x-2">
        <img
          src={getUserProfilePicture()}
          alt={username}
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-sm">{username}</span>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500 text-xs">
                {formatRelativeTime(created_at)}
              </span>
              {currentUser?.username === username && (
                <div className="flex space-x-1">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-gray-500 hover:text-blue-500 rounded-full hover:bg-gray-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDeleteComment}
                    className="p-1 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows={2}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-full text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateComment}
                  className="px-3 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 text-sm"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-800 text-sm">{content}</p>
          )}
        </div>
      </div>
    </div>
  );
};


export default Comment;