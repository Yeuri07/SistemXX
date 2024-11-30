import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Message } from '../services/api';

interface MessageListProps {
  messages: Message[];
  currentUserId: number;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
  return (
    <div className="flex-grow p-4 overflow-y-auto space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[70%] rounded-lg p-3 ${
              message.sender_id === currentUserId
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100'
            }`}
          >
            <p className="break-words">{message.content}</p>
            <p
              className={`text-xs mt-1 ${
                message.sender_id === currentUserId
                  ? 'text-blue-100'
                  : 'text-gray-500'
              }`}
            >
              {formatDistanceToNow(new Date(message.created_at), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;