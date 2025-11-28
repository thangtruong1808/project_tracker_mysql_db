/**
 * Abouts Page
 * Public-facing about page highlighting technical implementation
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

import { useState, useEffect } from 'react'
import bannerImage from '../assets/banner.png'

interface TechHighlight {
  area: string
  summary: string
  items: string[]
}

/**
 * Abouts Page Component
 * Shows loading skeleton only when network is slow, otherwise renders immediately
 * @author Thang Truong
 * @date 2025-11-27
 */
function Abouts() {
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

  /** Technology highlights data - @author Thang Truong @date 2025-11-27 */
  const techHighlights: TechHighlight[] = [
    {
      area: 'Frontend',
      summary: 'Composable React 18 experience powered by TypeScript and Apollo Client.',
      items: ['React 18 + Vite for rapid development', 'TypeScript for type-safe, maintainable code', 'Apollo Client with GraphQL subscriptions', 'Tailwind CSS utility-first styling', 'React Hook Form for reliable validation'],
    },
    {
      area: 'Backend',
      summary: 'Node.js GraphQL API delivering secure, real-time data.',
      items: ['Apollo Server 4 with executable schema', 'MySQL relational data with optimized queries', 'JWT authentication with refresh token rotation', 'Custom PubSub over graphql-ws for live updates'],
    },
    {
      area: 'Dev Experience',
      summary: 'Tooling crafted to keep iteration fast and safe.',
      items: ['ESLint + TypeScript strict mode', 'Deployed to Vercel with serverless architecture', 'MySQL database hosted on Hostinger', 'Reusable UI components < 250 lines', 'Toast-driven UX feedback patterns', 'Async/await enforced for every client action'],
    },
  ]

  /** Real-time features implemented - @author Thang Truong @date 2025-11-27 */
  const realtimeFeatures = [
    { name: 'Live Comments', desc: 'Real-time comment creation, updates, and deletions on projects' },
    { name: 'Comment Likes', desc: 'Instant like/unlike updates across all connected clients' },
    { name: 'Notifications', desc: 'Push notifications for project activities and team interactions' },
  ]

  if (isLoading) {
    return (
      /* Loading skeleton for slow network */
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white py-10 px-4 sm:px-6 lg:px-10">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="rounded-3xl shadow-xl bg-white border border-gray-200 p-8 sm:p-12 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="mt-6 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-10 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto mb-8"></div>
            <div className="grid gap-6 lg:grid-cols-3">
              {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>)}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-xl border border-blue-100 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>)}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-10 animate-pulse">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-72 bg-gray-200 rounded-xl"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-6 bg-gray-200 rounded w-40"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    /* Abouts page container */
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white py-10 px-4 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Hero intro section with real-time features */}
        <section className="rounded-3xl shadow-xl bg-white border border-gray-200 p-8 sm:p-12">
          <div className="flex flex-col gap-6">
            <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Project Tracker</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Building reliable delivery pipelines for modern product teams
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl">
              Crafted by developers for developers, this platform blends React, GraphQL, and MySQL into a cohesive toolkit that keeps teams aligned across projects, tasks, and real-time collaboration.
            </p>

            {/* Real-time features section */}
            <div className="mt-4 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Real-Time Features
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {realtimeFeatures.map((feature, i) => (
                  <div key={i} className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{feature.name}</h4>
                    <p className="text-xs text-gray-600">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Technical stack overview */}
        <section className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">Technologies That Power Project Tracker</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              Every feature—from project boards to live comment notifications—is backed by a carefully selected stack focused on performance, readability, and operational excellence.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {techHighlights.map((h) => (
              <article key={h.area} className="h-full rounded-2xl border border-gray-100 p-6 flex flex-col bg-gradient-to-b from-white to-gray-50">
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{h.area}</span>
                  <p className="text-sm text-gray-500 mt-2">{h.summary}</p>
                </div>
                <ul className="space-y-3 mt-auto">
                  {h.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* Developer philosophy section */}
        <section className="bg-white rounded-2xl p-8 sm:p-10 shadow-xl border border-blue-100">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-900">Why we built it this way</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Human-centered collaboration</h4>
                <p className="text-sm text-gray-700">Real-time likes, comments, and membership guardrails maintain respectful spaces while keeping owners and members in sync.</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Operational excellence</h4>
                <p className="text-sm text-gray-700">GraphQL resolvers are optimized to avoid N+1 pitfalls, and every client mutation leans on async/await to keep flows predictable.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Meet the developer section */}
        <section className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-10">
          <div className="grid gap-6 md:grid-cols-2 items-center">
            <div className="rounded-2xl p-3 mx-6">
              <img src={bannerImage} alt="Thang Truong portrait and workspace" className="w-full h-60 sm:h-72 object-cover rounded-xl" />
            </div>
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Meet the Developer</p>
              <h3 className="text-2xl font-semibold text-gray-900">Thang Truong</h3>
              <p className="text-sm text-gray-600">I built Project Tracker on my own to demonstrate how I approach full-stack problem solving - from thoughtful React interfaces to resilient GraphQL services - so potential employers can see my craft in action.</p>
              <p className="text-sm text-gray-600">Every decision here showcases the calm, professional experience I aim to deliver on real teams - predictable async flows, approachable UI, and backend code that stays clear under pressure.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Abouts
