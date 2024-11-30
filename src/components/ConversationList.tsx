import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Conversation } from '../services/api';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
}) => {
  return (
    <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className={`p-4 hover:bg-gray-50 cursor-pointer ${
            selectedConversation?.id === conversation.id ? 'bg-gray-100' : ''
          }`}
          onClick={() => onSelectConversation(conversation)}
        >
          <div className="flex items-center">
            <img
              src={`https://api.dicebear.com/6.x/initials/svg?seed=${conversation.user.username}`}
              alt={conversation.user.username}
              className="w-10 h-10 rounded-full mr-3"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold truncate">{conversation.user.username}</h3>
              {conversation.lastMessage && (
                <p className="text-gray-500 text-sm truncate">
                  {conversation.lastMessage.content}
                </p>
              )}
            </div>
          </div>
          {conversation.lastMessage && (
            <p className="text-gray-400 text-xs mt-1">
              {formatDistanceToNow(new Date(conversation.lastMessage.created_at), {
                addSuffix: true,
              })}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ConversationList;