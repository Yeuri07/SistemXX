import React, { useState, useEffect } from 'react';
import { Edit2, Heart, MessageCircle, Repeat2, Share, Trash2,X } from 'lucide-react';
import Comment from './Comment';
import EditableContent from './EditableContent';
import { formatRelativeTime } from '../utils/dateUtils';
import { useUser } from '../context/UserContext';
import { getPosts } from '../services/api';

interface PostProps {
  id: number;
  content: string;
  username: string;
  created_at: string;
  likesCount: number;
  media_url?: string;
  media_type?: 'image' | 'video';
  currentUser: any;
  authToken: string;
  onPostUpdate: (postId: number, newContent: string) => Promise<void>;
  onPostDelete?: (postId: number) => void;
}

const Post: React.FC<PostProps> = ({
  id,
  content,
  username,
  created_at,
  likesCount: initialLikesCount,
  media_url,
  media_type,
  currentUser,
  authToken,
  onPostUpdate,
  onPostDelete,
}) => {
  useEffect(() => {
  
  }, [onPostUpdate]);
  
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [pictures, setpictures] = useState<ProfileData | null>(null)
  const [isLiked, setIsLiked] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(initialLikesCount || 0);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  useEffect(() => {
    checkIfLiked();
    loadComments()
    fetchData()
   
  }, [newComment,isLiked]);


  const fetchData = async () => {
    try {
      const profile = await getPosts(authToken);
      
      // Creamos un mapa de imagenes de perfil por username
      const profilePicturesMap = profile.reduce((acc, item) => {
        if (item.username && item.profile_picture) {
          acc[item.username] = `http://localhost:5000${item.profile_picture}`;
        }
        return acc;
      }, {});
  
      setpictures(profilePicturesMap); // Guardamos el mapa en el estado
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };


  const checkIfLiked = async () => {
    try {
      const response = await fetch(`http://localhost:5000/posts/${id}/likes`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      if (response.ok) {
        const { isLikedByUser,likes } = await response.json();
        
        setLocalLikesCount(likes)
        setIsLiked(isLikedByUser);
      }
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };



  const handleUpdatePost = async () => {
    const formData = new FormData();
    formData.append('content', editedContent);
  
    if (selectedMedia) {
      formData.append('media', selectedMedia);
    }
  
    try {
      const response = await fetch(`http://localhost:5000/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Failed to update post');
      }
  
      // Imprimir la respuesta completa del servidor para verificar qué se está devolviendo
      const updatedPost = await response.json();
      console.log('Updated post from server:', updatedPost);  // Imprimir los datos del post actualizado
  
      onPostUpdate(id, updatedPost.content);  // Actualizar el frontend
  
      setIsEditing(false);
      setSelectedMedia(null);
      setMediaPreview(null);
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };
  
  
  

  const handleDeleteComment = async (commentId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        setComments(comments.filter(comment => comment.id !== commentId));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
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
        setComments([comment,...comments]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleUpdateComment = async (commentId: number, newContent: string) => {
    try {
      const response = await fetch(`http://localhost:5000/comments/${commentId}`, {
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

      setComments(
        comments.map((comment) =>
          comment.id === commentId ? { ...comment, content: newContent } : comment
        )
      );
    } catch (error) {
      console.error('Error updating comment:', error);
    }
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

  const getUserProfilePicture = (userUsername: string) => {
    // Si pictures tiene una imagen para ese username, retorna esa URL completa
    if (pictures && pictures[userUsername]) {
      return pictures[userUsername]; // Regresa la URL completa
    }
  
    // Si no tiene una imagen, usa un avatar predeterminado
    return `https://api.dicebear.com/6.x/initials/svg?seed=${userUsername}`;
  };

  
  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      setIsDeleting(true);
      const response = await fetch(`http://localhost:5000/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        onPostDelete?.(id);
        window.location.reload();
      } else {
        throw new Error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedMedia(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
   <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <img
            src={getUserProfilePicture(username)}
            alt={username}
            className="w-10 h-10 rounded-full mr-3 object-cover"
          />
          <div>
            <div className="font-semibold">{username}</div>
            <div className="text-gray-500 text-sm">
              {formatRelativeTime(created_at)}
            </div>
          </div>
        </div>
        {currentUser?.username === username && (
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-500 hover:text-blue-500 rounded-full hover:bg-gray-100"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleDeletePost}
              disabled={isDeleting}
              className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          
          {(media_url || mediaPreview) && (
            <div className="relative">
              {media_type === 'image' || (selectedMedia?.type.startsWith('image/')) ? (
                <img
                  src={mediaPreview || `http://localhost:5000${media_url}`}
                  alt="Media preview"
                  className="max-h-64 rounded-lg w-full object-cover"
                />
              ) : (
                <video
                  src={mediaPreview || `http://localhost:5000${media_url}`}
                  className="max-h-64 rounded-lg w-full"
                  controls
                />
              )}
              <button
               onClick={() => {
                setSelectedMedia(null); // Eliminar archivo seleccionado
                setMediaPreview(null);  // Eliminar vista previa local
                 // Eliminar media desde el servidor (estado)
                              }}
                className="absolute top-2 right-2 p-1 bg-gray-800 bg-opacity-50 rounded-full text-white hover:bg-opacity-70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex justify-between items-center">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaChange}
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <div className="space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-full"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePost}
                className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <p className="mb-4">{content}</p>
          {media_url && (
            <div className="mb-4">
              {media_type === 'image' ? (
                <img
                  src={`http://localhost:5000${media_url}`}
                  alt="Post media"
                  className="rounded-lg max-h-96 w-full object-cover"
                />
              ) : (
                <video
                  src={`http://localhost:5000${media_url}`}
                  className="rounded-lg max-h-96 w-full"
                  controls
                />
              )}
            </div>
          )}
        </>
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
        <div className="mt-4 pl-4 border-l-2 border-gray-100">
          <form onSubmit={handleAddComment} className="flex space-x-2 mb-4">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 text-sm"
              disabled={!newComment.trim()}
            >
              Comment
            </button>
          </form>

          <div className="space-y-3">
            {comments.map((comment) => (
              <Comment
                key={comment.id}
                {...comment}
                currentUser={currentUser}
                authToken={authToken}
                onCommentUpdate={handleUpdateComment}
                onCommentDelete={handleDeleteComment}
                postId={id}  
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default Post;