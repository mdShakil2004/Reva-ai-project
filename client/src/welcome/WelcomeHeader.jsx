import React, { useContext, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faSignInAlt, faSignOutAlt, faListCheck, faTimes, faRocket, faUser, faNewspaper, faServer } from '@fortawesome/free-solid-svg-icons';
import LoginModal from '../components/LoginModal';
import { SearchContext } from '../context/SearchContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const WelcomeHeader = ({ darkMode, setDarkMode }) => {
  const { token, setToken, showLoginModal, setShowLoginModal, isAuthenticated, setIsAuthenticated, userLoginData } = useContext(SearchContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const user = isAuthenticated ? { name: userLoginData.data.username, email: userLoginData.data.email } : null;

  const handleLogin = () => {
    setShowLoginModal(true);
    setIsSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8000/auth/logout');
      localStorage.removeItem('token');
      setToken('');
      setIsAuthenticated(false);
      setIsSidebarOpen(false);
    } catch (error) {
      console.error('Logout failed:', error.response?.data || error.message);
    }
  };

  const handleUpgradeClick = () => {
    navigate('/upgrade');
    setIsSidebarOpen(false);
  };

  const handleApiClick = () => {
    alert("coming soon! As of now press on try reva below to get started.");
   
    setIsSidebarOpen(false);
  };

  const handleNewsClick = () => {
    alert("coming soon! As of now press on try reva below to get started.");
    setIsSidebarOpen(false);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 px-4 sm:px-6 py-4 flex items-center justify-between border-b z-50 ${darkMode ? 'bg-[#121212] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center space-x-2">
          <i className="fa-solid fa-bolt text-blue-400 text-2xl"></i>
          <h1 className="text-xl font-bold">Reva AI</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center space-x-4">
            <button
              onClick={handleApiClick}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors whitespace-nowrap ${darkMode ? 'bg-[#1E1E1E] hover:bg-[#252525] text-white' : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-200'}`}
            >
              <FontAwesomeIcon icon={faServer} />
              <span>API</span>
            </button>
            <button
              onClick={handleNewsClick}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors whitespace-nowrap ${darkMode ? 'bg-[#1E1E1E] hover:bg-[#252525] text-white' : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-200'}`}
            >
              <FontAwesomeIcon icon={faNewspaper} />
              <span>News</span>
            </button>
            <button
              onClick={handleUpgradeClick}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors whitespace-nowrap ${darkMode ? 'bg-[#1E1E1E] hover:bg-[#252525] text-white' : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-200'}`}
            >
              <FontAwesomeIcon icon={faRocket} />
              <span>Upgrade</span>
            </button>

            {/* Sidebar toggle button */}
            <div className="relative group">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-full cursor-pointer"
              >
                <FontAwesomeIcon
                  icon={faListCheck}
                  className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}
                />
              </button>
            </div>
          </div>

          {/* Mobile Menu Icon */}
          <div className="sm:hidden relative group">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-full cursor-pointer"
            >
              <FontAwesomeIcon
                icon={faListCheck}
                className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-[9999] w-64 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } ${darkMode ? 'bg-[#121212] border-l border-gray-800' : 'bg-gray-50 border-l border-gray-200'}`}
      >
        <div className="p-4 h-full flex flex-col">
          {/* Close Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={toggleSidebar}
              className={`p-2 rounded-full ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FontAwesomeIcon icon={faTimes} className="text-lg" />
            </button>
          </div>
          <div className="flex flex-col space-y-2 flex-grow">
            <button
              onClick={handleApiClick}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${darkMode ? 'bg-[#1E1E1E] hover:bg-[#252525] text-white' : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-200'}`}
            >
              <FontAwesomeIcon icon={faServer} />
              <span>API</span>
            </button>
            <button
              onClick={handleNewsClick}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${darkMode ? 'bg-[#1E1E1E] hover:bg-[#252525] text-white' : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-200'}`}
            >
              <FontAwesomeIcon icon={faNewspaper} />
              <span>News</span>
            </button>
            <button
              onClick={handleUpgradeClick}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${darkMode ? 'bg-[#1E1E1E] hover:bg-[#252525] text-white' : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-200'}`}
            >
              <FontAwesomeIcon icon={faRocket} />
              <span>Upgrade</span>
            </button>

            {token ? (
              <button
                onClick={handleLogout}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${darkMode ? 'bg-[#1E1E1E] hover:bg-[#252525] text-white' : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-200'}`}
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span>Logout</span>
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${darkMode ? 'bg-[#1E1E1E] hover:bg-[#252525] text-white' : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-200'}`}
              >
                <FontAwesomeIcon icon={faSignInAlt} />
                <span>Login</span>
              </button>
            )}

            <button
              onClick={() => {
                setDarkMode(!darkMode);
                setIsSidebarOpen(false);
              }}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${darkMode ? 'bg-[#1E1E1E] hover:bg-[#252525] text-white' : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-200'}`}
            >
              <FontAwesomeIcon icon={darkMode ? faSun : faMoon} className={`text-lg ${darkMode ? 'text-yellow-400' : 'text-blue-600'}`} />
              <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>

          {/* User Profile */}
          <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-[#1E1E1E]' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} className="text-blue-500 text-lg" />
              </div>
              {user ? (
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{user.name}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{user.email}</p>
                </div>
              ) : (
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Guest</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Please log in</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showLoginModal && (
        <LoginModal
          onClose={handleCloseModal}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
};

export default WelcomeHeader;
