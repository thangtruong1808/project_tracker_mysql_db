/**
 * Application Entry Point
 * Renders the main App component into the DOM
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

/**
 * Initialize and render the React application
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  /* Root React Application Container */
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

