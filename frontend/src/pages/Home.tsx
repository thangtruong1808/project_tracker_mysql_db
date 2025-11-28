/**
 * Home Page
 * Landing page with hero section, features, and call-to-action
 * Displays personalized content based on authentication status
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import TechStackSection from '../components/TechStackSection'

/**
 * Home Component
 * Main landing page showcasing Project Tracker features
 * Shows loading skeleton only when network is slow, otherwise renders immediately
 *
 * @author Thang Truong
 * @date 2025-11-27
 * @returns JSX element containing home page content
 */
const Home = () => {
  const { isAuthenticated, user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  /** Detect slow network and show skeleton only when needed - @author Thang Truong @date 2025-11-27 */
  useEffect(() => {
    const startTime = performance.now()
    const checkLoadTime = async (): Promise<void> => {
      // Wait a short time to detect slow network
      await new Promise(resolve => setTimeout(resolve, 150))
      const loadTime = performance.now() - startTime
      
      // Only show skeleton if network is slow (load time > 200ms)
      // Otherwise render immediately for fast networks
      if (loadTime > 200) {
        // Network is slow, show skeleton briefly
        await new Promise(resolve => setTimeout(resolve, 300))
      }
      setIsLoading(false)
    }
    checkLoadTime()
  }, [])

  if (isLoading) {
    return (
      /* Loading skeleton for slow network */
      <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
        {/* Hero section skeleton */}
        <section className="max-w-6xl mx-auto pt-8 pb-16 animate-pulse">
          <div className="text-center">
            <div className="h-8 bg-gray-200 rounded-full w-48 mx-auto mb-6"></div>
            <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-12 bg-gray-200 rounded w-2/3 mx-auto mb-6"></div>
            <div className="space-y-2 mb-8">
              <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="h-12 bg-gray-200 rounded-lg w-40"></div>
              <div className="h-12 bg-gray-200 rounded-lg w-40"></div>
            </div>
          </div>
        </section>

        {/* Features section skeleton */}
        <section className="max-w-6xl mx-auto py-12 animate-pulse">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-10">
            <div className="text-center mb-10">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech stack section skeleton */}
        <section className="max-w-6xl mx-auto py-12 animate-pulse">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-10">
            <div className="text-center mb-10">
              <div className="h-6 bg-gray-200 rounded-full w-24 mx-auto mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <div key={i} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    /* Home page container - consistent background with other pages */
    <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto pt-8 pb-16">
        <div className="text-center">
          {/* Welcome Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            {isAuthenticated ? `Welcome back, ${user?.firstName || 'Team Member'}!` : 'Streamline Your Workflow'}
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Manage Projects with
            <span className="text-blue-600"> Clarity & Confidence</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Project Tracker helps teams organize tasks, collaborate in real-time, and deliver projects on schedule. Built for modern teams who value simplicity and efficiency.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Link to="/projects" className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-blue-700 transition-colors shadow-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  Browse Projects
                </Link>
                <Link to="/dashboard" className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-lg text-base font-semibold hover:bg-gray-50 transition-colors shadow-md border border-gray-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                  Go to Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-blue-700 transition-colors shadow-md">
                  Get Started Free
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </Link>
                <Link to="/login" className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-lg text-base font-semibold hover:bg-gray-50 transition-colors shadow-md border border-gray-200">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Everything You Need to Succeed</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Powerful features designed to help your team stay organized, communicate effectively, and deliver exceptional results.</p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Project Management Card */}
            <div className="bg-gradient-to-b from-white to-gray-50 p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Management</h3>
              <p className="text-gray-600 text-sm">Create, organize, and track projects with intuitive status workflows.</p>
            </div>

            {/* Task Tracking Card */}
            <div className="bg-gradient-to-b from-white to-gray-50 p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Task Tracking</h3>
              <p className="text-gray-600 text-sm">Break down work into manageable tasks with priorities and due dates.</p>
            </div>

            {/* Team Collaboration Card */}
            <div className="bg-gradient-to-b from-white to-gray-50 p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Collaboration</h3>
              <p className="text-gray-600 text-sm">Assign team members, share comments, and keep everyone aligned.</p>
            </div>

            {/* Real-time Notifications Card */}
            <div className="bg-gradient-to-b from-white to-gray-50 p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Updates</h3>
              <p className="text-gray-600 text-sm">Stay informed with instant notifications when projects change.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <TechStackSection />
    </div>
  )
}

export default Home
