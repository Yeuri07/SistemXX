import { Heart, MessageCircle, Repeat2, Share } from 'lucide-react'

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
  export default Tweet