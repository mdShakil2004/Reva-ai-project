import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

const ImageResult = ({ imageData, loading, darkMode }) => {
 

  if (imageData===null) {
  
    return null;
  }




const handleDownload = () => {
    const link = document.createElement('a');
    if (imageData.image_url) {
      // For Cloudinary URL
      link.href = imageData.image_url;
      link.download = `reva-ai-image-${imageData.prompt.slice(0, 20).replace(/\s+/g, '-')}.png`;
    } else {
      // Fallback for old base64
      link.href = `data:image/png;base64,${imageData.image_base64}`;
      link.download = `reva-ai-image-${imageData.prompt.slice(0, 20).replace(/\s+/g, '-')}.png`;
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="relative group">
        <img
          src={imageData.image_url || `data:image/png;base64,${imageData.image_base64}`} // Use URL if available
          alt={imageData.prompt}
          className={`w-full rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-[1.02] border-2 ${
            darkMode ? 'border-cyan-500/30' : 'border-pink-500/30'
          }`}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
      </div>
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={handleDownload}
          className={`flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            darkMode
              ? 'bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500'
              : 'bg-pink-600 text-white hover:bg-pink-700 focus:ring-pink-500'
          }`}
          title="Download Image"
        >
          <FontAwesomeIcon icon={faDownload} className="mr-2" />
          Download
        </button>
      </div>
    </div>
  );
};

export default ImageResult;