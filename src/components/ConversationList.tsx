import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Conversation } from '../services/api';
import { useUser } from '../context/UserContext';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  currentUser: any;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  currentUser
}) => {
  const { profilePicture } = useUser();

  const getUserProfilePicture = (user: any) => {
    if (user.username === currentUser.username && profilePicture) {
      return `http://localhost:5000${profilePicture}`;
    }
    return user.profile_picture
      ? `http://localhost:5000${user.profile_picture}`
      : `https://api.dicebear.com/6.x/initials/svg?seed=${user.username}`;
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No conversations yet
        </div>
      ) : (
        conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`p-4 hover:bg-gray-50 cursor-pointer ${
              selectedConversation?.id === conversation.id ? 'bg-gray-100' : ''
            }`}
            onClick={() => onSelectConversation(conversation)}
          >
            <div className="flex items-center">
              <img
                src={getUserProfilePicture(conversation.user)}
                alt={conversation.user.username}
                className="w-12 h-12 rounded-full mr-3 object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900">{conversation.user.username}</h3>
                {conversation.lastMessage && (
                  <p className="text-gray-500 text-sm truncate">
                    {conversation.lastMessage.content}
                  </p>
                )}
                {conversation.lastMessage && (
                  <p className="text-gray-400 text-xs mt-1">
                    {formatDistanceToNow(new Date(conversation.lastMessage.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ConversationList;