/**
 * App Component
 * Main application component with routing and providers
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { ApolloProvider } from '@apollo/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { client } from './lib/apollo'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './hooks/useToast'
import Navbar from './components/Navbar'
import DashboardProtectedRoute from './components/DashboardProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectsPublic from './pages/ProjectsPublic'
import ProjectDetail from './pages/ProjectDetail'
import Abouts from './pages/Abouts'
import Search from './pages/Search'
import SearchResultsPage from './pages/SearchResultsPage'
import Users from './pages/Users'
import Tags from './pages/Tags'
import Tasks from './pages/Tasks'
import Notifications from './pages/Notifications'
import Activity from './pages/Activity'
import Team from './pages/Team'
import ToastContainer from './components/ToastContainer'
import TokenExpirationHandler from './components/TokenExpirationHandler'
import TokenStatusPoller from './components/TokenStatusPoller'

/**
 * App Component
 * Main application entry point with routing
 * 
 * @returns JSX element containing the application structure
 */
function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <ToastProvider>
          <TokenStatusPoller />
          <Router>
            <div className="min-h-screen bg-gray-50">
              <TokenExpirationHandler />
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
                  <Route path="team" element={<Team />} />
                  <Route path="tags" element={<Tags />} />
                  <Route path="activity" element={<Activity />} />
                  <Route path="notifications" element={<Notifications />} />
                </Route>

                {/* Routes with navbar */}
                <Route
                  path="/"
                  element={
                    <>
                      <Navbar />
                      <Home />
                    </>
                  }
                />
                <Route
                  path="/projects"
                  element={
                    <>
                      <Navbar />
                      <ProjectsPublic />
                    </>
                  }
                />
                <Route
                  path="/projects/:id"
                  element={
                    <>
                      <Navbar />
                      <ProjectDetail />
                    </>
                  }
                />
                <Route
                  path="/about"
                  element={
                    <>
                      <Navbar />
                      <Abouts />
                    </>
                  }
                />
                <Route
                  path="/search"
                  element={
                    <>
                      <Navbar />
                      <Search />
                    </>
                  }
                />
                <Route
                  path="/search-results"
                  element={
                    <>
                      <Navbar />
                      <SearchResultsPage />
                    </>
                  }
                />
                <Route
                  path="/abouts"
                  element={
                    <>
                      <Navbar />
                      <Abouts />
                    </>
                  }
                />
              </Routes>
              <ToastContainer />
            </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ApolloProvider>
  )
}

export default App
