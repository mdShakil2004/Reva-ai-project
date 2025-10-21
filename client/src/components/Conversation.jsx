import React, { useEffect, useRef, useMemo, useState} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faSyncAlt, faEdit, faShareAlt, faBookmark, faNewspaper, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import "../style/Conversation.css"
import ImageResult from './ImageResult';
import GraphTreeRenderer from '../contents/GraphTreeRenderer';
import RenderChart from '../contents/RenderChart';
import {  Sparkles } from "lucide-react";





const Conversation = ({ conversations, displayedResponse, isTyping, darkMode, handleRegenerate, handleRefine,imageData,isImageSearch, onHeadlineClick, loading, error,setIsImageSearch}) => {
  const chatRef = useRef(null);
  const [copyState, setCopyState] = useState({});
  const [collapsedStates, setCollapsedStates] = useState({});
  const [savedConversations, setSavedConversations] = useState({});
  const [refineStates, setRefineStates] = useState({});



  
  // Load saved conversations from localStorage on mount
  useEffect(() => {
    const savedItems = JSON.parse(localStorage.getItem('savedConversations') || '{}');
    setSavedConversations(savedItems);
  }, []);

  // Smooth scroll to latest conversation or loading/error state
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [conversations.length, loading, isTyping]);

  // Clean text by removing markdown and LaTeX artifacts
  const cleanText = (text) => {
    if (!text) return '';
    return text
      .replace(/#{1,6}\s*/g, '')
      .replace(/\*\*|\*/g, '')
      .replace(/`{1,3}[^`]*`{1,3}/g, (match) => match.replace(/`/g, ''))
      .replace(/>\s*/g, '')
      .replace(/^\s*-+\s*$/gm, '')
      .replace(/^\s*-\s*/gm, '')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\\\((.*?)?\\\)/g, '$1')
      .replace(/(?<!\|)\|(?!\|)/g, '')
      .replace(/:-+:|-+:/g, '')
      .replace(/^\s*|\s*$/g, '')
      .replace(/\n{2,}/g, '\n');
  };

  // Extract tables, code blocks, and text from response
  const extractContent = useMemo(() => {
    return (text) => {
      if (!text) return [{ type: 'text', content: '' }];
      const matches = [];
      let lastIndex = 0;
      const codeRegex = /```(\w+)?\n([\s\S]*?)\n```/g;

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

      return matches.length > 0 ? matches : [{ type: 'text', content: cleanText(text) }];

      function parseTable(segment, matches) {
        const tableRegex = /(^\s*\|[^\n]*\|\n\s*\|[-:\s|]+\|\n(?:\s*\|[^\n]*\|\n?)*)/gm;
        let tableMatch;
        let tableLastIndex = 0;

        while ((tableMatch = tableRegex.exec(segment)) !== null) {
          const tableStart = tableMatch.index;
          if (tableStart > tableLastIndex) {
            const nonTableText = cleanText(segment.slice(tableLastIndex, tableStart));
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
          const remainingText = cleanText(segment.slice(tableLastIndex));
          if (remainingText) matches.push({ type: 'text', content: remainingText });
        }
      }
    };
  }, []);

  // Generate query-related headlines
  const generateHeadlines = (query) => {
    if (!query) return [];
    const keywords = query.toLowerCase().split(' ').filter(word => word.length > 3);
    const baseHeadlines = [
      'Latest Developments',
      'Recent Innovations',
      'Top Stories',
      'Breaking News'
    ];
    return keywords.length > 0
      ? baseHeadlines.map(headline => `${headline} in ${keywords[0].charAt(0).toUpperCase() + keywords[0].slice(1)}`)
      : baseHeadlines;
  };

let safeResponse = displayedResponse.replace(/\[DONE\]$/g, "").trim();
const renderedResponse = useMemo(() => extractContent(safeResponse), [safeResponse, extractContent]);




  // Auto-collapse previous responses
  useEffect(() => {
    if (conversations.length > 1) {
      const newCollapsedStates = {};
      conversations.forEach((_, idx) => {
        newCollapsedStates[idx] = idx < conversations.length - 1;
      });
      
      
      setCollapsedStates(newCollapsedStates);
    }
   
   const lastConversation = conversations[conversations.length - 1];

// Only check for imageData
if (lastConversation.imageData) {
  setIsImageSearch(true);
} 


  }, [conversations.length],isImageSearch);

  // Toggle collapse state
  const toggleCollapse = (index) => {
    setCollapsedStates(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Handle save/unsave
  const handleSave = (index) => {
    const item = conversations[index];
    const itemId = `conv-${index}-${item.query.slice(0, 50)}`;
    const savedItems = { ...savedConversations };

    if (savedItems[itemId]) {
      delete savedItems[itemId];
    } else {
      savedItems[itemId] = {
        query: item.query,
        response: item.response || displayedResponse,
        timestamp: new Date().toISOString()
      };
    }

    setSavedConversations(savedItems);
    localStorage.setItem('savedConversations', JSON.stringify(savedItems));
  };

  // Handle share
  const handleShare = async () => {
    const linkToCopy = 'https://reva.com/chat';
    try {
      await navigator.clipboard.writeText(linkToCopy);
      alert('Link copied to clipboard!');
    } catch (err) {
      
      alert('Failed to copy link.');
    }
  };

  // Toggle refine input visibility and initialize with original query
  const toggleRefine = (index) => {
    setRefineStates(prev => ({
      ...prev,
      [index]: {
        isEditing: !prev[index]?.isEditing,
        query: prev[index]?.isEditing ? prev[index].query : conversations[index].query
      }
    }));
  };

  // Handle refine input change
  const handleRefineInput = (index, value) => {
    setRefineStates(prev => ({
      ...prev,
      [index]: { ...prev[index], query: value }
    }));
  };

  // Submit refined query
  const submitRefine = (index) => {
    const refinedQuery = refineStates[index]?.query;
    if (refinedQuery && refinedQuery.trim()) {
      handleRefine(index, refinedQuery);
      setRefineStates(prev => ({
        ...prev,
        [index]: { isEditing: false, query: '' }
      }));
    }
  };




    // LinkifiedText component to handle URLs in text
  const LinkifiedText = ({ text, darkMode }) => {
    const parts = text.split(/(\bhttps?:\/\/[^\s<>"'()]+|\bwww\.[^\s<>"'()]+)/gi);
    return parts.map((part, i) => {
  if (part.match(/^https?:\/\/[^\s<>"'()]+$/i) || part.match(/^www\.[^\s<>"'()]+$/i)) {
    const url = part.startsWith('http') ? part : `http://${part}`;
    return (
      <a key={i} href={url} target="_blank" rel="noopener noreferrer"
        className={`underline ${darkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-600 hover:text-blue-500'}`}>
        {part}
      </a>
    );
  }
  return <span key={i}>{part}</span>; // wrap normal text
});

  };
 




  return (
    <div className="space-y-4 mb-20" aria-live="polite">
      {conversations.map((item, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg transition-all duration-300 animate-fadeIn 
           
          `}
          ref={index === conversations.length - 1 ? chatRef : null}
        >


          <div className="flex items-start space-x-2 group">
            <div className="w-5 h-5 mt-1 rounded-full flex items-center justify-center flex-shrink-0 ">
               <i className="fa-solid fa-bolt text-blue-400 text-xl"></i>
            </div>
            <div className="flex-1">
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100 ">{item.query}</p>
              {refineStates[index]?.isEditing ? (
                <div className="mt-3">
                  <input
                    type="text"
                    value={refineStates[index].query}
                    onChange={(e) => handleRefineInput(index, e.target.value)}
                    className={`w-full p-2 rounded-lg border transition-all duration-200 ${
                      darkMode ? 'bg-gray-800 border-gray-600 text-gray-200 focus:ring-blue-400' : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                    } focus:outline-none focus:ring-2`}
                    placeholder="Refine your query..."
                  />
                  <div className="flex gap-2 mt-2 ">
                    <button
                      onClick={() => submitRefine(index)}
                      className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200"
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => toggleRefine(index)}
                      className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                        darkMode ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3 mt-2  transition-opacity duration-200">
                  <button
                    onClick={() => handleRegenerate(item.query)}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                    title="Regenerate Response"
                  >
                    <FontAwesomeIcon icon={faSyncAlt} 
                     className="transition-transform duration-200 hover:scale-100"
                     
                     />
                  </button>
                  <button
                    onClick={() => toggleRefine(index)}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                    title="Refine Query"
                  >
                    <FontAwesomeIcon icon={faEdit} className="transition-transform duration-200 hover:scale-100" />
                  </button>
                  <button
                    onClick={() => handleSave(index)}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                    title={savedConversations[`conv-${index}-${item.query.slice(0, 50)}`] ? 'Unsave' : 'Save'}
                  >
                    <FontAwesomeIcon
                    icon={faBookmark}
                      className={`transition-transform duration-200 hover:scale-100 ${
                        savedConversations[`conv-${index}-${item.query.slice(0, 50)}`] ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'
                      }`}
                               />
                  </button>
                  <button
                    onClick={handleShare}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                    title="Share"
                  >
                    <FontAwesomeIcon icon={faShareAlt}
                    className="transition-transform duration-200 hover:scale-100"
                    />
                  </button>
                </div>


              )}
            </div>
          </div>



          


          <div className="flex items-start space-x-3 mt-2">
            
            <div className="flex-1">
              {index === conversations.length - 1 ? (
                <>
                  
                  {displayedResponse && (
                    <div className="prose max-w-none">
                      {renderedResponse.map((block, blockIndex) => (
                        <div key={blockIndex} className="mb-4">
                          {block.type === 'text' && (
                          <p className="whitespace-pre-wrap   text-gray-800 dark:text-gray-200">
                           <LinkifiedText text={block.content} darkMode={darkMode} />
                                                                          </p>


                          )}
                          {block.type === 'code' && (
                            <div className="relative">
                              <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={block.language}
                                className="rounded-lg text-sm border border-gray-300 dark:border-gray-600"
                              >
                                {block.content}
                              </SyntaxHighlighter>
                              <CopyToClipboard
                                text={block.content}
                                onCopy={() => {
                                  setCopyState({ ...copyState, [`code-${index}-${blockIndex}`]: true });
                                  setTimeout(() => setCopyState({ ...copyState, [`code-${index}-${blockIndex}`]: false }), 2000);
                                }}
                              >
                                <button className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-all duration-200 text-sm">
                                  {copyState[`code-${index}-${blockIndex}`] ? 'Copied!' : 'Copy'}
                                </button>
                              </CopyToClipboard>
                            </div>
                          )}
                          {block.type === 'table' && (
                            <div className="relative">
                              <table className={`w-full border-collapse text-sm border ${
                                darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
                              }`}>
                                <thead>
                                  <tr className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                                    {block.headers.map((header, i) => (
                                      <th key={i} className="border p-2 text-left font-medium text-gray-900 dark:text-gray-100">
                                        {header}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {block.rows.map((row, i) => (
                                    <tr key={i} className={i % 2 === 0 ? (darkMode ? 'bg-gray-800' : 'bg-white') : (darkMode ? 'bg-gray-900' : 'bg-gray-50')}>
                                      {row.map((cell, j) => (
                                        <td key={j} className="border p-2 text-gray-800 dark:text-gray-200">
                                          {cell}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              <CopyToClipboard
                                text={block.raw}
                                onCopy={() => {
                                  setCopyState({ ...copyState, [`table-${index}-${blockIndex}`]: true });
                                  setTimeout(() => setCopyState({ ...copyState, [`table-${index}-${blockIndex}`]: false }), 2000);
                                }}
                              >
                                <button className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-all duration-200 text-sm">
                                  {copyState[`table-${index}-${blockIndex}`] ? 'Copied!' : 'Copy'}
                                </button>
                              </CopyToClipboard>
                            </div>
                          )}

                          {block.type === 'chart' && RenderChart(block.content, darkMode)}
                          {(block.type === "graph" || block.type === "tree") && (
                           <GraphTreeRenderer block={block} />
                                            )}
                                            



                        </div>
                      ))}
                    </div>
                  )}
                   {(isImageSearch && item.imageData) && (
                       <>
       
        <ImageResult
          imageData={item.imageData}
          loading={loading }
          darkMode={darkMode}
        />
      </>
    ) }
    
                </>
              ) : (
                <>
               <div className="mt-1 group relative">
  <div
    className={`relative w-full text-left py-2 px-3 pb-10 rounded-lg transition-all duration-300  ${
      darkMode ? 'text-gray-200 border-gray-600' : 'text-gray-800 border-gray-300'
    }`}
  >
    <p className="line-clamp-3 text-base leading-relaxed">
      {collapsedStates[index]
        ? item.response?.find(r => r.type === 'text')?.content || ''
        : ''}
    </p>
    {collapsedStates[index] && (
      <div className="absolute bottom-6 left-0 right-0 h-[2em] gradient-bg pointer-events-none" />
    )}
  </div>
  <button 
    onClick={() => toggleCollapse(index)}
    className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 p-2 rounded-full transition-all duration-300 cursor-pointer hover:bg-blue-500/50 hover:shadow-md ${
      darkMode ? 'text-gray-200 border-gray-600' : 'text-gray-800 border-gray-300'
    } animate-bounce-subtle z-10`}
    title={collapsedStates[index] ? 'Expand Answer' : 'Collapse Answer'}
  >
    <div className="absolute inset-0 pointer-events-none" />
    <FontAwesomeIcon
      icon={collapsedStates[index] ? faChevronDown : faChevronUp}
      className="text-sm relative z-10"
    />
  </button>
</div>
                  {!collapsedStates[index] && (
                    <div className="mt-1 pl-6 border-gray-400 overflow-y-hidden  dark:border-gray-500">
                      {item.response?.map((block, blockIndex) => (
                        <div key={blockIndex} className="mb-4">
                          {block.type === 'text' && (
                            <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-800 dark:text-gray-200">
                              <LinkifiedText text={block.content} darkMode={darkMode} />
                            </p>
                          )}
                          {block.type === 'code' && (
                            <div className="relative">
                              <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={block.language}
                                className="rounded-lg text-sm border border-gray-300 dark:border-gray-600"
                              >
                                {block.content}
                              </SyntaxHighlighter>
                              <CopyToClipboard
                                text={block.content}
                                onCopy={() => {
                                  setCopyState({ ...copyState, [`code-${index}-${blockIndex}`]: true });
                                  setTimeout(() => setCopyState({ ...copyState, [`code-${index}-${blockIndex}`]: false }), 2000);
                                }}
                              >
                                <button className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-all duration-200 text-sm">
                                  {copyState[`code-${index}-${blockIndex}`] ? 'Copied!' : 'Copy'}
                                </button>
                              </CopyToClipboard>
                            </div>
                          )}
                         
                          {block.type === 'table' && (
                            <div className="relative">
                              <table className={`w-full border-collapse text-sm border ${
                                darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
                              }`}>
                                <thead>
                                  <tr className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                                    {block.headers.map((header, i) => (
                                      <th key={i} className="border p-2 text-left font-medium text-gray-900 dark:text-gray-100">
                                        {header}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {block.rows.map((row, i) => (
                                    <tr key={i} className={i % 2 === 0 ? (darkMode ? 'bg-gray-800' : 'bg-white') : (darkMode ? 'bg-gray-900' : 'bg-gray-50')}>
                                      {row.map((cell, j) => (
                                        <td key={j} className="border p-2 text-gray-800 dark:text-gray-200">
                                          {cell}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              <CopyToClipboard
                                text={block.raw}
                                onCopy={() => {
                                  setCopyState({ ...copyState, [`table-${index}-${blockIndex}`]: true });
                                  setTimeout(() => setCopyState({ ...copyState, [`table-${index}-${blockIndex}`]: false }), 2000);
                                }}
                              >
                                <button className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-all duration-200 text-sm">
                                  {copyState[`table-${index}-${blockIndex}`] ? 'Copied!' : 'Copy'}
                                </button>
                              </CopyToClipboard>
                            </div>
                          )}
                          
                          {block.type === 'chart' && RenderChart(block.content, darkMode)}
                       

                      {(block.type === "graph" || block.type === "tree") && (
  <GraphTreeRenderer block={block} />
)}

                        </div>
                      ))}
                      {item.imageData && (
                       <>
       
        <ImageResult
          imageData={item.imageData}
          loading={loading && index === conversations.length - 1}
          darkMode={darkMode}
        />
      </>
                      ) }




                    </div>



                  )}











                  
                </>
              )}
            </div>
          </div>
        </div>



      ))}



  {(isImageSearch || loading) && (
  <div
    className={`p-4 sm:p-6   transition-all duration-300  `}
    ref={chatRef}
    role="status"
    aria-live="polite"
  >
    {/* Loading State */}

<style>
{`
  @keyframes shape-rotate {
    0% {
      transform: rotate(0deg) scale(1) skew(0deg);
    }
    25% {
      transform: rotate(180deg) scale(1.15) skew(8deg); /* Smooth clockwise stretch */
    }
    50% {
      transform: rotate(360deg) scale(0.90) skew(-8deg); /* Smooth clockwise compress */
    }
    75% {
      transform: rotate(-180deg) scale(1.1) skew(4deg); /* Smooth counterclockwise stretch */
    }
    100% {
      transform: rotate(-360deg) scale(1) skew(0deg); /* Smooth counterclockwise reset */
    }
  }
  .animate-shape-rotate {
    animation: shape-rotate 3s ease-in-out infinite;
  }
`}
</style>
{loading && !displayedResponse && (
  <div className="flex flex-col items-center justify-center p-6 sm:p-8 transition-all duration-300">
    {/* Loading Text */}
    <p className="mt-4 text-blue-500 font-semibold text-base sm:text-lg flex items-center">
      <Sparkles className="h-6 w-6 mr-2 animate-shape-rotate" />
      Reva is thinking...
    </p>
  </div>
)}
   
   
  </div>
)}




    </div>
  );
};

export default Conversation;