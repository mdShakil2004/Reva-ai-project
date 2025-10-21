import React from 'react';
import { FaArrowUp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const WelcomeInput = ({ inputValue, setInputValue, darkMode }) => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      // Handle the submit action
      console.log("Submitted:", inputValue);
      navigate('/chat');
      
    }
  };
  
  
  return (
    <form onSubmit={handleSubmit} className="mb-6 w-full sticky top-[4.5rem] z-40">
      <div
        className={`flex flex-col rounded-lg transition-all duration-400 ${
          darkMode
            ? 'bg-gray-900/50 backdrop-blur-md border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
            : 'bg-white/70 backdrop-blur-md border border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.2)]'
        } p-3`}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask Reva anything..."
          className={`w-full px-3 py-3 rounded-lg outline-none border-none text-base font-medium ${
            darkMode
              ? 'bg-transparent text-cyan-200 placeholder-cyan-400/60'
              : 'bg-transparent text-gray-900 placeholder-pink-400/60'
          } placeholder:text-base focus:ring-2 focus:ring-cyan-400/50 transition-all`}
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            className={`p-2 rounded-lg flex items-center justify-center w-10 h-10 
              bg-gradient-to-r from-cyan-500 to-pink-500 
              hover:from-cyan-600 hover:to-pink-600 
              text-white transition-all duration-400 transform hover:shadow-[0_0_15px_rgba(34,211,238,0.7)] hover:scale-110 
              cursor-pointer ${!inputValue.trim() ? 'opacity-50 cursor-not-allowed scale-100 hover:scale-100' : ''}`}
            disabled={!inputValue.trim()}
          >
            <FaArrowUp className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </form>
  );
};

export default WelcomeInput;