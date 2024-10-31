import React, { useState } from 'react'
import { Send } from 'lucide-react'

const initialConversations = [
  { id: 1, user: 'John Doe', lastMessage: 'Hey, how are you?', time: '10:30 AM' },
  { id: 2, user: 'Jane Smith', lastMessage: 'Did you see the latest tweet?', time: 'Yesterday' },
  { id: 3, user: 'Bob Johnson', lastMessage: 'Let\'s catch up soon!', time: '2 days ago' },
]

const Messages = ({ currentUser }) => {
  const [conversations, setConversations] = useState(initialConversations)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [newMessage, setNewMessage] = useState('')

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (newMessage.trim() && selectedConversation) {
      // In a real app, you would send this message to a backend
      console.log('Sending message:', newMessage)
      setNewMessage('')
    }
  }

  return (
    <div className="flex h-[calc(100vh-120px)]">
      <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`p-4 hover:bg-gray-50 cursor-pointer ${
              selectedConversation === conversation.id ? 'bg-gray-100' : ''
            }`}
            onClick={() => setSelectedConversation(conversation.id)}
          >
            <div className="flex items-center">
              <img
                src={`https://api.dicebear.com/6.x/initials/svg?seed=${conversation.user}`}
                alt={conversation.user}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <h3 className="font-bold">{conversation.user}</h3>
                <p className="text-gray-500 text-sm">{conversation.lastMessage}</p>
              </div>
            </div>
            <p className="text-gray-400 text-xs mt-1">{conversation.time}</p>
          </div>
        ))}
      </div>
      <div className="w-2/3 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="flex-grow p-4 overflow-y-auto">
              {/* Messages would be displayed here */}
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
              <div className="flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Start a new message"
                  className="flex-grow p-2 border border-gray-300 rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white p-2 rounded-r-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  )
}

export default Messages