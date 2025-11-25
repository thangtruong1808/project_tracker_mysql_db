/**
 * GraphQL Queries
 * Defines all GraphQL query operations
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { gql } from '@apollo/client'

/**
 * Refresh token status query
 * Checks refresh token expiration status from HTTP-only cookie
 * Returns whether token is valid, time remaining, and if it's about to expire
 */
export const REFRESH_TOKEN_STATUS_QUERY = gql`
  query RefreshTokenStatus {
    refreshTokenStatus {
      isValid
      timeRemaining
      isAboutToExpire
    }
  }
`

/**
 * Projects query
 * Fetches all projects for the authenticated user
 * Returns list of projects with id, name, description, status, owner, likes count, comments count, and timestamps
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
export const PROJECTS_QUERY = gql`
  query Projects {
    projects {
      id
      name
      description
      status
      owner {
        id
        firstName
        lastName
        email
        role
      }
      likesCount
      commentsCount
      isLiked
      createdAt
      updatedAt
    }
  }
`

/**
 * Project query
 * Fetches a single project by ID with owner, tasks, members, likes count, and comments count
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @param id - The project ID to fetch
 */
export const PROJECT_QUERY = gql`
  query Project($id: ID!) {
    project(id: $id) {
      id
      name
      description
      status
      owner {
        id
        firstName
        lastName
        email
        role
      }
      likesCount
      commentsCount
      isLiked
      tasks {
        id
        uuid
        title
        description
        status
        priority
        dueDate
        projectId
        assignedTo
        owner {
          id
          firstName
          lastName
          email
          role
        }
        tags {
          id
          name
          description
          category
        }
        likesCount
        commentsCount
        isLiked
        createdAt
        updatedAt
      }
      members {
        id
        projectId
        projectName
        userId
        memberName
        memberEmail
        role
        createdAt
        updatedAt
      }
      comments {
        id
        uuid
        content
        taskId
        user {
          id
          firstName
          lastName
          email
        }
        likesCount
        isLiked
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`

/**
 * Users query
 * Fetches all users from the database
 * Returns list of users with id, uuid, firstName, lastName, email, role, and timestamps
 */
export const USERS_QUERY = gql`
  query Users {
    users {
      id
      uuid
      firstName
      lastName
      email
      role
      createdAt
      updatedAt
    }
  }
`

/**
 * Tags query
 * Fetches all tags from the database
 * Returns list of tags with id, name, description, title, type, category, and timestamps
 */
export const TAGS_QUERY = gql`
  query Tags {
    tags {
      id
      name
      description
      title
      type
      category
      createdAt
      updatedAt
    }
  }
`

/**
 * Tasks query
 * Fetches all tasks from the database
 * Returns list of tasks with id, uuid, title, description, status, priority, dueDate, projectId, assignedTo, tags, and timestamps
 *
 * @author Thang Truong
 * @date 2025-11-25
 */
export const TASKS_QUERY = gql`
  query Tasks {
    tasks {
      id
      uuid
      title
      description
      status
      priority
      dueDate
      projectId
      assignedTo
      tags {
        id
        name
        description
        category
      }
      createdAt
      updatedAt
    }
  }
`

/**
 * Notifications query
 * Fetches all notifications from the database
 * Returns list of notifications with id, userId, message, isRead, and timestamps
 */
export const NOTIFICATIONS_QUERY = gql`
  query Notifications {
    notifications {
      id
      userId
      message
      isRead
      createdAt
      updatedAt
    }
  }
`

/**
 * Activities query
 * Fetches all activity logs from the database
 * Returns list of activity logs with relational identifiers, action, type, metadata, and timestamps
 */
export const ACTIVITIES_QUERY = gql`
  query Activities {
    activities {
      id
      userId
      targetUserId
      projectId
      taskId
      action
      type
      metadata
      createdAt
      updatedAt
    }
  }
`

/**
 * Activity query
 * Fetches a single activity log by ID
 * @param id - The activity log ID to fetch
 */
export const ACTIVITY_QUERY = gql`
  query Activity($id: ID!) {
    activity(id: $id) {
      id
      userId
      targetUserId
      projectId
      taskId
      action
      type
      metadata
      createdAt
      updatedAt
    }
  }
`

/**
 * Team members query
 * Fetches all project members for the dashboard team page
 * Returns member, project, role, and timestamps
 */
export const TEAM_MEMBERS_QUERY = gql`
  query TeamMembers {
    teamMembers {
      id
      projectId
      projectName
      userId
      memberName
      memberEmail
      role
      createdAt
      updatedAt
    }
  }
`

/**
 * Dashboard search query
 * Retrieves projects and tasks matching drawer filters
 */
export const SEARCH_DASHBOARD_QUERY = gql`
  query SearchDashboard($input: SearchDashboardInput!) {
    searchDashboard(input: $input) {
      projects {
        id
        name
        status
        description
        owner {
          id
          firstName
          lastName
          email
          role
        }
        likesCount
        commentsCount
        isLiked
        updatedAt
      }
      tasks {
        id
        title
        status
        projectId
        description
        owner {
          id
          firstName
          lastName
          email
          role
        }
        likesCount
        commentsCount
        isLiked
        updatedAt
      }
      projectTotal
      taskTotal
    }
  }
`

