import React from 'react';
import { useNavigate } from 'react-router-dom';

const Button = ({ children, onClick, variant = 'primary' }) => {
  const baseStyles = "px-6 py-3 rounded-lg font-medium text-white hover-scale focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-300";
  const variantStyles = variant === 'primary' 
    ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500" 
    : "bg-gray-600 hover:bg-gray-700 focus:ring-gray-500";
  
  return (
    <button 
      className={`${baseStyles} ${variantStyles}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="text-center max-w-md animate-fadeIn">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <h1 className="text-[12rem] font-extrabold text-blue-500 opacity-10 tracking-tighter">404</h1>
            <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-white">Oops!</h2>
          </div>
        </div>

        <h2 className="text-3xl font-semibold text-white mb-4">Page Not Found</h2>
        <p className="text-gray-300 mb-8 leading-relaxed">
          The page you're looking for seems to have wandered off. Let's get you back on track!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => window.history?.back()}
            variant="secondary"
          >
            Go Back
          </Button>
          <Button 
            onClick={handleGoHome}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;