import React, { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RiVoiceAiLine } from "react-icons/ri";

import { 
 
  faTimes, 
  faPaperPlane, 
  faPaperclip, 
  faFilePdf, 
  faFileCsv, 
  faFileCode, 
  faFile, 
  faFilePowerpoint, 
  faFileWord 
} from '@fortawesome/free-solid-svg-icons';
import "../style/searchInput.css";

const SearchInput = ({
  inputValue,
  setInputValue,
  handleSubmit,
  darkMode,
  setShowVoiceInteraction,
  selectedFiles, setSelectedFiles, filePreviews, setFilePreviews,resetFileInput,fileInputRef,handleTextToImage,
  searchType, setSearchType



}) => {
  
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  

  // Reset file input to clear previous selection
 

  // Map file extensions to FontAwesome icons
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return faFilePdf;
      case 'csv':
        return faFileCsv;
      case 'ppt':
      case 'pptx':
        return faFilePowerpoint;
      case 'doc':
      case 'docx':
        return faFileWord;
      case 'html':
      case 'htm':
      case 'css':
      case 'scss':
      case 'sass':
      case 'less':
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
      case 'vue':
      case 'astro':
      case 'svelte':
      case 'ejs':
      case 'hbs':
      case 'java':
      case 'py':
      case 'rb':
      case 'php':
      case 'c':
      case 'h':
      case 'cpp':
      case 'cc':
      case 'cs':
      case 'go':
      case 'rs':
      case 'swift':
      case 'kt':
      case 'kts':
      case 'scala':
      case 'dart':
      case 'pl':
      case 'sh':
      case 'bash':
      case 'zsh':
      case 'ps1':
      case 'json':
      case 'xml':
      case 'yaml':
      case 'yml':
      case 'toml':
      case 'ini':
      case 'env':
      case 'cfg':
      case 'md':
      case 'markdown':
      case 'rst':
      case 'tex':
      case 'sql':
      case 'graphql':
      case 'gql':
      case 'gradle':
      case 'maven':
      case 'pom':
      case 'lock':
      case 'package':
      case 'babel':
      case 'webpack':
      case 'vite':
      case 'rollup':
        return faFileCode;
      default:
        return faFile;
    }
  };

  // Drag-and-Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) {
      setError('Please drop valid files');
      return;
    }
    const newPreviews = files.map((file) => ({
      name: file.name,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      icon: !file.type.startsWith('image/') ? getFileIcon(file.name) : null,
    }));
    setFilePreviews((prev) => [...prev, ...newPreviews]);
    setSelectedFiles((prev) => [...prev, ...files]);
    setError(null);
    resetFileInput();
  }, [resetFileInput]);




  const handleRemoveFile = (index) => {
    setFilePreviews((prev) => {
      const newPreviews = [...prev];
      if (newPreviews[index].preview) {
        URL.revokeObjectURL(newPreviews[index].preview);
      }
      newPreviews.splice(index, 1);
      return newPreviews;
    });
    setSelectedFiles((prev) => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
    if (selectedFiles.length === 1) setInputValue('');
    resetFileInput();
  };












 



 const handleFormSubmit = (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (searchType === "image") {
    handleTextToImage(e);
  } 
  
  
  
  else {
    // ✅ Let Chat.jsx handle all: text-only, text+docs, docs-only
    handleSubmit(e);
  }
};


  const triggerFileInput = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (fileInputRef.current) {
      resetFileInput();
      fileInputRef.current.click();
    }
  }, [fileInputRef, resetFileInput]);



const handleFileChange = (e) => {
  const newFiles = Array.from(e.target.files);

  setSelectedFiles((prev) => {
    const existing = new Map(prev.map(f => [f.name + f.size, f]));
    newFiles.forEach(f => existing.set(f.name + f.size, f));
    return Array.from(existing.values());
  });

  // Update previews too
  const newPreviews = newFiles.map((file) => ({
    name: file.name,
    type: file.type,
    preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    icon: !file.type.startsWith('image/') ? getFileIcon(file.name) : null,
  }));

  setFilePreviews((prev) => [...prev, ...newPreviews]);
};





  return (
    <>
      {filePreviews.length > 0 && (
        <div className="mt-3 ml-2 flex flex-wrap gap-3 justify-start">
          {filePreviews.map((item, index) => (
            <div key={`${item.name}-${index}`} className="relative flex flex-col items-center">
              {item.preview ? (
                <img
                  src={item.preview}
                  alt={`Preview ${index + 1}`}
                  className={`w-14 h-14 object-cover rounded-lg border ${
                    darkMode ? 'border-cyan-500/50' : 'border-pink-500/50'
                  } shadow-[0_0_8px_rgba(34,211,238,0.3)]`}
                />
              ) : (
                <div className={`w-14 h-14 flex items-center justify-center rounded-lg border ${
                  darkMode ? 'border-cyan-500/50' : 'border-pink-500/50'
                } shadow-[0_0_8px_rgba(34,211,238,0.3)]`}>
                  <FontAwesomeIcon icon={item.icon} className="text-cyan-400 text-2xl" />
                </div>
              )}
              <p className="text-xs mt-1 truncate w-14 text-center">{item.name}</p>
              <button
                onClick={() => handleRemoveFile(index)}
                className="absolute -top-2 -right-2 p-1.5 bg-red-600/80 text-white rounded-full hover:bg-red-700/90 backdrop-blur-sm transition-all duration-300"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xs" />
              </button>
            </div>
          ))}
        </div>
      )}
      <form
        onSubmit={handleFormSubmit}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`space-y-3 rounded-2xl transition-all duration-400 ${
          darkMode
            ? 'bg-gray-900/60 border border-cyan-500/40 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.4)]'
            : 'bg-white/80 border border-pink-500/40 backdrop-blur-md shadow-[0_0_15px_rgba(236,72,153,0.3)]'
        } ${isDragging ? 'border-2 border-dashed border-cyan-400 animate-particle-border' : ''} p-4 w-full max-w-[870px]`}
      >
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Reva AI anything..."
            className={`w-full py-3 pl-5 pr-14 rounded-2xl border-none outline-none text-base font-medium ${
              darkMode
                ? 'bg-transparent text-cyan-200 placeholder-cyan-400/60'
                : 'bg-transparent text-gray-900 placeholder-pink-400/60'
            } focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300`}
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg bg-cyan-500/30 hover:bg-cyan-500/50 transition-all duration-300"
          >
            <FontAwesomeIcon icon={faPaperPlane} className="text-cyan-400 text-base" />
          </button>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <label htmlFor="file-upload" className="cursor-pointer group">
              <div
                className={`w-9 h-9 flex items-center justify-center rounded-lg ${
                  darkMode ? 'bg-cyan-500/50 border-cyan-500/50' : 'bg-pink-500/50 border-pink-500/50'
                } border group-hover:border-cyan-400 group-hover:scale-110 shadow-[0_0_10px_rgba(34,211,238,0.3)] transition-all duration-300`}
                onClick={triggerFileInput}
              >
                <FontAwesomeIcon icon={faPaperclip} className="text-cyan-400 group-hover:text-cyan-300" />
              </div>
              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                accept="image/*,.pdf,.csv,.ppt,.pptx,.doc,.docx,.html,.htm,.css,.scss,.sass,.less,.js,.jsx,.ts,.tsx,.vue,.astro,.svelte,.ejs,.hbs,.java,.py,.rb,.php,.c,.h,.cpp,.cc,.cs,.go,.rs,.swift,.kt,.kts,.scala,.dart,.pl,.sh,.bash,.zsh,.ps1,.json,.xml,.yaml,.yml,.toml,.ini,.env,.cfg,.md,.markdown,.rst,.tex,.sql,.graphql,.gql,.gradle,.maven,.pom,.lock,.package,.babel,.webpack,.vite,.rollup"
                className="hidden"
              />
            </label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className={`${
                darkMode
                  ? 'bg-gray-900/50 text-cyan-200 border-cyan-500/40'
                  : 'bg-white/90 text-gray-900 border-pink-500/40'
              } border rounded-lg px-2 py-2 text-sm font-medium focus:ring-2 focus:ring-cyan-400/50 backdrop-blur-sm transition-all duration-300`}
            >
              <option value="none">General Search</option>
              <option value="image">Text to Image</option>
              
            </select>
          </div>
          <div className="flex mr-2 gap-3">
            <button
              type="button"
              onClick={() => setShowVoiceInteraction(true)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg bg-gradient-to-br ${
                darkMode
                  ? 'from-cyan-700 to-pink-700'
                  : 'from-cyan-500 to-pink-500'
              } text-white shadow-[0_0_10px_rgba(34,211,238,0.4)] hover:shadow-[0_0_15px_rgba(34,211,238,0.7)] hover:scale-110 transition-all duration-300`}
              title="Voice Input"
            >
              {/* <FontAwesomeIcon icon={faMicrophone}  /> */}
              <RiVoiceAiLine className="text-base" />
            </button>
          </div>
        </div>
        {error && (
          <div
            className={`mt-3 p-3 rounded-lg ${
              darkMode
                ? 'bg-red-900/50 text-red-200 border-red-500/40'
                : 'bg-red-100/90 text-red-800 border-red-500/40'
            } backdrop-blur-sm text-sm font-medium`}
          >
            {error}
          </div>
        )}
      </form>
    </>
  );
};

export default SearchInput;