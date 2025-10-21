import React, { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory } from '@fortawesome/free-solid-svg-icons';
import { SearchContext } from '../context/SearchContext';

const RecentConversation = ({ chatHistory, loadChat, setShowChatHistory, darkMode }) => {
  const sortedChats = chatHistory.sort((a, b) => b.id.localeCompare(a.id));
  const { isAuthenticated, setShowLoginModal } = useContext(SearchContext);

  if (chatHistory.length === 0) return null;
 
  return (
    <div className="flex flex-col ml-14 pl-24 items-center justify-center  max-w-2xl text-center">
      <h3 className="text-lg font-medium mb-3 text-center">Recent Conversations</h3>
      <div className=" grid grid-cols-1 gap-2 items-center justify-center w-full">
        {sortedChats.slice(0, 3).map((chat) => (
          <div 
            key={chat.id}
            onClick={() => loadChat(chat.id)}
            className={`p-3 rounded-xl cursor-pointer transition-all flex items-center space-x-3 ${
              darkMode
                ? 'bg-[#1E1E1E] hover:bg-[#252525]'
                : 'bg-white hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <FontAwesomeIcon icon={faHistory} className="text-blue-500" />
            <span className="truncate text-left">{chat.title || 'Untitled Chat'}</span>
          </div>
        ))}
        {chatHistory.length > 3 && (
          <button 
            onClick={() => isAuthenticated ? setShowChatHistory(true) : setShowLoginModal(true)}
            className={`p-3 rounded-xl cursor-pointer transition-all text-center ${
              darkMode
                ? 'bg-[#1E1E1E] hover:bg-[#252525] text-blue-400'
                : 'bg-white hover:bg-gray-50 border border-gray-200 text-blue-600'
            }`}
          >
            View all conversations
          </button>
        )}
      </div>
    </div>
  );
};

export default RecentConversation;
