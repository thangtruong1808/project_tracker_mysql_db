/**
 * Application Entry Point
 * Renders the main App component into the DOM
 * Includes error boundary to catch initialization errors
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

/**
 * Error boundary component for initialization errors
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {
    // Error logged but not displayed to user per requirements
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600">Please refresh the page to try again.</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Initialize and render the React application
 * Wrapped in error boundary to catch initialization errors
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  /* Root React Application Container */
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
