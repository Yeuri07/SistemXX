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
  console.log(selectedConversation?.user.id)
  useEffect(() => {
    loadConversations();
  }, [authToken]);

  useEffect(() => {
    if (selectedConversation) {
    
      loadMessages(selectedConversation?.user.id);
    }
  }, [selectedConversation, authToken]);

  const loadConversations = async () => {
    const fetchedConversations = await getConversations(authToken);
    setConversations(fetchedConversations);
  };

  const loadMessages = async (userId: number) => {
    const fetchedMessages = await getMessages(authToken, userId);
    setMessages(fetchedMessages);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const sentMessage = await sendMessage(
      authToken,
      selectedConversation.user.id,
      newMessage
    );

    if (sentMessage) {
      setMessages([...messages, sentMessage]);
      setNewMessage('');
      loadConversations(); // Refresh conversations to update last message
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
        id: Date.now(), // Temporary ID
        user,
        lastMessage: null,
      };
      setConversations([newConv, ...conversations]);
      setSelectedConversation(newConv);
    }
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
        />
      </div>

      <div className="flex-1 flex flex-col">
      
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center">
              <img
                src={`https://api.dicebear.com/6.x/initials/svg?seed=${selectedConversation.user.username}`}
                alt={selectedConversation.user.username}
                className="w-10 h-10 rounded-full mr-3"
              />
              <h3 className="font-bold">{selectedConversation.user.username}</h3>
            </div>
            

            <MessageList messages={messages} currentUserId={currentUser.id} />

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
                  className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
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
      />
    </div>
  );
};

export default Messages;