import React, { createContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Create the SearchContext
export const SearchContext = createContext();

// SearchProvider to manage state and actions for search functionality
export const SearchProvider = ({ children }) => {
  // State for JWT token, initialized from localStorage
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  // const [isImageSearch, setIsImageSearch] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAuthenticated,setIsAuthenticated] =useState(false)
  // Ref for file input to share between components
   const [userLoginData,setUserLoginData]=useState("")
   const fileInputRef = useRef(null);

  const backend_url = import.meta.env.VITE_BACKEND_URL; 




  
  // Check token validity on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          // Send a request to a protected endpoint to verify token
      const response=await axios.get(`${backend_url}/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          // Token is valid, keep it
          
          if(response.statusText==="OK")
          {  
            setUserLoginData(response)
            

            setIsAuthenticated(true);
          }


        } catch (error) {
         
          localStorage.removeItem('token');
          setToken('');
        }
      }
    };
    verifyToken();
  }, [token]);

  // console.log("imageTextSearch ", imageTextSearch);
  // console.log("setIsImageSearch ", isImageSearch);
  // Context value
  const contextValue = {
    token,
    setToken,
    // imageTextSearch,
    // setImageTextSearch,
     showLoginModal, setShowLoginModal,isAuthenticated,setIsAuthenticated,
     fileInputRef,setUserLoginData,userLoginData

  };

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
};