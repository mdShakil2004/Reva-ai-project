import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faCommentDots, faTrashAlt, faSearch } from '@fortawesome/free-solid-svg-icons';

const ChatHistory = ({ showChatHistory, setShowChatHistory, chatHistory, currentChatId, loadChat, deleteChat, darkMode }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort chat history based on search query and recency
  const filteredChats = chatHistory
    .filter(chat => chat.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b.id.localeCompare(a.id)); // Sort by ID (timestamp-based) in descending order

  return (
    showChatHistory && (
      <div className={`fixed inset-0 z-50 flex`} onClick={() => setShowChatHistory(false)}>
        <div 
          className={`w-80 h-full overflow-y-auto ${darkMode ? 'bg-[#1A1A1A]' : 'bg-white'} shadow-xl transition-transform duration-300 transform translate-x-0 no-scrollbar`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold">Chat History</h2>
            {/* Search Bar */}
            <div className="relative mt-3">
              <FontAwesomeIcon
                icon={faSearch}
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className={`w-full pl-10 pr-4 py-2 rounded-lg outline-none border ${darkMode ? 'bg-[#252525] text-white border-gray-600 placeholder-gray-500' : 'bg-white text-gray-800 border-gray-300 placeholder-gray-400'} focus:border-blue-500`}
              />
            </div>
          </div>
          <div className="p-2">
            {filteredChats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FontAwesomeIcon icon={faHistory} className="text-3xl mb-2" />
                <p>{searchQuery ? 'No chats found' : 'No chat history yet'}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredChats.map((chat) => (
                  <div 
                    key={chat.id}
                    onClick={() => loadChat(chat.id)}
                    className={`p-3 rounded-lg cursor-pointer flex justify-between items-center group ${
                      currentChatId === chat.id 
                        ? 'bg-blue-600 text-white' 
                        : darkMode 
                          ? 'hover:bg-[#252525]' 
                          : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <FontAwesomeIcon icon={faCommentDots} />
                      <span className="truncate">{chat.title || 'Untitled Chat'}</span>
                    </div>
                    <button 
                      onClick={(e) => deleteChat(chat.id, e)}
                      className={`opacity-0 group-hover:opacity-100 p-1 rounded-full transition-opacity ${
                        currentChatId === chat.id 
                          ? 'hover:bg-blue-700 text-white' 
                          : darkMode 
                            ? 'hover:bg-gray-700 text-gray-300' 
                            : 'hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 bg-black bg-opacity-50"></div>
      </div>
    )
  );
};

export default ChatHistory;