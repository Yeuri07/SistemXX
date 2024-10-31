import React, { useState } from 'react'
import { Heart, MessageCircle, Repeat2, Share } from 'lucide-react'

const initialTweets = [
  { id: 1, author: 'John Doe', username: 'johndoe', content: 'Just had an amazing coffee! ☕️ #MorningVibes', likes: 15, retweets: 5, replies: 3, timestamp: '2h' },
  { id: 2, author: 'Jane Smith', username: 'janesmith', content: 'Excited for the weekend! Any plans? 🎉', likes: 20, retweets: 8, replies: 7, timestamp: '4h' },
]

const TweetForm = ({ onTweet }) => {
  const [content, setContent] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (content.trim()) {
      onTweet(content)
      setContent('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <textarea
        className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows="3"
        placeholder="What's happening?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      ></textarea>
      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Tweet
      </button>
    </form>
  )
}

const Tweet = ({ tweet }) => {
  return (
    <div className="border-b border-gray-200 p-4 hover:bg-gray-50">
      <div className="flex items-center mb-2">
        <img
          src={`https://api.dicebear.com/6.x/initials/svg?seed=${tweet.author}`}
          alt={tweet.author}
          className="w-10 h-10 rounded-full mr-3"
        />
        <div>
          <h3 className="font-bold">{tweet.author}</h3>
          <p className="text-gray-500">@{tweet.username}</p>
        </div>
        <span className="ml-auto text-gray-500">{tweet.timestamp}</span>
      </div>
      <p className="mb-2">{tweet.content}</p>
      <div className="flex justify-between text-gray-500">
        <button className="flex items-center hover:text-blue-500">
          <MessageCircle className="w-4 h-4 mr-1" />
          {tweet.replies}
        </button>
        <button className="flex items-center hover:text-green-500">
          <Repeat2 className="w-4 h-4 mr-1" />
          {tweet.retweets}
        </button>
        <button className="flex items-center hover:text-red-500">
          <Heart className="w-4 h-4 mr-1" />
          {tweet.likes}
        </button>
        <button className="flex items-center hover:text-blue-500">
          <Share className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

const Feed = ({ currentUser }) => {
  const [tweets, setTweets] = useState(initialTweets)

  const handleNewTweet = (content) => {
    const newTweet = {
      id: tweets.length + 1,
      author: currentUser.username,
      username: currentUser.username.toLowerCase(),
      content,
      likes: 0,
      retweets: 0,
      replies: 0,
      timestamp: 'now'
    }
    setTweets([newTweet, ...tweets])
  }

  return (
    <div>
      <TweetForm onTweet={handleNewTweet} />
      {tweets.map((tweet) => (
        <Tweet key={tweet.id} tweet={tweet} />
      ))}
    </div>
  )
}

export default Feed