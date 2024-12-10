import React, { useState, useEffect } from 'react';
import { Send, PlusCircle } from 'lucide-react';
import {
  User,
  Message,
  Conversation,
  getConversations,
  getMessages,
  sendMessage,
} from '../services/api';
import ConversationList from './ConversationList';
import MessageList from './MessageList';
import NewMessageModal from './NewMessageModal';
import { useUser } from '../context/UserContext';

interface MessagesProps {
  currentUser: {
    id: number;
    username: string;
  };
  authToken: string;
}

const Messages: React.FC<MessagesProps> = ({ currentUser, authToken }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const { profilePicture } = useUser();

  useEffect(() => {
    loadConversations();
    // Set up periodic refresh of conversations
    const intervalId = setInterval(loadConversations, 10000);
    return () => clearInterval(intervalId);
  }, [authToken]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.user.id);
      // Set up periodic refresh of messages
      const intervalId = setInterval(() => loadMessages(selectedConversation.user.id), 5000);
      return () => clearInterval(intervalId);
    }
  }, [selectedConversation, authToken]);

  const loadConversations = async () => {
    try {
      const fetchedConversations = await getConversations(authToken);
      setConversations(fetchedConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (userId: number) => {
    try {
      const fetchedMessages = await getMessages(authToken, userId);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const sentMessage = await sendMessage(
        authToken,
        selectedConversation.user.id,
        newMessage.trim()
      );

      if (sentMessage) {
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
        loadConversations(); // Refresh conversations to update last message
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleNewConversation = async (user: User) => {
    const existingConversation = conversations.find(
      (conv) => conv.user.id === user.id
    );

    if (existingConversation) {
      setSelectedConversation(existingConversation);
    } else {
      const newConv: Conversation = {
        id: Date.now(),
        user,
        lastMessage: null,
      };
      setConversations([newConv, ...conversations]);
      setSelectedConversation(newConv);
    }
    setIsNewMessageModalOpen(false);
  };

  const getUserProfilePicture = (username: string) => {
    if (username === currentUser.username && profilePicture) {

      return `http://localhost:5000${profilePicture}`;
    }
    return `https://api.dicebear.com/6.x/initials/svg?seed=${username}`;
  };

  return (
    
    <div className="flex h-[calc(100vh-64px)]">
      
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold">Messages</h2>
          <button
            onClick={() => setIsNewMessageModalOpen(true)}
            className="text-blue-500 hover:text-blue-600"
          >
            <PlusCircle className="w-6 h-6" />
          </button>
        </div>
        <ConversationList
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
          currentUser={currentUser}
        />
      </div>

      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center">
              <img
                src={getUserProfilePicture(selectedConversation.user.username)}
                alt={selectedConversation.user.username}
                className="w-10 h-10 rounded-full mr-3"
              />
              <h3 className="font-bold">{selectedConversation.user.username}</h3>
            </div>
            
            <MessageList 
              messages={messages} 
              currentUserId={selectedConversation.id} 
              currentUser={currentUser}
              selectedUser={selectedConversation.user}
            />

            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!newMessage.trim()}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation or start a new one
          </div>
        )}
      </div>

      <NewMessageModal
        isOpen={isNewMessageModalOpen}
        onClose={() => setIsNewMessageModalOpen(false)}
        onSelectUser={handleNewConversation}
        authToken={authToken}
        currentUser={currentUser}
      />
    </div>
  );
};

export default Messages;