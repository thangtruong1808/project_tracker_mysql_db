/**
 * App Component
 * Main application component with routing and providers
 * Uses code-splitting for optimal bundle size
 *
 * @author Thang Truong
 * @date 2025-12-09
 */

import { Suspense, lazy } from 'react'
import { ApolloProvider } from '@apollo/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { client } from './lib/apollo'
import { AuthProvider } from './context/AuthContext'
import { PusherProvider } from './context/PusherContext'
import { ToastProvider } from './hooks/useToast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import DashboardProtectedRoute from './components/DashboardProtectedRoute'
import ToastContainer from './components/ToastContainer'
import TokenExpirationHandler from './components/TokenExpirationHandler'
import TokenStatusPoller from './components/TokenStatusPoller'

// Lazy load page components for code-splitting
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Projects = lazy(() => import('./pages/Projects'))
const ProjectsPublic = lazy(() => import('./pages/ProjectsPublic'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))
const Abouts = lazy(() => import('./pages/Abouts'))
const Search = lazy(() => import('./pages/Search'))
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage'))
const Users = lazy(() => import('./pages/Users'))
const Tags = lazy(() => import('./pages/Tags'))
const Tasks = lazy(() => import('./pages/Tasks'))
const Comments = lazy(() => import('./pages/Comments'))
const Notifications = lazy(() => import('./pages/Notifications'))
const Activity = lazy(() => import('./pages/Activity'))
const Team = lazy(() => import('./pages/Team'))

/**
 * Loading fallback component
 *
 * @author Thang Truong
 * @date 2025-12-04
 */
const PageLoadingFallback = () => (
  /* Loading skeleton for lazy-loaded pages */
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-white shadow-lg border border-gray-100">
      <span className="inline-flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
      <span className="text-sm text-gray-600">Loading...</span>
    </div>
  </div>
)

/**
 * App Component
 * Main application entry point with routing and code-splitting
 *
 * @author Thang Truong
 * @date 2025-12-04
 * @returns JSX element containing the application structure
 */
function App() {
  return (
    /* Main Application Container */
    <ApolloProvider client={client}>
      <AuthProvider>
        <PusherProvider>
          <ToastProvider>
            <TokenStatusPoller />
            <Router>
            <div className="min-h-screen bg-gray-50">
              <TokenExpirationHandler />
              <Suspense fallback={<PageLoadingFallback />}>
                <Routes>
                  {/* Routes without navbar */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />

                  {/* Dashboard routes with sidebar layout (no navbar) */}
                  <Route path="/dashboard" element={<DashboardProtectedRoute />}>
                    <Route index element={<Dashboard />} />
                    <Route path="users" element={<Users />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="tasks" element={<Tasks />} />
                    <Route path="comments" element={<Comments />} />
                    <Route path="team" element={<Team />} />
                    <Route path="tags" element={<Tags />} />
                    <Route path="activity" element={<Activity />} />
                    <Route path="notifications" element={<Notifications />} />
                  </Route>

                  {/* Routes with navbar and footer */}
                  <Route
                    path="/"
                    element={
                      <div className="flex flex-col min-h-screen">
                        <Navbar />
                        <main className="flex-grow">
                          <Suspense fallback={<PageLoadingFallback />}>
                            <Home />
                          </Suspense>
                        </main>
                        <Footer />
                      </div>
                    }
                  />
                  <Route
                    path="/projects"
                    element={
                      <div className="flex flex-col min-h-screen">
                        <Navbar />
                        <main className="flex-grow">
                          <Suspense fallback={<PageLoadingFallback />}>
                            <ProjectsPublic />
                          </Suspense>
                        </main>
                        <Footer />
                      </div>
                    }
                  />
                  <Route
                    path="/projects/:id"
                    element={
                      <div className="flex flex-col min-h-screen">
                        <Navbar />
                        <main className="flex-grow">
                          <Suspense fallback={<PageLoadingFallback />}>
                            <ProjectDetail />
                          </Suspense>
                        </main>
                        <Footer />
                      </div>
                    }
                  />
                  <Route
                    path="/about"
                    element={
                      <div className="flex flex-col min-h-screen">
                        <Navbar />
                        <main className="flex-grow">
                          <Suspense fallback={<PageLoadingFallback />}>
                            <Abouts />
                          </Suspense>
                        </main>
                        <Footer />
                      </div>
                    }
                  />
                  <Route
                    path="/search"
                    element={
                      <div className="flex flex-col min-h-screen">
                        <Navbar />
                        <main className="flex-grow">
                          <Suspense fallback={<PageLoadingFallback />}>
                            <Search />
                          </Suspense>
                        </main>
                        <Footer />
                      </div>
                    }
                  />
                  <Route
                    path="/search-results"
                    element={
                      <div className="flex flex-col min-h-screen">
                        <Navbar />
                        <main className="flex-grow">
                          <Suspense fallback={<PageLoadingFallback />}>
                            <SearchResultsPage />
                          </Suspense>
                        </main>
                        <Footer />
                      </div>
                    }
                  />
                  <Route
                    path="/abouts"
                    element={
                      <div className="flex flex-col min-h-screen">
                        <Navbar />
                        <main className="flex-grow">
                          <Suspense fallback={<PageLoadingFallback />}>
                            <Abouts />
                          </Suspense>
                        </main>
                        <Footer />
                      </div>
                    }
                  />
                </Routes>
              </Suspense>
              <ToastContainer />
              </div>
            </Router>
          </ToastProvider>
        </PusherProvider>
      </AuthProvider>
    </ApolloProvider>
  )
}

export default App
