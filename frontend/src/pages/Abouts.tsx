import bannerImage from '../assets/banner.png'

interface TechHighlight {
  area: string
  summary: string
  items: string[]
}

/**
 * Abouts Page
 * Public-facing about page highlighting technical implementation
 * Displays the hero section, technology stack, philosophy, and developer info
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
function Abouts() {
  /**
   * Technology highlights data
   * Defines the three main technology areas: Frontend, Backend, and Dev Experience
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  const techHighlights: TechHighlight[] = [
    {
      area: 'Frontend',
      summary: 'Composable React 18 experience powered by TypeScript and Apollo Client.',
      items: [
        'React 18 + Vite for rapid development',
        'TypeScript for type-safe, maintainable code',
        'Apollo Client with GraphQL subscriptions',
        'Tailwind CSS utility-first styling',
        'React Hook Form for reliable validation'
      ],
    },
    {
      area: 'Backend',
      summary: 'Node.js GraphQL API delivering secure, real-time data.',
      items: [
        'Apollo Server 4 with executable schema',
        'MySQL relational data with optimized queries',
        'JWT authentication with refresh token rotation',
        'Custom PubSub over graphql-ws for live comments'
      ],
    },
    {
      area: 'Dev Experience',
      summary: 'Tooling crafted to keep iteration fast and safe.',
      items: [
        'ESLint + TypeScript strict mode',
        'Deployed to Vercel with serverless architecture',
        'MySQL database hosted on Hostinger',
        'Reusable UI components < 250 lines',
        'Toast-driven UX feedback patterns',
        'Async/await enforced for every client action'
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white py-10 px-4 sm:px-6 lg:px-10">
      {/* Abouts page container */}
      <div className="max-w-6xl mx-auto space-y-10">
        <section className="rounded-3xl shadow-xl bg-white border border-gray-200 p-8 sm:p-12">
          {/* Hero intro section */}
          <div className="flex flex-col gap-6">
            <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Project Tracker</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Building reliable delivery pipelines for modern product teams
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl">
              Crafted by developers for developers, this platform blends React, GraphQL, and MySQL into a cohesive toolkit that keeps teams aligned across projects, tasks, and real-time collaboration.
            </p>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-10">
          {/* Technical stack overview */}
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">Technologies That Power Project Tracker</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              Every feature—from project boards to live comment notifications—is backed by a carefully selected stack focused on performance, readability, and operational excellence.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {techHighlights.map((highlight) => (
              <article key={highlight.area} className="h-full rounded-2xl border border-gray-100 p-6 flex flex-col bg-gradient-to-b from-white to-gray-50">
                {/* Individual tech highlight */}
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    {highlight.area}
                  </span>
                  <p className="text-sm text-gray-500 mt-2">{highlight.summary}</p>
                </div>
                <ul className="space-y-3 mt-auto">
                  {highlight.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl p-8 sm:p-10 shadow-xl border border-blue-100">
          {/* Developer philosophy section */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-900">Why we built it this way</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Human-centered collaboration</h4>
                <p className="text-sm text-gray-700">
                  Real-time likes, comments, and membership guardrails maintain respectful spaces while keeping owners and members in sync.
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Operational excellence</h4>
                <p className="text-sm text-gray-700">
                  GraphQL resolvers are optimized to avoid N+1 pitfalls, and every client mutation leans on async/await to keep flows predictable.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-10">
          {/* Meet the developer section */}
          <div className="grid gap-6 md:grid-cols-2 items-center">
            <div className="rounded-2xl  p-3 mx-6">
              <img
                src={bannerImage}
                alt="Thang Truong portrait and workspace"
                className="w-full h-60 sm:h-72 object-cover rounded-xl"
              />
            </div>
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Meet the Developer</p>
              <h3 className="text-2xl font-semibold text-gray-900">Thang Truong</h3>
              <p className="text-sm text-gray-600">
                I built Project Tracker on my own to demonstrate how I approach full-stack problem solving - from thoughtful React
                interfaces to resilient GraphQL services - so potential employers can see my craft in action.
              </p>
              <p className="text-sm text-gray-600">
                Every decision here showcases the calm, professional experience I aim to deliver on real teams - predictable async flows,
                approachable UI, and backend code that stays clear under pressure.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Abouts

