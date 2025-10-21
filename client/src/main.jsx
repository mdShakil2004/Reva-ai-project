import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import React from 'react'
import './index.css'
import App from './App.jsx'
import { SearchProvider } from './context/SearchContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <SearchProvider>
    {/* <ErrorBoundary darkMode={true}> */}
      <App />
    {/* </ErrorBoundary> */}
  </SearchProvider>
  </BrowserRouter>,
)
