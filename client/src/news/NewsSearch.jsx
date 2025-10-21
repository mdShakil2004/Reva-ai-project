import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNewspaper, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const NewsSearch = ({ query, darkMode,setIsNewsData }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Replace with your GNews API key
  const API_KEY = import.meta.env.VITE_GNEWS_API_KEY; 
 
  useEffect(() => {
    if (!query) return;

    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=10&apikey=${API_KEY}`
        );
        const data = await response.json();
        if (data.articles) {
          setArticles(data.articles);
          setIsNewsData(true)
        } else {
          setError(data.errors?.join(', ') || 'Failed to fetch news articles');
          setIsNewsData(false)
        }
      } catch (err) {
        setError('Error fetching news. Please check your API key or try again later.');
        setIsNewsData(false)
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <FontAwesomeIcon icon={faNewspaper} className="text-2xl text-blue-500" />
        <h2 className="text-xl font-bold">News Results for "{query}"</h2>
      </div>
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-500">Loading news articles...</p>
        </div>
      )}
      {error && (
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'}`}>
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
          {error}
        </div>
      )}
      {!loading && !error && articles.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FontAwesomeIcon icon={faNewspaper} className="text-3xl mb-2" />
          <p>No news articles found for "{query}"</p>
        </div>
      )}
      {!loading && !error && articles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.map((article, index) => (
            <a
              key={index}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-4 rounded-xl cursor-pointer transition-all hover:shadow-md ${darkMode ? 'bg-[#1E1E1E] hover:bg-[#252525]' : 'bg-white hover:bg-gray-50 border border-gray-200'}`}
            >
              <div className="flex space-x-3">
                {article.image && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {article.title}
                  </h3>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {article.description || 'No description available'}
                  </p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <span>{article.source.name}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
      

    </div>
  );
};

export default NewsSearch;