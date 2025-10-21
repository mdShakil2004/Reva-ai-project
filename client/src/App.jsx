import React, { useState, useEffect, useRef, useContext } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';


import { Routes, Route } from 'react-router-dom';
import Upgrade from './components/Upgrade';
import NotFound from './components/NotFound';
import WelcomePage from './pages/WelcomePage';
import Chat from './pages/chat';
import UniverseInterface from './voice/UniverseOrb';



const App = () => {
  const [darkMode, setDarkMode] = useState(true);
  
  const [showVoiceInteraction, setShowVoiceInteraction] = useState(false);
    const [inputValue, setInputValue] = useState('');




  
  return (
    <HelmetProvider>
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#121212] text-white' : 'bg-gray-50 text-gray-900'}`}>
        <style>
          {`
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .no-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}
        </style>
        <Routes>
          <Route
            path="/chat/:chatId?"
            element={
               
              <>
                <Helmet>
                <title>Reva AI</title>
<meta name="description" content="Reva AI is an advanced AI-powered search system offering intelligent conversations, real-time news, image analysis, and personalized responses. Available in India with support for multiple languages and voice interaction. Experience the future of search with multimodal AI technology." />

<meta name="keywords" content="Reva AI, AI search system, intelligent chat, image search, news search, image analysis, voice interaction, voice to voice, voice to text, AI talking, talking with AI, artificial intelligence, personalized responses, AI-powered platform, real-time search, conversational AI, machine learning chatbot, deep learning assistant, natural language processing, NLP chatbot, AI voice assistant, speech recognition, multimodal AI, AI-powered search engine, smart search assistant, AI text generation, semantic search, generative AI chatbot, AI-driven insights, virtual assistant, AI news summarizer, AI image recognition, AI-powered voice search, context-aware AI, human-like conversation, AI document search, AI video analysis, AI transcription, AI translation, smart query understanding, personalized AI assistant, AI knowledge base, real-time language translation, AI customer support bot, AI Q&A system, AI-powered recommendations, AI content analysis, sentiment analysis AI, AI text-to-speech, TTS AI, AI speech-to-text, STT AI, intelligent voice search, AI-powered productivity tool, AI learning platform, AI-powered business assistant, advanced AI search, AI-powered research tool, AI knowledge engine, AI-powered decision-making, AI-powered summarization, AI-powered creativity, AI-powered brainstorming, AI India, AI search India, Indian AI assistant, AI chatbot India, AI-powered search India, AI voice assistant India, multilingual AI India, AI in Delhi, AI in Mumbai, AI in Bangalore, AI in Hyderabad, AI in Chennai, AI in Kolkata" />

<meta name="robots" content="index, follow" />
<meta name="author" content="Reva AI Team" />
<link rel="canonical" href="https://www.reva.ai/" />

{/* <!-- Open Graph / Facebook --> */}
<meta property="og:title" content="Reva AI - Intelligent Multimodal Search & Chat" />
<meta property="og:description" content="Join Reva AI for AI-powered conversations, real-time news search, image analysis, and seamless voice interaction. Now available in India with multilingual support." />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://www.reva.ai/" />
<meta property="og:image" content="https://www.reva.ai/brain_logo.jpg" />
<meta property="og:image:type" content="image/jpeg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:site_name" content="Reva AI Search System" />

{/* <!-- Twitter --> */}
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Reva AI - Intelligent Multimodal Search & Chat" />
<meta name="twitter:description" content="Explore Reva AI's intelligent search features, including AI chat, real-time news, image analysis, and voice interaction. Now available in India with multilingual support." />
<meta name="twitter:image" content="https://www.reva.ai/brain_logo.jpg" />

{/* <!-- Local SEO --> */}
<meta name="geo.region" content="IN" />
<meta name="geo.placename" content="India" />
<meta name="geo.position" content="20.5937;78.9629" />
<meta name="ICBM" content="20.5937, 78.9629" />

                  <script type="application/ld+json">
                    {`
                      {
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        "name": "Reva AI Search System",
                        "description": "Reva AI Search System offers intelligent conversations, real-time news search, image analysis, and voice interaction powered by advanced AI technology.",
                        "url": "https://www.reva.ai/",
                        "applicationCategory": "Search Engine",
                        "operatingSystem": "Web",
                        "offers": {
                          "@type": "Offer",
                          "price": "0",
                          "priceCurrency": "USD"
                        },
                        "creator": {
                          "@type": "Organization",
                          "name": "Reva AI Team"
                        }
                      }
                    `}
                  </script>
                </Helmet>
                
<Chat
      darkMode={darkMode}
      setDarkMode={setDarkMode}
    setShowVoiceInteraction={setShowVoiceInteraction}
    showVoiceInteraction={showVoiceInteraction}
    inputValue={inputValue}
    setInputValue={setInputValue}
  />

              </>
             
            }
          />
          <Route
            path="/upgrade"
            element={
              <>
                <Helmet>
                  <title>Upgrade Your Reva Chat Experience</title>
                  <meta name="description" content="Unlock premium features with Reva Chat's upgrade plans for enhanced AI conversations and advanced search capabilities." />
                  <meta name="keywords" content="Reva Chat upgrade, premium AI, subscription plans, enhanced search" />
                  <meta name="robots" content="index, follow" />
                </Helmet>
                <Upgrade darkMode={darkMode} />
              </>
            }
          />
<Route
            path="/"
            element={
              <>
                <Helmet>
                  <title>Welcome to Reva Chat</title>
                  <meta name="description" content="Start your journey with Reva Chat, your AI-powered assistant for seamless conversations." />
                  <meta name="keywords" content="Reva Chat, AI assistant, welcome" />
                  <meta name="robots" content="index, follow" />
                </Helmet>
               <WelcomePage
 
  
  darkMode={darkMode}
  
  setDarkMode={setDarkMode}
  inputValue={inputValue}
  setInputValue={setInputValue}
  setShowVoiceInteraction={setShowVoiceInteraction}
/>

              </>
            }
          />
      
          <Route
            path="*"
            element={
              <>
                <Helmet>
                  <title>404 - Page Not Found | Reva Chat</title>
                  <meta name="description" content="The page you are looking for does not exist. Return to Reva Chat's homepage to continue exploring." />
                  <meta name="keywords" content="404, page not found, Reva Chat, error" />
                  <meta name="robots" content="noindex, follow" />
                </Helmet>
                <NotFound />
              </>
            }
          />
          <Route
          
          path="/voice"
          element={
            <UniverseInterface/>
          }
          />
        </Routes>
      </div>
    </HelmetProvider>
  );
};

export default App;