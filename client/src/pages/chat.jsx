import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import ChatHistory from "../components/ChatHistory";
import SearchInput from "../components/SearchInput";
import Conversation from "../components/Conversation";
import SuggestionChips from "../components/SuggestionChips";
import Voice from "../components/Voice";
import RecentConversation from "../components/RecentConversation";
import NewsSearch from "../news/NewsSearch";
import NewsSuggestion from "../news/NewsSuggestion";
import ImageResult from "../components/ImageResult";
import { sendQuery, streamQuery,uploadFiles } from "../service/ChatService";
import ErrorBoundary from "../components/ErrorBoundary";
import { SearchContext } from "../context/SearchContext";
import FloatingMenu from "../components/FloatingMenu";
import { useNavigate, useParams } from "react-router-dom";



function Chat({
  darkMode,
  setDarkMode,
  setShowVoiceInteraction,
  showVoiceInteraction,
  inputValue,
  setInputValue
}) {
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
   const [conversations, setConversations] = useState([]);
  const [currentChatId, setCurrentChatId] = useState('');
  const [newsQuery, setNewsQuery] = useState('');
  const [displayedResponse, setDisplayedResponse] = useState('');
  const [renderedResponse, setRenderedResponse] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageData, setImageData] = useState(null);
  const [isMemoryChat, setMemoryChat] = useState(true);
  
  const [isImageSearch, setIsImageSearch] = useState(false);
   

   const [selectedFiles, setSelectedFiles] = useState([]);
    const [filePreviews, setFilePreviews] = useState([]);
  const {fileInputRef} =useContext(SearchContext)

    const [searchType, setSearchType] = useState('none');


  const responseEndRef = useRef(null);
  const backend_url = import.meta.env.VITE_BACKEND_URL; 


  // for chatid url 
  const { chatId } = useParams();
const navigate = useNavigate();





  useEffect(() => {
    if (responseEndRef.current && (conversations.length > 0 || loading)) {
      responseEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [conversations, loading, responseEndRef]);

  const handleNewChatMessage = (message) => {
    setChatHistory((prev) => [...prev, message]);
  };

  const processText = (text) => {
    if (!text) return '';
    return text
      .replace(/\\\((.*?)?\\\)/g, '$1')
      .replace(/\\\[(.*?)?\\\]/g, '$1')
      .replace(/^\s*|\s*$/g, '')
      .replace(/\n{2,}/g, '\n\n');
  };

  const extractContent = (text) => {
    if (!text) return [{ type: 'text', content: '' }];
    const matches = [];
    let lastIndex = 0;
    const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;

    while ((match = codeRegex.exec(text)) !== null) {
      const startIndex = match.index;
      if (startIndex > lastIndex) {
        const preText = text.slice(lastIndex, startIndex);
        parseTable(preText, matches);
      }
      matches.push({
        type: 'code',
        content: match[2].trim(),
        language: match[1] || 'text',
      });
      lastIndex = codeRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parseTable(text.slice(lastIndex), matches);
    }

    return matches.length > 0 ? matches : [{ type: 'text', content: processText(text) }];

    function parseTable(segment, matches) {
      const tableRegex = /(^\s*\|[^\n]*\|\n\s*\|[-:\s|]+\|\n(?:\s*\|[^\n]*\|\n?)*)/gm;
      let tableMatch;
      let tableLastIndex = 0;

      while ((tableMatch = tableRegex.exec(segment)) !== null) {
        const tableStart = tableMatch.index;
        if (tableStart > tableLastIndex) {
          const nonTableText = processText(segment.slice(tableLastIndex, tableStart));
          if (nonTableText) matches.push({ type: 'text', content: nonTableText });
        }
        const tableText = tableMatch[1];
        const rows = tableText
          .trim()
          .split('\n')
          .map(row =>
            row
              .split('|')
              .map(cell => cell.trim())
              .filter(cell => cell !== '')
          )
          .filter(row =>
            row.length >= 2 && !row.every(cell => /^[-:\s|]+$/.test(cell))
          );
        if (rows.length >= 1) {
          matches.push({
            type: 'table',
            headers: rows[0],
            rows: rows.slice(1),
            raw: rows.map(row => row.join('\t')).join('\n'),
          });
        }
        tableLastIndex = tableRegex.lastIndex;
      }

      if (tableLastIndex < segment.length) {
        const remainingText = processText(segment.slice(tableLastIndex));
        if (remainingText) matches.push({ type: 'text', content: remainingText });
      }
    }
  };

  const replaceDeepseek = (text) => {
    if (!text) return '';
    return text.replace(/deepseek/gi, 'Reva');
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }
    if (!currentChatId) {
      const newChatId = generateChatId();
      setCurrentChatId(newChatId);
      //  navigate(`/chat/${newChatId}`);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    if (responseEndRef.current && conversations.length > 0) {
      responseEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversations.length, displayedResponse]);

 

  useEffect(() => {
  let safeResponse = displayedResponse
    .replace(/\[DONE\]/gi, "")  // remove DONE markers
    .replace(/```(\s*)$/, "");  // remove dangling ```
  
  const parsed = extractContent(safeResponse);
  setRenderedResponse(parsed);

  if (conversations.length > 0) {
    setConversations(prev => {
      const updated = [...prev];
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        response: parsed
      };
      return updated;
    });
  }
}, [displayedResponse]);


  const generateChatId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  const saveCurrentChat = () => {
    if (conversations.length === 0) return;
    const chatTitle = conversations[0]?.query.substring(0, 30) + (conversations[0]?.query.length > 30 ? '...' : '');
    const existingChatIndex = chatHistory.findIndex(chat => chat.id === currentChatId);

    const updatedConversations = conversations.map(conv => ({
      ...conv,
      response: conv.response || [],
      mageData: conv.imageData ? {
      image_url: conv.imageData.image_url, // Store only Cloudinary URL
      prompt: conv.imageData.prompt // Store prompt
      // Explicitly exclude image_base64
    } : null
    }));

    if (existingChatIndex >= 0) {
      const updatedHistory = [...chatHistory];
      updatedHistory[existingChatIndex] = {
        ...updatedHistory[existingChatIndex],
        title: chatTitle,
        conversations: updatedConversations
      };
      setChatHistory(updatedHistory);
    } else {
      setChatHistory([
        ...chatHistory,
        {
          id: currentChatId,
          title: chatTitle,
          conversations: updatedConversations
        }
      ]);
    }
  };



  const generateImageResult = async (data) => {
    const newConversation = { query: data.extracted_text, response: [], imageData: data.image_info };
    setConversations(prev => [...prev, newConversation]);
    
    setDisplayedResponse('');
    setRenderedResponse([]);
    setError('');
    setIsTyping(false);
    setLoading(false);
    setImageData(data.image_info);
    setTimeout(() => saveCurrentChat(), 600);
  };

  const handleRefine = (index, refinedQuery) => {
    setLoading(true);
    setTimeout(() => {
      const newResponse = [{ type: 'text', content: `Refined response for "${refinedQuery}"` }];
      setConversations(prev => {
        const updated = [...prev];
        updated[index] = { query: refinedQuery, response: newResponse };
        return updated;
      });
      setLoading(false);
    }, 1000);
  };


 const resetFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  }, [fileInputRef]);

  


  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // console.log("selectedFiles.length",selectedFiles.length)

    if (!inputValue.trim() && selectedFiles.length === 0) {

      alert("Please enter a query or upload documents");
      return;
    }
    if(conversations.length===0){
      const newChatId = generateChatId();
      setCurrentChatId(newChatId);
       navigate(`/chat/${newChatId}`);
    }
     

    setLoading(true);
    setError(null);


    try {
     
     
      // 2. Add new conversation entry
      const newConversation = {
        query: inputValue || (selectedFiles.length > 0 ? "Uploaded documents" : ""),
        response: [],
        files: selectedFiles.map(file => ({ name: file.name, type: file.type }))
      };
      setConversations((prev) => [...prev, newConversation]);
      setDisplayedResponse("");
      setRenderedResponse([]);
      setError("");


       
      // === CASE HANDLING ===
      if (inputValue.trim() && (selectedFiles.length ==0)) {
        // Case 1 & 2: text-only 
      
        streamQuery(
          currentChatId,
          inputValue,
          (chunk) => setDisplayedResponse((prev) => prev + chunk),
          () => {
            setIsTyping(false);
            setLoading(false);
            saveCurrentChat();
          },
          (err) => {
            setError(err.message);
            setIsTyping(false);
            setLoading(false);
          },
           isMemoryChat // 👈 send flag
        );
      } else if (selectedFiles.length > 0) {
        // Case 2: only documents → describe content or  documents+input value -> describe based on input value
        const fileNames = selectedFiles.map(f => f.name).join(", ");
        const describePrompt = inputValue.length >0 ? `Please describe the content of the uploaded documents: ${fileNames}. based on query: ${inputValue}.` : `Please describe the content of the uploaded documents: ${fileNames}.`;

        
        

        await uploadFiles(
          currentChatId,
          selectedFiles,
          describePrompt,
          (chunk) => setDisplayedResponse((prev) => prev + chunk),
          () => {
            setIsTyping(false);
            setLoading(false);
            saveCurrentChat();
          },
          (err) => {
            setError(err.message);
            setIsTyping(false);
            setLoading(false);
          }
          ,
           isMemoryChat // 👈 send flag
        );
      }
      
      else {
        setLoading(false);
      }

      // 4. Reset state
      setFilePreviews((prev) => {
        prev.forEach((item) => {
          if (item.preview) URL.revokeObjectURL(item.preview);
        });
        return [];
      });
      setSelectedFiles([]);
      setInputValue("");
      resetFileInput();

    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      setLoading(false);
    }

  };







  const handleRegenerate = async () => {
    const lastQuery = conversations[conversations.length - 1]?.query;
    if (!lastQuery) return;

    setDisplayedResponse("");
    setRenderedResponse([]);
    setError("");
    setIsTyping(true);
    setLoading(true);

    try {
      streamQuery(
        currentChatId,
        lastQuery,
        (chunk) => {
          setDisplayedResponse((prev) => prev + chunk);
        },
        () => {
          setIsTyping(false);
          setLoading(false);
          saveCurrentChat();
          setMemoryChat(false);
        },
        (err) => {
          setError(err.message);
          setIsTyping(false);
          setLoading(false);
        },
         isMemoryChat // 👈 send flag
      );
    } catch (err) {
      setError(err.message);
      setIsTyping(false);
      setLoading(false);
    }
  };

  const handleHeadlineClick = (headline) => {
    setNewsQuery(headline);
    setConversations(prev => [...prev, { query: headline, response: [] }]);
    setDisplayedResponse('');
    setRenderedResponse([]);
    setError('');
    setIsTyping(false);
    setLoading(false);
    setTimeout(() => saveCurrentChat(), 600);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setShowFilters(false);
  };

  const startNewChat = () => {
    if (conversations.length > 0) {
      saveCurrentChat();
    }
    setConversations([]);
    setDisplayedResponse('');
    setRenderedResponse([]);
    setInputValue('');
    setNewsQuery('');
    setError('');
    setLoading(false);
    setImageData(null);
    // const newChatId = generateChatId();
    // setCurrentChatId(newChatId);
     navigate(`/chat/`); // 👈 push to URL
    setShowChatHistory(false);

     setMemoryChat(true);
  };

  const deleteChat = (chatId, e) => {
    e.stopPropagation();
    const updatedHistory = chatHistory.filter(chat => chat.id !== chatId);
    setChatHistory(updatedHistory);
    if (currentChatId === chatId) {
      startNewChat();
    }
  };

  const loadChat = (chatId) => {
    const selectedChat = chatHistory.find(chat => chat.id === chatId);
    if (selectedChat) {
      if (conversations.length > 0 && currentChatId !== chatId) {
        saveCurrentChat();
      }
      setConversations(selectedChat.conversations);
      setCurrentChatId(chatId);
    navigate(`/chat/${chatId}`);
      const lastResponse = selectedChat.conversations[selectedChat.conversations.length - 1]?.response || [];
      setDisplayedResponse(replaceDeepseek(lastResponse.length > 0 ? lastResponse.map(r => r.content || r.raw || '').join('\n') : ''));
      setRenderedResponse(lastResponse);
      setNewsQuery('');
      setIsTyping(false);
      setError('');
      setLoading(false);
      setImageData(selectedChat.conversations[selectedChat.conversations.length - 1]?.imageData || null);
      setShowChatHistory(false);
      // Mark this as continuation (not new)
    setMemoryChat(false);
    }
  };




const handleTextToImage = async (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (!inputValue.trim()) {
    setError('Please enter a text prompt');
    return;
  }
   

  // Add pending conversation immediately to trigger Conversation render and show loading
  setConversations(prev => [...prev, { query: inputValue, response: [], imageData: null }]);
  setLoading(true);
  setIsImageSearch(true);
  setError(null);

  try {
    // Step 1: Fetch image from your local API
    const response = await fetch(`${backend_url}/api/text-to-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        prompt: inputValue,
        chat_id: currentChatId
      }),
    });

    if (!response.ok) throw new Error('Failed to generate image');

    const data = await response.json();
    // console.log('Local API response:', data); // Debug: Check if image_base64 exists

    if (!data.image_base64) {
      throw new Error('too many peoples are generating plz try again');
    }

    // Step 2: Upload to Cloudinary
    const uploadToCloudinary = async (base64) => {
      const formData = new FormData();
      // Ensure full data URL
      const fullBase64 = base64.startsWith('data:image') ? base64 : `data:image/png;base64,${base64}`;
      formData.append('file', fullBase64);
      formData.append('upload_preset', 'reva_ai_unsigned'); // e.g., 'reva_ai_unsigned'
         
      const cloudName = import.meta.env.VITE_CLOUD_NAME; // e.g., 'dabc123xyz'
     
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

      

      const uploadResponse = await fetch(url, {
        method: 'POST',
        body: formData,
      });

     

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Cloudinary upload failed (${uploadResponse.status}): ${errorText}`);
      }

      const uploadData = await uploadResponse.json();
      // console.log('Cloudinary success:', uploadData); // Debug
      return uploadData.secure_url;
    };

    let imageUrl;
    try {
      imageUrl = await uploadToCloudinary(data.image_base64);
     
    } catch (uploadErr) {
      
      // Fallback: Use base64 directly (for testing)
      imageUrl = null;
      setError(`Upload to Cloudinary failed: ${uploadErr.message}. Using local image.`);
    }

    // Update the last conversation with image data (instead of adding a new one)
    setConversations(prev => {
      const updated = [...prev];
      updated[updated.length - 1].imageData = { 
        image_url: imageUrl,   
        prompt: inputValue 
      };
      return updated;
    });
   setDisplayedResponse('');
   setRenderedResponse([])
     

    setInputValue('');
    setError(null);
  } catch (err) {
    alert('Text-to-image error');
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


useEffect(() => {
  if (chatId) {
    setCurrentChatId(chatId);
    const savedChat = chatHistory.find(chat => chat.id === chatId);
    
    if (savedChat)
      {
        
        setConversations(savedChat.conversations);
        
      } 
  } 
}, [chatId]);
      

  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#161616] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        setShowChatHistory={setShowChatHistory}
        startNewChat={startNewChat}
         setMemoryChat={ setMemoryChat}
      />
      <ChatHistory
        showChatHistory={showChatHistory}
        setShowChatHistory={setShowChatHistory}
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        loadChat={loadChat}
        deleteChat={deleteChat}
        darkMode={darkMode}
      />
     
      <div className="flex flex-col items-center min-h-[calc(100vh-64px)] px-4 sm:px-8 lg:px-10 pt-16 pb-16">
        <div className="w-full max-w-[895px] flex flex-col gap-6">
          {conversations.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-24 space-y-2">
              <div className="flex items-center space-x-2">
                <i className="fa-solid fa-bolt text-blue-400 text-4xl"></i>
                <h1
                  className={`text-3xl font-black tracking-tight ${
                    darkMode ? 'text-cyan-200' : 'text-cyan-800'
                  } drop-shadow-[0_0_12px_rgba(34,211,238,0.4)] relative z-10`}
                >
                  Reva AI
                </h1>
              </div>
              <p
                className={`text-xl ml-4 font-medium ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}
              >
                Hello! <span className="font-semibold text-cyan-400">How can I assist you today?</span>
              </p>
            </div>
          )}
          {conversations.length > 0 && (
            <div className="flex flex-col gap-6">
              <ErrorBoundary darkMode={darkMode}>
              <Conversation
                conversations={conversations}
                displayedResponse={displayedResponse}
                isTyping={isTyping}
                darkMode={darkMode}
                handleRegenerate={handleRegenerate}
                onHeadlineClick={handleHeadlineClick}
                loading={loading}
                error={error}
                handleRefine={handleRefine}
                imageData={imageData}
                isImageSearch={isImageSearch}
                setIsImageSearch={setIsImageSearch}
              />
              </ErrorBoundary>
            </div>
          )}
          <div className={`${conversations.length > 0 ? 'sticky bottom-1 z-40' : 'mt-16 '}`}>
            <SearchInput
              inputValue={inputValue}
              setInputValue={setInputValue}
              handleSubmit={handleSubmit}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              activeFilter={activeFilter}
              handleFilterChange={handleFilterChange}
              darkMode={darkMode}
              setShowVoiceInteraction={setShowVoiceInteraction}
              generateImageResult={generateImageResult}
              setIsImageSearch={setIsImageSearch}
              setLoading={setLoading}
              selectedFiles={selectedFiles}
              setSelectedFiles={ setSelectedFiles}
              filePreviews={filePreviews}
              setFilePreviews={setFilePreviews}
              resetFileInput={resetFileInput}
              fileInputRef={fileInputRef}
              handleTextToImage={handleTextToImage}
              searchType={searchType}
              setSearchType={setSearchType}
            />
          </div>
          <div ref={responseEndRef}></div>
          {conversations.length === 0 &&(

           <div className="w-full flex justify-center mt-2">
              <FloatingMenu
                setShowVoiceInteraction={setShowVoiceInteraction}
                 setSearchType={setSearchType}
              />
           </div>

          )}
        </div>
      </div>
      {showVoiceInteraction && (
        <Voice
         darkMode={darkMode}
          setShowVoiceInteraction={setShowVoiceInteraction}
          handleNewChatMessage={handleNewChatMessage}
          currentChatId={currentChatId}
        />
      )}
    </div>
  );
}

export default Chat;