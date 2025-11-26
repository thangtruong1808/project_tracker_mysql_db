/**
 * GraphQL Main Index
 * Central export point for all GraphQL operations
 * Organized by feature modules for better maintainability
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

// Feature module re-exports
export * from './auth'
export * from './users'
export * from './projects'
export * from './tasks'
export * from './tags'
export * from './comments'
export * from './notifications'
export * from './activities'
export * from './team'
export * from './search'

// Legacy exports for backward compatibility
export * from './mutations'
export * from './queries'
export * from './subscriptions'

