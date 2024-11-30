import React, { useState } from 'react';
import { Heart, MessageCircle, Repeat2, Share } from 'lucide-react';
import Comment from './Comment';
import EditableContent from './EditableContent';
import { formatRelativeTime } from '../utils/dateUtils';

interface PostProps {
  id: number;
  content: string;
  username: string;
  createdAt: string;
  likesCount: number;
  imageUrl?: string;
  currentUser: any;
  authToken: string;
  onPostUpdate: (postId: number, newContent: string) => Promise<void>;
}

const Post: React.FC<PostProps> = ({
  id,
  content,
  username,
  createdAt,
  likesCount,
  imageUrl,
  currentUser,
  authToken,
  onPostUpdate,
}) => {
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(likesCount);

  const handleUpdatePost = async (newContent: string) => {
    try {
      const response = await fetch(`http://localhost:5000/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ content: newContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      await onPostUpdate(id, newContent);
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  };

  const handleLike = async () => {
    try {
      const response = await fetch(`http://localhost:5000/posts/${id}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        setLocalLikesCount(prev => isLiked ? prev - 1 : prev + 1);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`http://localhost:5000/posts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([...comments, comment]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleUpdateComment = async (commentId: number, newContent: string) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId ? { ...comment, content: newContent } : comment
      )
    );
  };

  const loadComments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/posts/${id}/comments`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      if (response.ok) {
        const loadedComments = await response.json();
        setComments(loadedComments);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex items-center mb-4">
        <img
          src={`https://api.dicebear.com/6.x/initials/svg?seed=${username}`}
          alt={username}
          className="w-10 h-10 rounded-full mr-3"
        />
        <div>
          <div className="font-semibold">{username}</div>
          <div className="text-gray-500 text-sm">
            {formatRelativeTime(createdAt)}
          </div>
        </div>
      </div>

      {currentUser?.username === username ? (
        <EditableContent
          content={content}
          onSave={handleUpdatePost}
          type="post"
        />
      ) : (
        <p className="mb-4">{content}</p>
      )}

      {imageUrl && (
        <div className="mb-4">
          <img
            src={`http://localhost:5000${imageUrl}`}
            alt="Post"
            className="rounded-lg max-h-96 w-full object-cover"
          />
        </div>
      )}

      <div className="flex items-center space-x-6 text-gray-500">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-1 ${
            isLiked ? 'text-red-500' : 'hover:text-red-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          <span>{localLikesCount}</span>
        </button>
        <button
          onClick={() => {
            setShowComments(!showComments);
            if (!showComments) loadComments();
          }}
          className="flex items-center space-x-1 hover:text-blue-500"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{comments.length}</span>
        </button>
        <button className="flex items-center space-x-1 hover:text-green-500">
          <Repeat2 className="w-5 h-5" />
        </button>
        <button className="flex items-center space-x-1 hover:text-blue-500">
          <Share className="w-5 h-5" />
        </button>
      </div>

      {showComments && (
        <div className="mt-4 space-y-4">
          <form onSubmit={handleAddComment} className="flex space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
              disabled={!newComment.trim()}
            >
              Comment
            </button>
          </form>

          <div className="space-y-4">
            {comments.map((comment) => (
              <Comment
                key={comment.id}
                {...comment}
                currentUser={currentUser}
                authToken={authToken}
                onCommentUpdate={handleUpdateComment}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;