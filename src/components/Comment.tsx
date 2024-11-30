import React from 'react';
import EditableContent from './EditableContent';
import { formatRelativeTime } from '../utils/dateUtils';

interface CommentProps {
  id: number;
  content: string;
  username: string;
  createdAt: string;
  currentUser: any;
  authToken: string;
  onCommentUpdate: (commentId: number, newContent: string) => Promise<void>;
}

const Comment: React.FC<CommentProps> = ({
  id,
  content,
  username,
  createdAt,
  currentUser,
  authToken,
  onCommentUpdate,
}) => {
  const handleUpdateComment = async (newContent: string) => {
    try {
      const response = await fetch(`http://localhost:5000/comments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ content: newContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to update comment');
      }

      await onCommentUpdate(id, newContent);
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  };

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center mb-2">
        <img
          src={`https://api.dicebear.com/6.x/initials/svg?seed=${username}`}
          alt={username}
          className="w-8 h-8 rounded-full mr-2"
        />
        <div>
          <span className="font-semibold">{username}</span>
          <span className="text-gray-500 text-sm ml-2">
            {formatRelativeTime(createdAt)}
          </span>
        </div>
      </div>
      {currentUser?.username === username ? (
        <EditableContent
          content={content}
          onSave={handleUpdateComment}
          type="comment"
        />
      ) : (
        <p className="text-gray-800">{content}</p>
      )}
    </div>
  );
};

export default Comment;