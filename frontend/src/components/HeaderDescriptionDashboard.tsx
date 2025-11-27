/**
 * HeaderDescriptionDashboard Component
 * Friendly and professional header with personalized greeting and loading support
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

interface HeaderDescriptionDashboardProps {
  userName: string
  isLoading?: boolean
}

/**
 * HeaderDescriptionDashboard - Personalized dashboard header with greeting
 * @author Thang Truong
 * @date 2025-11-27
 */
const HeaderDescriptionDashboard = ({ userName, isLoading = false }: HeaderDescriptionDashboardProps) => {
  /** Get greeting based on time of day - @author Thang Truong @date 2025-11-27 */
  const getGreeting = (): string => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  /** Get current date formatted - @author Thang Truong @date 2025-11-27 */
  const getCurrentDate = (): string => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      /* Loading skeleton for slow network */
      <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="h-8 bg-white/20 rounded w-64 mb-3 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 bg-white/20 rounded w-full max-w-md animate-pulse"></div>
              <div className="h-4 bg-white/20 rounded w-3/4 max-w-sm animate-pulse"></div>
            </div>
          </div>
          <div className="flex flex-col items-start lg:items-end gap-2">
            <div className="h-10 bg-white/20 rounded-lg w-48 animate-pulse"></div>
            <div className="h-3 bg-white/20 rounded w-32 animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    /* Dashboard header with personalized greeting and description */
    <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Greeting and description */}
        <div>
          <h1 className="text-2xl lg:text-2xl font-medium mb-2">
            {getGreeting()}, {userName}! 👋
          </h1>
          <p className="text-sm lg:text-base max-w-2xl">
            Welcome to your Project Tracker dashboard. Here you can monitor your projects,
            track tasks, and stay updated with team activities. Let's make today productive!
          </p>
        </div>

        {/* Date and quick info */}
        <div className="flex flex-col items-start lg:items-end gap-2">
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium">{getCurrentDate()}</span>
          </div>
          <p className="text-xs">Your real-time project overview</p>
        </div>
      </div>
    </div>
  )
}

export default HeaderDescriptionDashboard
