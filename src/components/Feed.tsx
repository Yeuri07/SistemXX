import React, { useState, useEffect,useRef,useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, Repeat2, Share, Image, Film } from 'lucide-react'
import { createPost, getPosts, likePost, unlikePost, getPostLikes, createComment, getComments } from '../services/api'

interface Tweet {
  id: number;
  content: string;
  media_url?: string;
  media_type?: 'image' | 'video';
  created_at: string;
  username: string;
}

interface Comment {
  id: number;
  content: string;
  username: string;
  created_at: string;
}

interface TweetFormProps {
  onTweet: () => void;
  currentUser: any;
  authToken: string;
}

const TweetForm: React.FC<TweetFormProps> = ({ onTweet, currentUser, authToken }) => {
  const [content, setContent] = useState('')
  const [media, setMedia] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        setMedia(file)
        const preview = URL.createObjectURL(file)
        setMediaPreview(preview)
      } else {
        setError('Please upload only image or video files')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!content.trim() && !media) {
      setError('Please enter some content or add media for your post.')
      return
    }

    try {
      const post = await createPost(content, media || undefined, authToken)
      if (post) {
        onTweet()
        setContent('')
        setMedia(null)
        setMediaPreview(null)
      } else {
        setError('Failed to create post. Please try again.')
      }
    } catch (error) {
      console.error('Error creating post:', error)
      setError('An error occurred while creating the post. Please try again.')
    }
  }

  const removeMedia = () => {
    setMedia(null)
    setMediaPreview(null)
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 border border-gray-200 rounded-lg">
      <textarea
        className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
        placeholder="What's happening?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      ></textarea>
      
      {mediaPreview && (
        <div className="relative mt-2">
          {media?.type.startsWith('image/') ? (
            <img src={mediaPreview} alt="Preview" className="max-h-96 rounded-lg" />
          ) : (
            <video src={mediaPreview} className="max-h-96 rounded-lg" controls />
          )}
          <button
            type="button"
            onClick={removeMedia}
            className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
          >
            ×
          </button>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      
      <div className="mt-2 flex justify-between items-center">
        <div className="flex gap-2">
          <label className="cursor-pointer text-blue-500 hover:text-blue-600">
            <Image className="w-5 h-5" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleMediaChange}
              disabled={!!media}
            />
          </label>
          <label className="cursor-pointer text-blue-500 hover:text-blue-600">
            <Film className="w-5 h-5" />
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleMediaChange}
              disabled={!!media}
            />
          </label>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Tweet
        </button>
      </div>
    </form>
  )
}

interface TweetProps {
  tweet: Tweet;
  currentUser: any;
  authToken: string;
}

const Tweet: React.FC<TweetProps> = ({ tweet, currentUser, authToken }) => {
  const [likes, setLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    fetchLikes()
    fetchComments()
     
  }, [tweet.id])
  
  const fetchLikes = async () => {
    try {
      const { likes, isLikedByUser }= await getPostLikes(tweet.id, authToken)
      setLikes(likes); // Actualiza el conteo de likes
      setIsLiked(isLikedByUser); // Establece si el usuario ha dado like o no
    } catch (error) {
      console.error('Error fetching likes:', error)
    }
  }

  const fetchComments = async () => {
    try {
      const fetchedComments = await getComments(tweet.id, authToken)
     
      setComments(fetchedComments || [])
       
    } catch (error) {
      console.error('Error fetching comments:', error)
      setComments([])
    }
  }

  const handleLike = async () => {
    try {
    
        if (isLiked) {
          // Si el usuario ya dio like, eliminarlo
          const success = await unlikePost(tweet.id, authToken);
          if (success) {
            setLikes(likes - 1); // Disminuir el número de likes
            setIsLiked(false); // Establecer el estado como "no le gustó"
          }
        } else {
          // Si el usuario no ha dado like, agregarlo
          const success = await likePost(tweet.id, authToken);
          if (success) {
            setLikes(likes + 1); // Aumentar el número de likes
            setIsLiked(true); // Establecer el estado como "le gustó"
          }
      }
    } catch (error) {
      console.error('Error handling like:', error)
    }
  }



  const handleComment = async () => {
    if (newComment.trim()) {

      try {
        const comment = await createComment(tweet.id, newComment, authToken)

        if (comment) {

          setNewComment('')
          
          setComments([comment, ...comments])
       
        }
      } catch (error) {
        console.error('Error creating comment:', error)
      }
    }
  }
  
  return (
    <div className="border-b border-gray-200 p-4">
      <div className="flex items-center mb-2">
        <Link to={`/profile/${tweet.username}`} className="flex items-center"> 
          <img
              src={`https://api.dicebear.com/6.x/initials/svg?seed=${tweet.username}`}
            alt={tweet.username}
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <h3 className="font-bold hover:underline">{tweet.username}</h3>
            <p className="text-gray-500 text-sm">{new Date(tweet.created_at).toLocaleString()}</p>
          </div>
        </Link>
      </div>
      <p className="mb-2">{tweet.content}</p>
      
      {tweet.media_url && (
        <div className="mb-2">
          {tweet.media_type === 'image' ? (
            <img 
              src={`http://localhost:5000${tweet.media_url}`} 
              alt="Post media" 
              className="rounded-lg max-h-96 w-full object-cover" 
            />
          ) : (
            <video 
              src={`http://localhost:5000${tweet.media_url}`} 
              className="rounded-lg max-h-96 w-full" 
              controls
              muted autoPlay loop 
            />
          )}
        </div>
      )}

      <div className="flex justify-between text-gray-500">
        <button onClick={handleLike} className={`flex items-center ${isLiked ? 'text-red-500' : ''}`}>
          <Heart className="w-5 h-5 mr-1" />
          <span>{likes}</span>
        </button>
        <button onClick={() => setShowComments(!showComments)} className="flex items-center">
          <MessageCircle className="w-5 h-5 mr-1" />
          <span>{comments.length}</span>
        </button>
        <button className="flex items-center">
          <Repeat2 className="w-5 h-5 mr-1" />
        </button>
        <button className="flex items-center">
          <Share className="w-5 h-5 mr-1" />
        </button>
      </div>

      {showComments &&  (
        
        <div className="mt-4">
          <div className="flex mt-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleComment}
              className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Comment
            </button>
            
          </div>
        
          {
          comments.map((comment) =>{
           
            return (
            
              <div key={comment.id} className="mb-2 p-3 bg-gray-50 rounded-lg">
                <Link to={`/profile/${comment.username}`} className="flex items-center mb-1">
                  <img
                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${comment.username}`}
                    alt={comment.username}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                  <p className="font-bold text-sm hover:underline">{comment.username}</p>
                  <span className="text-gray-500 text-xs ml-2">
                  {new Date(comment.created_at).toLocaleString()}
                  </span>
                </Link>
                <p className="text-sm">{comment.content}</p>
              </div>
            )
          } )
            
          }
        </div>
      )}
      
    </div>
  )
}

interface FeedProps {
  currentUser: any;
  authToken: string;
}

const Feed: React.FC<FeedProps> = ({ currentUser, authToken }) => {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  
  const observer = useRef<IntersectionObserver>()
  const lastTweetElementRef = useCallback(node => {
    if (loading) return
    
    if (observer.current) observer.current.disconnect()
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1)
      }
    })
    
    if (node) observer.current.observe(node)
  }, [loading, hasMore])

  const fetchTweets = async (pageNumber: number) => {
    try {
      setLoading(true)
      const fetchedTweets = await getPosts(authToken, pageNumber)
      if (fetchedTweets.length === 0) {
        setHasMore(false)
      } else {
        setTweets(prev => [...prev, ...fetchedTweets])
      }
    } catch (error) {
      console.error('Error fetching tweets:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTweets(page)
  }, [page, authToken])

  const handleNewTweet = async () => {
    setPage(1)
    setTweets([])
    setHasMore(true)
    await fetchTweets(1)
  }

  return (
    <div className="h-screen overflow-y-auto">
      
      <TweetForm onTweet={handleNewTweet} currentUser={currentUser} authToken={authToken} />
      
      {tweets.map((tweet, index) => {
        const key = `${tweet.id}-${index}`
        if (tweets.length === index + 1) {
          return (
            <div ref={lastTweetElementRef} key={key}>
              <Tweet tweet={tweet} currentUser={currentUser} authToken={authToken} />
            </div>
          )
        } else {
          return (
            <Tweet key={key} tweet={tweet} currentUser={currentUser} authToken={authToken} />
          )
        }
      })}
      {loading && (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      {!hasMore && tweets.length > 0 && (
        <p className="text-center text-gray-500 p-4">No more tweets to load</p>
      )}
    </div>
  )
}

export default Feed