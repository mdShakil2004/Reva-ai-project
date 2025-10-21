import React, { useState, useEffect } from 'react';
import '../style/SuggestionChips.css'
const SuggestionChips = ({ setInputValue, handleSubmit, darkMode }) => {
  const suggestions = [
    "What's the latest global news today?",
    "What are the newest AI breakthroughs?",
    "How can I improve my mental health?",
    "Explain quantum computing simply",
    "Show me trending tech news",
    "What are effective daily exercise routines?",
    "Compare renewable energy sources",
    "Tips for better work-life balance",
    "What are the top health trends in 2025?",
    "Summarize recent climate change reports",
    "What's the latest on space exploration?",
    "How to start a meditation practice?",
    "What are the benefits of a plant-based diet?",
    "Explain blockchain technology in simple terms",
    "What are the top cybersecurity threats in 2025?",
    "How to manage stress effectively?",
    "What's new in electric vehicle technology?",
    "Tips for improving sleep quality",
    "What are the latest advancements in robotics?",
    "How to create a budget for beginners?",
    "What's the latest on global economic trends?",
    "How to boost productivity while working from home?",
    "What are the health benefits of yoga?",
    "Explain 5G technology and its impacts",
    "What's new in virtual reality tech?",
    "How to maintain a healthy work-life balance?",
    "What are the top fitness apps in 2025?",
    "Summarize recent breakthroughs in medical research",
    "How to start investing in stocks?",
    "What's the latest on renewable energy policies?",
    "Tips for reducing screen time",
    "What are the benefits of intermittent fasting?",
    "Explain edge computing in simple terms",
    "What's new in wearable health tech?",
    "How to develop a morning routine?",
    "What are the latest trends in sustainable fashion?",
    "How to improve focus and concentration?",
    "What's the latest on autonomous vehicles?",
    "What are the benefits of mindfulness?",
    "Explain the metaverse and its future",
    "How to plan a healthy meal prep?",
    "What's the latest in AI ethics debates?",
    "Tips for managing anxiety naturally",
    "What are the top tech startups in 2025?",
    "How to create a minimalist lifestyle?",
    "What's the latest on global health initiatives?",
    "How to improve public speaking skills?",
    "What are the latest trends in smart homes?",
    "Tips for staying motivated daily",
    "What's the latest in gene-editing technology?"
  ];

  const [currentSet, setCurrentSet] = useState(0);
  const itemsPerSet = 10;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSet((prev) => (prev + 1) % Math.ceil(suggestions.length / itemsPerSet));
    }, 20000); // Match set cycle to animation duration (20s)
    return () => clearInterval(interval);
  }, []);

  const displayedSuggestions = suggestions.slice(
    currentSet * itemsPerSet,
    (currentSet + 1) * itemsPerSet
  );

  // Generate random direction for each chip
  const getRandomDirection = () => (Math.random() > 0.5 ? 'right-to-left' : 'left-to-right');

  return (
    <div className="relative top-[-2rem] left-1/2 transform -translate-x-1/2 flex flex-wrap justify-center gap-2 px-4 overflow-hidden">
      {displayedSuggestions.map((suggestion, idx) => (
        <button
          key={`${currentSet}-${idx}`}
          onClick={() => {
            setInputValue(suggestion);
            setTimeout(() => handleSubmit({ preventDefault: () => {} }), 100);
          }}
          className={`px-4 py-2 rounded-full text-sm transition-colors cursor-pointer whitespace-nowrap animate-chip-${getRandomDirection()} ${
            darkMode
              ? 'bg-[#1E1E1E] hover:bg-[#252525] text-gray-300'
              : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
          }`}
        >
          {suggestion}
        </button>
      ))}
      
    </div>
  );
};

export default SuggestionChips;