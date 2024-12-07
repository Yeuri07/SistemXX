import React, { useState, useEffect} from 'react'
import { Image, Video } from 'lucide-react'
import Post from './Post';
import { useUser } from '../context/UserContext';

interface FeedProps {
  currentUser: any;
  authToken: string;
}

const Feed: React.FC<FeedProps> = ({ currentUser, authToken }) => {
  const [posts, setPosts] = useState<any[]>([]); // Asumimos que los posts son objetos con más propiedades
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const { profilePicture } = useUser();

  useEffect(() => {
    if (authToken) {
      fetchPosts();
    }
  }, [authToken]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/posts', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      setPosts(data);
     
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedMedia(file);
      setMediaType(type);

      if (type === 'image') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else if (type === 'video') {
        const videoUrl = URL.createObjectURL(file);
        setMediaPreview(videoUrl);
      }
    }
  };

  const getUserProfilePicture = () => {
    return profilePicture 
      ? `http://localhost:5000${profilePicture}`
      : `https://api.dicebear.com/6.x/initials/svg?seed=${currentUser.username}`;
  };

  const clearSelectedMedia = () => {
    setSelectedMedia(null);
    setMediaPreview(null);
    setMediaType(null);
    if (mediaPreview && mediaType === 'video') {
      URL.revokeObjectURL(mediaPreview);
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() && !setSelectedMedia) return;

    const formData = new FormData();
    formData.append('content', newPost);
    if (selectedMedia) {
      formData.append('media', selectedMedia);
      formData.append('mediaType', mediaType || '');
    }

    try {
      const response = await fetch('http://localhost:5000/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });

      if (response.ok) {
        setNewPost('');
        setSelectedMedia(null);
        setMediaPreview(null);
        setMediaType(null);
        fetchPosts(); // Refetch posts to include the new post
      
      } else {
        throw new Error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handlePostUpdate = async (postId: number, newContent: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, content: newContent } : post
      )
    );
  };

  const handleLikePost = async (postId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/posts/${postId}/likes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, likes: post.likes + 1 } : post
          )
        );
      } else {
        throw new Error('Failed to like the post');
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleCommentPost = async (postId: number, comment: string) => {
    try {
      const response = await fetch(`http://localhost:5000/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment })
      });

      if (response.ok) {
        // Agregar el comentario a la lista de comentarios del post sin tener que recargar todo
        const newComment = await response.json();
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { ...post, comments: [newComment, ...post.comments] }
              : post
          )
        );
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // const getUserProfilePicture = () => {
   
  //   return profilePicture
  //     ? `http://localhost:5000${profilePicture}`
  //     : `https://api.dicebear.com/6.x/initials/svg?seed=${currentUser.username}`;
  // };

  return (
    <div className="max-w-2xl mx-auto p-4">

      <form onSubmit={handleSubmitPost} className="mb-8">
        <div className="flex items-start space-x-4">
          <div className="flex-1">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's happening?"
              className="w-full p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />

            {mediaPreview && (
              <div className="relative mt-2">
                {mediaType === 'image' ? (
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className="max-h-64 rounded-lg w-full object-cover"
                  />
                ) : (
                  <video
                    src={mediaPreview}
                    className="max-h-64 rounded-lg w-full"
                    controls
                  />
                )}
                <button
                  type="button"
                  onClick={clearSelectedMedia}
                  className="absolute top-2 right-2 p-1 bg-gray-800 bg-opacity-50 rounded-full text-white hover:bg-opacity-70"
                >
                  ×
                </button>
              </div>
            )}

              <div className="mt-2 flex justify-between items-center">
              <div className="flex space-x-4">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleMediaChange(e, 'image')}
                    className="hidden"
                  />
                  <Image className="w-6 h-6 text-gray-500 hover:text-blue-500" />
                </label>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleMediaChange(e, 'video')}
                    className="hidden"
                  />
                  <Video className="w-6 h-6 text-gray-500 hover:text-blue-500" />
                </label>
              </div>
              
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                disabled={!newPost.trim() && !selectedMedia}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center p-4">
          
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Post
              key={post.id}
              {...post}
              currentUser={currentUser}
              authToken={authToken}
              onLike={() => handleLikePost(post.id)}
              onComment={(comment) => handleCommentPost(post.id, comment)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;


