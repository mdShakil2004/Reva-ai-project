import React, { useEffect, useState } from 'react';

const NewsSuggestion = ({ setInputValue, handleSubmit, darkMode }) => {
  const allSuggestions = [
    "Show me the latest political news",
    "What are today’s top stories?",
    "Give me live sports news updates",
    "Trending technology news headlines",
    "What’s happening in world news?",
    "Latest updates on business news",
    "Health news from trusted sources",
    "Entertainment news highlights today",
    "Breaking news in India right now",
    "Tell me current finance news",
    "Show me economic news worldwide",
    "Weather news updates for today",
    "Top headlines from the tech industry",
    "Get the latest science news",
    "Environmental news today",
    "Latest market crash updates",
    "AI in news: what’s trending?",
    "Space exploration news this week",
    "International sports events coverage",
    "Celebrity news and gossip",
    "Top YouTube news videos today",
    "Political debates in the news",
    "Daily COVID-19 news updates",
    "What’s hot in startup news?",
    "Viral news on Twitter today",
    "Top stories in global politics",
    "Live cricket news and scores",
    "India's economic report today",
    "Stock market latest headlines",
    "News updates from NASA",
    "Latest news from the White House",
    "Asia-Pacific regional news",
    "UN global conference news",
    "Breaking story: global trade",
    "Medical research news today",
    "Today's news on cryptocurrency",
    "Trending health tips in the news",
    "Recession fears in business news",
    "New film trailer release news",
    "What’s going on in parliament?",
    "Latest job market news",
    "News on climate change policies",
    "Breaking warzone reports today",
    "Education system updates in news",
    "News stories from rural India",
    "News about mobile tech releases",
    "What’s trending in global finance?",
    "Live sports scores & match news",
    "News on electric vehicle industry",
    "Tech company layoff news today"
  ];

  const [startIndex, setStartIndex] = useState(0);

  // Rotate suggestions every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStartIndex(prev => (prev + 5) % allSuggestions.length);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [allSuggestions.length]);

  // Get 5 suggestions based on current startIndex
  const suggestions = allSuggestions.slice(startIndex, startIndex + 11);

  return (
    <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto px-4">
      {suggestions.map((suggestion, idx) => (
        <button
          key={idx}
          onClick={() => {
            setInputValue(suggestion);
            setTimeout(() => handleSubmit({ preventDefault: () => {} }), 100);
          }}
          className={`px-4 py-2 rounded-full text-md transition-all duration-300 ease-in-out cursor-pointer whitespace-nowrap ${
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

export default NewsSuggestion;
