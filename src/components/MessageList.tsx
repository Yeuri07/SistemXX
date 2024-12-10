import React, { useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Message } from '../services/api';
import { useUser } from '../context/UserContext';

interface MessageListProps {
  messages: Message[];
  currentUserId: number;
  currentUser: any;
  selectedUser: any;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  currentUser,
  selectedUser
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { profilePicture } = useUser();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getUserProfilePicture = (isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return profilePicture
        ? `http://localhost:5000${profilePicture}`
        : `https://api.dicebear.com/6.x/initials/svg?seed=${currentUser.username}`;
    }
    return selectedUser.profile_picture
      ? `http://localhost:5000${selectedUser.profile_picture}`
      : `https://api.dicebear.com/6.x/initials/svg?seed=${selectedUser.username}`;
  };

  return (
    <div className="flex-grow p-4 overflow-y-auto space-y-4">
      {messages.map((message) => {
        const isCurrentUser = message.sender_id === currentUserId;

        return (
          <>
            <p
                  className='text-xs mt-1 flex justify-center text-gray-500' >
                  {formatDistanceToNow(new Date(message.created_at), {
                    addSuffix: true,
                  })}
                </p>
          <div
            key={message.id}
            className={`flex ${isCurrentUser ? 'justify-start' : 'justify-end'}`}
          >
            <div className="flex items-end space-x-2">
              {!isCurrentUser && (
                <img
                  src={getUserProfilePicture(false)}
                  alt={selectedUser.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <div
                className={`max-w-[70%] rounded-lg p-2 ${
                  isCurrentUser
                    ? 'bg-gray-200 text-gray-800'  // Azul para los mensajes enviados
                    : 'bg-blue-500 text-white'  // Gris para los mensajes recibidos
                }`}
              >
                <p className="break-words">{message.content}</p>
              
              </div>
              {isCurrentUser && (
                <img
                  src={getUserProfilePicture(true)}
                  alt={currentUser.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
            </div>
          </div>
          </>

        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
