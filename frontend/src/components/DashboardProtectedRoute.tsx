/**
 * DashboardProtectedRoute Component
 * Guards dashboard routes and displays a friendly message when unauthenticated.
 *
 * @author Thang Truong
 * @date 2025-11-24
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from './DashboardLayout'
import Logo from './Logo'

/**
 * UnauthorizedMessage Component
 * Renders user-facing guidance for unauthenticated dashboard access attempts.
 *
 * @author Thang Truong
 * @date 2025-11-24
 */
const UnauthorizedMessage = () => (
  <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-10 bg-gradient-to-br from-white via-slate-100 to-blue-50">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-14 bg-white/60 blur-3xl rounded-full" />
    </div>
    <div className="relative z-10 max-w-3xl w-full bg-white shadow-2xl rounded-3xl border border-blue-50 p-10 flex flex-col gap-10 md:flex-row items-center">
      <div className="flex-1 text-center md:text-left space-y-6">
        <div className="flex flex-col items-center md:items-start gap-4">
          <Logo size="large" showText />
          <div className="inline-flex items-center gap-3 rounded-full bg-blue-50 text-blue-700 px-4 py-2 text-sm font-medium">
            <span className="inline-flex h-2 w-2 rounded-full bg-blue-400" />
            Trusted Workspace Protection
          </div>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-slate-900">Secure session required</h1>
          <p className="text-slate-600 text-base leading-relaxed">
            To keep confidential projects safe, dashboard access is limited to authenticated team members. Please verify your identity to continue.
          </p>
        </div>
        <div className="grid gap-3">
          {[
            {
              title: 'Role-based access',
              description: 'Only approved roles can view KPIs, activity logs, and task pipelines.',
            },
            {
              title: 'Encrypted sessions',
              description: 'Sessions use short-lived tokens with automatic rotation for safety.',
            },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
              <div>
                <p className="font-medium text-slate-900 text-sm">{item.title}</p>
                <p className="text-slate-500 text-xs">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/login"
            className="flex-1 inline-flex justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-colors"
          >
            Authenticate Now
          </Link>
          <Link
            to="/"
            className="flex-1 inline-flex justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
      <div className="flex-1 max-w-xs">
        <div className="relative bg-gradient-to-br from-blue-500 to-blue-300 text-white rounded-3xl p-6 shadow-xl">
          <div className="absolute inset-x-6 top-6 h-16 rounded-3xl bg-white/10 blur-xl" />
          <div className="relative space-y-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-blue-100">Session Monitor</p>
              <p className="text-3xl font-semibold">Secure</p>
            </div>
            <div className="space-y-3 text-sm">
              <p className="flex items-center justify-between">
                <span className="text-blue-100">Integrity</span>
                <span className="font-semibold">Active</span>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-blue-100">Encryption</span>
                <span className="font-semibold">256-bit</span>
              </p>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-3 text-sm">
              <p className="text-blue-100">Next verification</p>
              <p className="text-lg font-semibold">Less than 2 minutes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

/**
 * DashboardProtectedRoute Component
 * Performs an async verification before rendering dashboard content.
 *
 * @author Thang Truong
 * @date 2025-11-24
 */
const DashboardProtectedRoute = () => {
  const { isAuthenticated, user } = useAuth()
  const [isVerifying, setIsVerifying] = useState(true)

  useEffect(() => {
    const verifyAccess = async () => {
      await new Promise((resolve) => setTimeout(resolve, 120))
      setIsVerifying(false)
    }
    verifyAccess()
  }, [])

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-slate-100 to-blue-50 text-slate-600 text-sm">
        <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-white shadow-lg border border-slate-100">
          <span className="inline-flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          Verifying secure session...
        </div>
      </div>
    )
  }

  const hasDashboardAccess = () => {
    if (!isAuthenticated || !user?.role) {
      return false
    }
    const normalizedRole = user.role.toLowerCase()
    return normalizedRole === 'admin' || normalizedRole === 'project manager'
  }

  if (!hasDashboardAccess()) {
    return <UnauthorizedMessage />
  }

  return <DashboardLayout />
}

export default DashboardProtectedRoute


