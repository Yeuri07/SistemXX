import { useState } from "react"

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
  export default TweetForm