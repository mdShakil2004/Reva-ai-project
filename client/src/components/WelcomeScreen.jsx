import React, { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faImage, faChartLine, faMicrophone, faVideo, faPaintBrush } from '@fortawesome/free-solid-svg-icons';
import { assets } from '../assets/assets';
import { SearchContext } from '../context/SearchContext';
import { useNavigate } from 'react-router-dom';
import WelcomeInput from '../welcome/WelcomeInput';

const WelcomeScreen = ({ darkMode, inputValue, setInputValue,setShowVoiceInteraction }) => {
  

  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 text-center relative">
      {/* Background Glow */}
     


     {/* Logo */}
<div className="w-24 h-24 mb-8 relative flex items-center justify-center">
  <div
    className={`absolute inset-0  rounded-full ${
      darkMode
        ? 'bg-gradient-to-r from-cyan-600/50 to-pink-600/50'
        : 'bg-gradient-to-r from-cyan-400/50 to-pink-400/50'
    } blur-2xl animate-pulse`}
  ></div>
  <i
    className="fa-solid fa-bolt text-5xl text-cyan-400 relative z-10   border-cyan-400/60 shadow-[0_0_20px_rgba(34,211,238,0.6)] bg-black/40 p-5 rounded-full"
  ></i>
</div>


      {/* Title */}
      <h2
        className={`text-6xl font-black mb-4 tracking-tight ${
          darkMode ? 'text-cyan-300' : 'text-cyan-700'
        } drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]`}
      >
        Reva AI
      </h2>
      <p className={`text-base max-w-sm mb-10 ${darkMode ? 'text-gray-200' : 'text-gray-600'} font-medium`}>
        Unleash creativity and insights with next-gen AI. Start now.
      </p>

      {/* Buttons */}
      <div className="w-full max-w-sm flex flex-col sm:flex-row sm:justify-center gap-4 mb-12">
        <button
          onClick={() => navigate('/chat')}
          className={`relative px-8 py-3 rounded-xl font-semibold text-white transition-all duration-500 hover:shadow-[0_0_25px_rgba(34,211,238,0.8)] hover:scale-110 ${
            darkMode
              ? 'bg-gradient-to-r from-cyan-700 to-pink-700'
              : 'bg-gradient-to-r from-cyan-500 to-pink-500'
          } overflow-hidden group`}
        >
          <span className="relative z-10">Try Reva <i className="fa-solid fa-bolt text-blue-400 text-xl"></i></span>
          <div
            className="absolute inset-0 bg-gradient-to-r from-cyan-800 to-pink-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          ></div>
        </button>
        <button
          onClick={() => navigate('/upgrade')}
          className={`px-8 py-3 rounded-xl font-semibold transition-all duration-500 hover:shadow-[0_0_20px_rgba(236,72,153,0.6)] hover:scale-110 ${
            darkMode
              ? 'bg-gray-900/70 text-gray-200 border border-cyan-500/40 backdrop-blur-sm'
              : 'bg-white/80 text-gray-800 border border-pink-500/40 backdrop-blur-sm'
          }`}
        >
          Help ❓
        </button>
      </div>

      {/* Input Box */}
      <div className="w-full max-w-md mb-10">
        <WelcomeInput darkMode={darkMode} inputValue={inputValue} setInputValue={setInputValue} />
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
        {[
          { icon: faSearch, title: 'Smart Search', desc: 'Instant web answers', action: () => navigate('/chat') },
          { icon: faImage, title: 'Visual Analysis', desc: 'Decode images fast', action: () => navigate('/chat') },
          { icon: faChartLine, title: 'Data Insights', desc: 'Clear trend visuals', action: () => navigate('/chat') },
          { icon: faMicrophone, title: 'Voice Interaction', desc: 'Talk to Reva', action: () => { 
            setShowVoiceInteraction(true);
            navigate('/chat');
            }
             },
          { icon: faVideo, title: 'Text to Video Ads', desc: 'Create ads from text', action: () => alert("coming soon!") },
          { icon: faPaintBrush, title: 'Text to Image', desc: 'Generate images from text', action: () => navigate('/chat') },
        ].map((feature, idx) => (
          <div
            key={idx}
            onClick={feature.action}
            className={`relative p-5 rounded-xl cursor-pointer transition-all duration-400 transform hover:scale-105 hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] ${
              darkMode
                ? 'bg-gray-900/60 border border-cyan-500/30 backdrop-blur-sm'
                : 'bg-white/70 border border-pink-500/30 backdrop-blur-sm'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  darkMode ? 'bg-cyan-500/40' : 'bg-pink-500/40'
                } transition-colors duration-400`}
              >
                <FontAwesomeIcon icon={feature.icon} className="text-cyan-400 text-lg" />
              </div>
              <div>
                <h3
                  className={`font-semibold text-sm ${
                    darkMode ? 'text-cyan-200' : 'text-gray-900'
                  }`}
                >
                  {feature.title}
                </h3>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  {feature.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-16 max-w-4xl text-center">
        <h3
          className={`text-3xl font-bold mb-4 ${
            darkMode ? 'text-cyan-300' : 'text-cyan-700'
          }`}
        >
          Why Choose Reva AI?
        </h3>
        <p
          className={`text-base leading-relaxed mb-8 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          Reva AI is your personal multimodal assistant designed to think, create, 
          and adapt like never before. Whether you need instant search results, 
          visual understanding, creative content generation, or insightful data 
          analysis, Reva AI is built to empower your ideas.
        </p>

        {/* Key Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {[
            {
              title: 'Multimodal Power',
              desc: 'Text, images, voice, and video — seamlessly handled in one place.'
            },
            {
              title: 'Emotion-Aware',
              desc: 'Understands tone, context, and adapts responses with empathy.'
            },
            {
              title: 'Always Evolving',
              desc: 'Learns continuously to bring smarter and more personalized results.'
            },
          ].map((item, i) => (
            <div
              key={i}
              className={`p-5 rounded-xl shadow-md ${
                darkMode
                  ? 'bg-gray-900/70 border border-cyan-500/30'
                  : 'bg-white/80 border border-pink-500/30'
              }`}
            >
              <h4
                className={`font-semibold mb-2 ${
                  darkMode ? 'text-cyan-200' : 'text-gray-900'
                }`}
              >
                {item.title}
              </h4>
              <p
                className={`text-sm ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
            {/* Facilities Section */}
      <div className="mt-20 max-w-6xl text-center">
        <h3
          className={`text-3xl font-bold mb-6 ${
            darkMode ? 'text-cyan-300' : 'text-cyan-700'
          }`}
        >
          Explore Reva AI’s Capabilities
        </h3>
        <p
          className={`text-base leading-relaxed mb-12 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          Reva AI is more than just an assistant — it’s a complete AI engine designed 
          to power your creativity, productivity, and daily life. Here’s what you can do:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {[
            {
              icon: faSearch,
              title: 'Smart Knowledge',
              desc: 'Get instant, verified answers with deep contextual search.'
            },
            {
              icon: faPaintBrush,
              title: 'Creative Generation',
              desc: 'Turn text into stunning images, videos, or even stories.'
            },
            {
              icon: faChartLine,
              title: 'Data Insights',
              desc: 'Generate clear visualizations and analyze complex data.'
            },
            {
              icon: faMicrophone,
              title: 'Voice + Emotion',
              desc: 'Talk naturally with Reva; it adapts to your tone and mood.'
            },
            {
              icon: faVideo,
              title: 'Ad & Content Creator',
              desc: 'Produce professional video ads and content in minutes.'
            },
            {
              icon: faImage,
              title: 'File & Media Understanding',
              desc: 'Summarize, analyze, and understand documents and images.'
            },
          ].map((facility, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-xl shadow-md transition-transform transform hover:scale-105 ${
                darkMode
                  ? 'bg-gray-900/70 border border-cyan-500/30'
                  : 'bg-white/80 border border-pink-500/30'
              }`}
            >
              <div className="flex items-center mb-4 space-x-3">
                <FontAwesomeIcon
                  icon={facility.icon}
                  className="text-cyan-400 text-xl"
                />
                <h4
                  className={`font-semibold ${
                    darkMode ? 'text-cyan-200' : 'text-gray-900'
                  }`}
                >
                  {facility.title}
                </h4>
              </div>
              <p
                className={`text-sm ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {facility.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
      {/* Use Cases Section */}
      <div className="mt-20 max-w-6xl text-center">
        <h3
          className={`text-3xl font-bold mb-6 ${
            darkMode ? 'text-cyan-300' : 'text-cyan-700'
          }`}
        >
          How People Use Reva AI
        </h3>
        <p
          className={`text-base leading-relaxed mb-12 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          From classrooms to boardrooms, Reva adapts to your needs.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
          {[
            {
              title: 'Students',
              desc: 'Summarize notes, solve problems, and learn faster.',
            },
            {
              title: 'Professionals',
              desc: 'Analyze data, prepare reports, and boost productivity.',
            },
            {
              title: 'Marketers',
              desc: 'Generate creative ads, copywriting, and campaign ideas.',
            },
            {
              title: 'Everyday Users',
              desc: 'Ask anything, get emotional support, and daily guidance.',
            },
          ].map((usecase, i) => (
            <div
              key={i}
              className={`p-6 rounded-xl shadow-md hover:scale-105 transition-transform ${
                darkMode
                  ? 'bg-gray-900/70 border border-cyan-500/30'
                  : 'bg-white/80 border border-pink-500/30'
              }`}
            >
              <h4
                className={`font-semibold mb-2 ${
                  darkMode ? 'text-cyan-200' : 'text-gray-900'
                }`}
              >
                {usecase.title}
              </h4>
              <p
                className={`text-sm ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {usecase.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
      {/* How It Works Section */}
      <div className="mt-20 max-w-5xl text-center">
        <h3
          className={`text-3xl font-bold mb-6 ${
            darkMode ? 'text-cyan-300' : 'text-cyan-700'
          }`}
        >
          How Reva AI Works
        </h3>
        <p
          className={`text-base leading-relaxed mb-12 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          A seamless journey from your idea to Reva’s intelligent response.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
          {[
            { step: '1. Ask', desc: 'Type, speak, or upload — Reva listens.' },
            { step: '2. Think', desc: 'Processes context with empathy + logic.' },
            { step: '3. Generate', desc: 'Creates answers, images, videos, or insights.' },
            { step: '4. Deliver', desc: 'Gives polished, ready-to-use results instantly.' },
          ].map((flow, i) => (
            <div
              key={i}
              className={`p-6 rounded-xl flex-1 shadow-md transition-transform hover:scale-105 ${
                darkMode
                  ? 'bg-gray-900/70 border border-cyan-500/30'
                  : 'bg-white/80 border border-pink-500/30'
              }`}
            >
              <h4
                className={`font-semibold mb-2 ${
                  darkMode ? 'text-cyan-200' : 'text-gray-900'
                }`}
              >
                {flow.step}
              </h4>
              <p
                className={`text-sm ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {flow.desc}
              </p>
            </div>
          ))}
        </div>
      </div>


    </div>
  );
};

export default WelcomeScreen;