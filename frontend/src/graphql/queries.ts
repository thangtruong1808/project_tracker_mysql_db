/**
 * GraphQL Queries Index
 * Re-exports all queries from feature modules
 * Maintains backward compatibility while organizing by features
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

// Auth queries
export { REFRESH_TOKEN_STATUS_QUERY } from './auth'

// Users queries
export { USERS_QUERY } from './users'

// Projects queries
export { PROJECTS_QUERY, PROJECT_QUERY } from './projects'

// Tasks queries
export { TASKS_QUERY } from './tasks'

// Tags queries
export { TAGS_QUERY } from './tags'

// Notifications queries
export { NOTIFICATIONS_QUERY } from './notifications'

// Activities queries
export { ACTIVITIES_QUERY, ACTIVITY_QUERY } from './activities'

// Team queries
export { TEAM_MEMBERS_QUERY } from './team'

// Search queries
export { SEARCH_DASHBOARD_QUERY } from './search'
