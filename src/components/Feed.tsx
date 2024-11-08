import React, { useEffect, useState } from 'react'
import { Heart, MessageCircle, Repeat2, Share } from 'lucide-react'
import { createPost, getPosts } from '../services/api'

// const initialTweets = [
//   { id: 1, author: 'John Doe', username: 'johndoe', content: 'Just had an amazing coffee! ☕️ #MorningVibes', likes: 15, retweets: 5, replies: 3, timestamp: '2h' },
//   { id: 2, author: 'Jane Smith', username: 'janesmith', content: 'Excited for the weekend! Any plans? 🎉', likes: 20, retweets: 8, replies: 7, timestamp: '4h' },
// ]

// const TweetForm = ({ onTweet }) => {
//   const [content, setContent] = useState('')

//   const handleSubmit = (e) => {
//     e.preventDefault()
//     if (content.trim()) {
//       onTweet(content)
//       setContent('')
//     }
//   }

interface Tweet {
  id: number;
  content: string;
  created_at: string;
  username: string;
}

interface TweetFormProps {
  onTweet: () => void;
  currentUser: any;
  authToken: string;
}

const TweetForm: React.FC<TweetFormProps> = ({ onTweet, currentUser, authToken }) => {
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!content.trim()) {
 
      setError('Please enter some content for your post.')
      return
    }

    try {
      const post = await createPost(content, authToken)
      if (post) {
        onTweet()
        setContent('')
      } else {
        setError('Failed to create post. Please try again.')
      }
    } catch (error) {
      console.error('Error creating post:', error)
      setError('An error occurred while creating the post. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <textarea
        className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
        placeholder="What's happening?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      ></textarea>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Tweet
      </button>
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
  const [comments, setComments] = useState([])
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')

  // useEffect(() => {
  //   fetchLikes()
  //   fetchComments()
  // }, [])

  // const fetchLikes = async () => {
  //   const likesCount = await getPostLikes(tweet.id, authToken)
  //   setLikes(likesCount)
  // }

  // const fetchComments = async () => {
  //   const fetchedComments = await getComments(tweet.id, authToken)
  //   setComments(fetchedComments)
  // }

  // const handleLike = async () => {
  //   if (isLiked) {
  //     const success = await unlikePost(tweet.id, authToken)
  //     if (success) {
  //       setLikes(likes - 1)
  //       setIsLiked(false)
  //     }
  //   } else {
  //     const success = await likePost(tweet.id, authToken)
  //     if (success) {
  //       setLikes(likes + 1)
  //       setIsLiked(true)
  //     }
  //   }
  // }

  // const handleComment = async () => {
  //   if (newComment.trim()) {
  //     const success = await createComment(tweet.id, newComment, authToken)
  //     if (success) {
  //       setNewComment('')
  //       fetchComments()
  //     }
  //   }
  // }

  return (
    <div className="border-b border-gray-200 p-4">
      <div className="flex items-center mb-2">
        <img
          src={`https://api.dicebear.com/6.x/initials/svg?seed=${tweet.username}`}
          alt={tweet.username}
          className="w-10 h-10 rounded-full mr-3"
        />
        <div>
          <h3 className="font-bold">{tweet.username}</h3>
          <p className="text-gray-500 text-sm">{new Date(tweet.created_at).toLocaleString()}</p>
        </div>
      </div>
      <p className="mb-2">{tweet.content}</p>
      <div className="flex justify-between text-gray-500">
        <button className={`flex items-center ${isLiked ? 'text-red-500' : ''}`}>
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
      {showComments && (
        <div className="mt-4">
          {comments.map((comment: any) => (
            <div key={comment.id} className="mb-2">
              <p className="font-bold">{comment.username}</p>
              <p>{comment.content}</p>
            </div>
          ))}
          <div className="flex mt-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              
              className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Comment
            </button>
          </div>
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
  
  const fetchTweets = async () => {
    const fetchedTweets = await getPosts(authToken)
    setTweets(fetchedTweets)
  }

  useEffect(() => {
    fetchTweets()
  }, [authToken])

  const handleNewTweet = () => {
    fetchTweets()
  }

  return (
    <div>
      <TweetForm onTweet={handleNewTweet} currentUser={currentUser} authToken={authToken} />
      {tweets.map((tweet) => (
        <Tweet key={tweet.id} tweet={tweet} currentUser={currentUser} authToken={authToken} />
      ))}
    </div>
  )
}

export default Feed