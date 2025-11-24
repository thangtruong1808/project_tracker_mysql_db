/**
 * GraphQL Resolvers
 * Handles all GraphQL queries and mutations
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { db } from './db'
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  generateRefreshTokenId,
  hashRefreshToken,
  hashPassword,
  verifyRefreshToken,
  calculateRefreshTokenExpiry,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  parseTimeStringToSeconds,
} from './utils/auth'
import {
  REFRESH_TOKEN_DIALOG_THRESHOLD_SECONDS,
  REFRESH_TOKEN_EXPIRY,
} from './constants/auth'
import { v4 as uuidv4 } from 'uuid'

const DEFAULT_PROJECT_STATUSES = ['PLANNING', 'IN_PROGRESS', 'COMPLETED']
const DEFAULT_TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE']
const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 50

/**
 * Build SQL status filter clause based on selected statuses.
 *
 * @author Thang Truong
 * @date 2025-11-24
 */
const buildStatusFilterClause = (column: string, statuses: string[], values: any[]) => {
  if (!statuses || statuses.length === 0) {
    return ''
  }
  const placeholders = statuses.map(() => '?').join(', ')
  values.push(...statuses)
  return ` AND ${column} IN (${placeholders})`
}

/**
 * Clamp page size between defaults to avoid excessive payloads.
 *
 * @author Thang Truong
 * @date 2025-11-24
 */
const clampPageSize = (value?: number | null) => {
  if (!value || value <= 0) {
    return DEFAULT_PAGE_SIZE
  }
  return Math.min(value, MAX_PAGE_SIZE)
}

/**
 * Clamp page number to a minimum of 1.
 *
 * @author Thang Truong
 * @date 2025-11-24
 */
const clampPageNumber = (value?: number | null) => {
  if (!value || value <= 0) {
    return 1
  }
  return value
}

/**
 * Apply keyword and status filters to a base SQL query.
 *
 * @author Thang Truong
 * @date 2025-11-24
 */
const applySearchFilters = (
  baseSql: string,
  searchTerm: string,
  statuses: string[],
  values: any[],
  textColumns: string[]
) => {
  let sql = baseSql
  if (searchTerm && textColumns.length > 0) {
    const likeClause = textColumns.map((column) => `${column} LIKE ?`).join(' OR ')
    sql += ` AND (${likeClause})`
    const likeTerm = `%${searchTerm}%`
    textColumns.forEach(() => values.push(likeTerm))
  }
  sql += buildStatusFilterClause('status', statuses, values)
  return sql
}

const formatTeamDateToISO = (dateValue: any): string => {
  try {
    if (!dateValue) {
      return new Date().toISOString()
    }
    if (dateValue instanceof Date) {
      return dateValue.toISOString()
    }
    if (typeof dateValue === 'string') {
      const date = new Date(dateValue)
      return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
    }
    return new Date().toISOString()
  } catch {
    return new Date().toISOString()
  }
}

const formatTeamMemberName = (firstName?: string, lastName?: string) => {
  const parts = [firstName || '', lastName || ''].map((value) => value?.trim()).filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : 'Unknown Member'
}

const mapTeamMemberRecord = (member: any) => ({
  id: `${member.project_id}-${member.user_id}`,
  projectId: member.project_id.toString(),
  projectName: member.project_name || 'Unknown Project',
  userId: member.user_id.toString(),
  memberName: formatTeamMemberName(member.first_name, member.last_name),
  memberEmail: member.email || 'N/A',
  role: member.role || 'VIEWER',
  createdAt: formatTeamDateToISO(member.created_at),
  updatedAt: formatTeamDateToISO(member.updated_at),
})

const fetchTeamMemberRecord = async (projectId: string | number, userId: string | number) => {
  const rows = (await db.query(
    `SELECT
      pm.project_id,
      pm.user_id,
      pm.role,
      pm.created_at,
      pm.updated_at,
      p.name AS project_name,
      u.first_name,
      u.last_name,
      u.email
    FROM project_members pm
    INNER JOIN projects p ON p.id = pm.project_id
    INNER JOIN users u ON u.id = pm.user_id
    WHERE pm.project_id = ? AND pm.user_id = ?
    LIMIT 1`,
    [projectId, userId]
  )) as any[]

  if (rows.length === 0) {
    throw new Error('Team member not found')
  }

  return mapTeamMemberRecord(rows[0])
}

/**
 * Resolve a user-friendly action label for activity logs.
 * Falls back to predefined text when no custom action is stored.
 *
 * @author Thang Truong
 * @date 2025-11-24
 * @param type - Activity type enum value
 * @param customAction - Optional action text stored in DB
 * @returns Display-ready action string
 */
const resolveActivityAction = (type: string, customAction?: string | null): string => {
  if (customAction && customAction.trim()) {
    return customAction.trim()
  }

  const actionLabels: Record<string, string> = {
    USER_CREATED: 'User created',
    USER_UPDATED: 'User updated',
    USER_DELETED: 'User deleted',
    PROJECT_CREATED: 'Project created',
    PROJECT_UPDATED: 'Project updated',
    PROJECT_DELETED: 'Project deleted',
    TASK_CREATED: 'Task created',
    TASK_UPDATED: 'Task updated',
    TASK_DELETED: 'Task deleted',
  }

  return actionLabels[type] || 'Activity recorded'
}

export const resolvers = {
  Query: {
    hello: () => 'Hello from GraphQL!',
    /**
     * Projects query
     * Fetches all projects from the database (excluding deleted projects)
     * Returns list of projects with formatted dates
     *
     * @author Thang Truong
     * @date 2024-12-24
     * @returns Array of project objects
     */
    projects: async () => {
      const projects = (await db.query(
        'SELECT id, name, description, status, created_at, updated_at FROM projects WHERE is_deleted = false ORDER BY created_at DESC'
      )) as any[]
      /**
       * Convert MySQL DATETIME to ISO string for proper serialization
       */
      const formatDateToISO = (dateValue: any): string => {
        try {
          if (!dateValue) {
            return new Date().toISOString()
          }
          if (dateValue instanceof Date) {
            return dateValue.toISOString()
          }
          if (typeof dateValue === 'string') {
            const date = new Date(dateValue)
            return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
          }
          return new Date().toISOString()
        } catch (error) {
          return new Date().toISOString()
        }
      }
      return projects.map((project: any) => ({
        id: project.id.toString(),
        name: project.name,
        description: project.description,
        status: project.status,
        createdAt: formatDateToISO(project.created_at),
        updatedAt: formatDateToISO(project.updated_at),
      }))
    },
    /**
     * Team members query
     * Fetches all active project members with related user and project info
     *
     * @author Thang Truong
     * @date 2024-12-24
     * @returns Array of team member objects
     */
    teamMembers: async () => {
      const members = (await db.query(
        `SELECT
          pm.project_id,
          pm.user_id,
          pm.role,
          pm.created_at,
          pm.updated_at,
          p.name AS project_name,
          u.first_name,
          u.last_name,
          u.email
        FROM project_members pm
        INNER JOIN projects p ON p.id = pm.project_id
        INNER JOIN users u ON u.id = pm.user_id
        WHERE pm.is_deleted = false
        ORDER BY pm.created_at DESC`
      )) as any[]
      return members.map((member: any) => mapTeamMemberRecord(member))
    },
    /**
     * Search dashboard resources
     * Filters projects and tasks by keyword and status selections
     *
     * @author Thang Truong
     * @date 2025-11-24
     */
    searchDashboard: async (
      _: any,
      {
        input,
      }: {
        input: {
          query?: string
          projectStatuses?: string[]
          taskStatuses?: string[]
          projectPage?: number
          projectPageSize?: number
          taskPage?: number
          taskPageSize?: number
        }
      }
    ) => {
      const searchTerm = input?.query?.trim() || ''
      const projectStatuses = Array.isArray(input?.projectStatuses)
        ? input.projectStatuses.filter((status) => !!status)
        : []
      const taskStatuses = Array.isArray(input?.taskStatuses) ? input.taskStatuses.filter((status) => !!status) : []

      const projectPageSize = clampPageSize(input?.projectPageSize)
      const taskPageSize = clampPageSize(input?.taskPageSize)
      const projectPage = clampPageNumber(input?.projectPage)
      const taskPage = clampPageNumber(input?.taskPage)

      const shouldSearchProjects = Boolean(searchTerm) || projectStatuses.length > 0
      const shouldSearchTasks = Boolean(searchTerm) || taskStatuses.length > 0

      const projectValues: any[] = []
      let projectSql = applySearchFilters(
        'SELECT id, name, description, status, updated_at FROM projects WHERE is_deleted = false',
        searchTerm,
        projectStatuses,
        projectValues,
        ['name', 'description']
      )
      const projectOffset = (projectPage - 1) * projectPageSize
      projectSql += ` ORDER BY updated_at DESC LIMIT ${projectPageSize} OFFSET ${projectOffset}`

      const projectCountValues: any[] = []
      const projectCountSql = applySearchFilters(
        'SELECT COUNT(*) as total FROM projects WHERE is_deleted = false',
        searchTerm,
        projectStatuses,
        projectCountValues,
        ['name', 'description']
      )

      const taskValues: any[] = []
      let taskSql = applySearchFilters(
        'SELECT id, title, description, status, project_id, updated_at FROM tasks WHERE is_deleted = false',
        searchTerm,
        taskStatuses,
        taskValues,
        ['title', 'description']
      )
      const taskOffset = (taskPage - 1) * taskPageSize
      taskSql += ` ORDER BY updated_at DESC LIMIT ${taskPageSize} OFFSET ${taskOffset}`

      const taskCountValues: any[] = []
      const taskCountSql = applySearchFilters(
        'SELECT COUNT(*) as total FROM tasks WHERE is_deleted = false',
        searchTerm,
        taskStatuses,
        taskCountValues,
        ['title', 'description']
      )

      const [projects, projectCountResult, tasks, taskCountResult] = await Promise.all([
        shouldSearchProjects ? (db.query(projectSql, projectValues) as Promise<any[]>) : Promise.resolve([]),
        shouldSearchProjects
          ? (db.query(projectCountSql, projectCountValues) as Promise<any[]>)
          : Promise.resolve([{ total: 0 }]),
        shouldSearchTasks ? (db.query(taskSql, taskValues) as Promise<any[]>) : Promise.resolve([]),
        shouldSearchTasks ? (db.query(taskCountSql, taskCountValues) as Promise<any[]>) : Promise.resolve([{ total: 0 }]),
      ])

      const formatDateToISO = (dateValue: any): string => {
        try {
          if (!dateValue) {
            return new Date().toISOString()
          }
          if (dateValue instanceof Date) {
            return dateValue.toISOString()
          }
          if (typeof dateValue === 'string') {
            const date = new Date(dateValue)
            return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
          }
          return new Date().toISOString()
        } catch (error) {
          return new Date().toISOString()
        }
      }

      return {
        projects: projects.map((project) => ({
          id: project.id.toString(),
          name: project.name,
          status: project.status,
          description: project.description,
          updatedAt: formatDateToISO(project.updated_at),
        })),
        tasks: tasks.map((task) => ({
          id: task.id.toString(),
          title: task.title,
          status: task.status,
          projectId: task.project_id ? task.project_id.toString() : '',
          description: task.description,
          updatedAt: formatDateToISO(task.updated_at),
        })),
        projectTotal: Number(projectCountResult[0]?.total || 0),
        taskTotal: Number(taskCountResult[0]?.total || 0),
      }
    },
    /**
     * Project query
     * Fetches a single project by ID
     *
     * @author Thang Truong
     * @date 2024-12-24
     * @param id - Project ID to fetch
     * @returns Project object or null
     */
    project: async (_: any, { id }: { id: string }) => {
      const projects = (await db.query(
        'SELECT id, name, description, status, created_at, updated_at FROM projects WHERE id = ? AND is_deleted = false',
        [id]
      )) as any[]
      if (projects.length === 0) {
        return null
      }
      const project = projects[0]
      /**
       * Convert MySQL DATETIME to ISO string for proper serialization
       */
      const formatDateToISO = (dateValue: any): string => {
        try {
          if (!dateValue) {
            return new Date().toISOString()
          }
          if (dateValue instanceof Date) {
            return dateValue.toISOString()
          }
          if (typeof dateValue === 'string') {
            const date = new Date(dateValue)
            return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
          }
          return new Date().toISOString()
        } catch (error) {
          return new Date().toISOString()
        }
      }
      return {
        id: project.id.toString(),
        name: project.name,
        description: project.description,
        status: project.status,
        createdAt: formatDateToISO(project.created_at),
        updatedAt: formatDateToISO(project.updated_at),
      }
    },
    /**
     * Users query
     * Fetches all users from the database (excluding deleted users)
     * Returns list of users with id, uuid, firstName, lastName, email, and role
     *
     * @author Thang Truong
     * @date 2024-12-24
     * @returns Array of user objects
     */
    users: async () => {
      const users = (await db.query(
        'SELECT id, uuid, first_name, last_name, email, role, created_at, updated_at FROM users WHERE is_deleted = false ORDER BY created_at DESC'
      )) as any[]
      return users.map((user: any) => {
        /**
         * Convert MySQL DATETIME to ISO string for proper serialization
         * Handles both Date objects and string formats from MySQL
         * mysql2 library returns Date objects for DATETIME fields
         *
         * @param dateValue - Date value from MySQL (Date object or string)
         * @returns ISO string representation of the date
         */
        const formatDateToISO = (dateValue: any): string => {
          try {
            if (!dateValue) {
              return new Date().toISOString()
            }
            // mysql2 returns Date objects for DATETIME fields
            if (dateValue instanceof Date) {
              return dateValue.toISOString()
            }
            // If it's a string, parse and convert to ISO
            if (typeof dateValue === 'string') {
              // Handle MySQL DATETIME format: "YYYY-MM-DD HH:mm:ss.sss"
              const date = new Date(dateValue)
              if (isNaN(date.getTime())) {
                return new Date().toISOString()
              }
              return date.toISOString()
            }
            // Fallback to current date if unknown type
            return new Date().toISOString()
          } catch (error) {
            // Return current date as fallback if conversion fails
            return new Date().toISOString()
          }
        }

        return {
          id: user.id.toString(),
          uuid: user.uuid,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: user.role,
          createdAt: formatDateToISO(user.created_at),
          updatedAt: formatDateToISO(user.updated_at),
        }
      })
    },
    /**
     * Tags query
     * Fetches all tags from the database
     * Returns list of tags with formatted dates
     *
     * @author Thang Truong
     * @date 2024-12-24
     * @returns Array of tag objects
     */
    tags: async () => {
      const tags = (await db.query(
        'SELECT id, name, description, title, type, category, created_at, updated_at FROM tags ORDER BY created_at DESC'
      )) as any[]
      /**
       * Convert MySQL DATETIME to ISO string for proper serialization
       */
      const formatDateToISO = (dateValue: any): string => {
        try {
          if (!dateValue) {
            return new Date().toISOString()
          }
          if (dateValue instanceof Date) {
            return dateValue.toISOString()
          }
          if (typeof dateValue === 'string') {
            const date = new Date(dateValue)
            return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
          }
          return new Date().toISOString()
        } catch (error) {
          return new Date().toISOString()
        }
      }
      return tags.map((tag: any) => ({
        id: tag.id.toString(),
        name: tag.name,
        description: tag.description,
        title: tag.title,
        type: tag.type,
        category: tag.category,
        createdAt: formatDateToISO(tag.created_at),
        updatedAt: formatDateToISO(tag.updated_at),
      }))
    },
    /**
     * Tag query
     * Fetches a single tag by ID
     *
     * @author Thang Truong
     * @date 2024-12-24
     * @param id - Tag ID to fetch
     * @returns Tag object or null
     */
    tag: async (_: any, { id }: { id: string }) => {
      const tags = (await db.query(
        'SELECT id, name, description, title, type, category, created_at, updated_at FROM tags WHERE id = ?',
        [id]
      )) as any[]
      if (tags.length === 0) {
        return null
      }
      const tag = tags[0]
      /**
       * Convert MySQL DATETIME to ISO string for proper serialization
       */
      const formatDateToISO = (dateValue: any): string => {
        try {
          if (!dateValue) {
            return new Date().toISOString()
          }
          if (dateValue instanceof Date) {
            return dateValue.toISOString()
          }
          if (typeof dateValue === 'string') {
            const date = new Date(dateValue)
            return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
          }
          return new Date().toISOString()
        } catch (error) {
          return new Date().toISOString()
        }
      }
      return {
        id: tag.id.toString(),
        name: tag.name,
        description: tag.description,
        title: tag.title,
        type: tag.type,
        category: tag.category,
        createdAt: formatDateToISO(tag.created_at),
        updatedAt: formatDateToISO(tag.updated_at),
      }
    },
    /**
     * Tasks query
     * Fetches all tasks from the database
     * Returns list of tasks with formatted dates
     *
     * @author Thang Truong
     * @date 2024-12-24
     * @returns Array of task objects
     */
    tasks: async () => {
      const tasks = (await db.query(
        'SELECT id, uuid, title, description, status, priority, due_date, project_id, assigned_to, created_at, updated_at FROM tasks WHERE is_deleted = false ORDER BY created_at DESC'
      )) as any[]
      /**
       * Convert MySQL DATETIME to ISO string for proper serialization
       */
      const formatDateToISO = (dateValue: any): string => {
        try {
          if (!dateValue) {
            return new Date().toISOString()
          }
          if (dateValue instanceof Date) {
            return dateValue.toISOString()
          }
          if (typeof dateValue === 'string') {
            const date = new Date(dateValue)
            return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
          }
          return new Date().toISOString()
        } catch (error) {
          return new Date().toISOString()
        }
      }
      /**
       * Format date to ISO string or return null
       */
      const formatDateOrNull = (dateValue: any): string | null => {
        if (!dateValue) {
          return null
        }
        return formatDateToISO(dateValue)
      }
      /**
       * Format DATE field (not DATETIME) to YYYY-MM-DD string or return null
       * DATE fields should be returned as date-only strings without time
       */
      const formatDateOnly = (dateValue: any): string | null => {
        if (!dateValue) {
          return null
        }
        try {
          if (dateValue instanceof Date) {
            const year = dateValue.getFullYear()
            const month = String(dateValue.getMonth() + 1).padStart(2, '0')
            const day = String(dateValue.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
          }
          if (typeof dateValue === 'string') {
            // If it's already in YYYY-MM-DD format, return as-is
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
              return dateValue
            }
            // Otherwise parse and format
            const date = new Date(dateValue)
            if (!isNaN(date.getTime())) {
              const year = date.getUTCFullYear()
              const month = String(date.getUTCMonth() + 1).padStart(2, '0')
              const day = String(date.getUTCDate()).padStart(2, '0')
              return `${year}-${month}-${day}`
            }
          }
          return null
        } catch (error) {
          return null
        }
      }
      return tasks.map((task: any) => ({
        id: task.id.toString(),
        uuid: task.uuid,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.due_date ? formatDateOnly(task.due_date) : null,
        projectId: task.project_id.toString(),
        assignedTo: task.assigned_to ? task.assigned_to.toString() : null,
        createdAt: formatDateToISO(task.created_at),
        updatedAt: formatDateToISO(task.updated_at),
      }))
    },
    /**
     * Task query
     * Fetches a single task by ID
     *
     * @author Thang Truong
     * @date 2024-12-24
     * @param id - Task ID to fetch
     * @returns Task object or null
     */
    task: async (_: any, { id }: { id: string }) => {
      const tasks = (await db.query(
        'SELECT id, uuid, title, description, status, priority, due_date, project_id, assigned_to, created_at, updated_at FROM tasks WHERE id = ? AND is_deleted = false',
        [id]
      )) as any[]
      if (tasks.length === 0) {
        return null
      }
      const task = tasks[0]
      /**
       * Convert MySQL DATETIME to ISO string for proper serialization
       */
      const formatDateToISO = (dateValue: any): string => {
        try {
          if (!dateValue) {
            return new Date().toISOString()
          }
          if (dateValue instanceof Date) {
            return dateValue.toISOString()
          }
          if (typeof dateValue === 'string') {
            const date = new Date(dateValue)
            return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
          }
          return new Date().toISOString()
        } catch (error) {
          return new Date().toISOString()
        }
      }
      /**
       * Format date to ISO string or return null
       */
      const formatDateOrNull = (dateValue: any): string | null => {
        if (!dateValue) {
          return null
        }
        return formatDateToISO(dateValue)
      }
      /**
       * Format DATE field (not DATETIME) to YYYY-MM-DD string or return null
       * DATE fields should be returned as date-only strings without time
       */
      const formatDateOnly = (dateValue: any): string | null => {
        if (!dateValue) {
          return null
        }
        try {
          if (dateValue instanceof Date) {
            const year = dateValue.getFullYear()
            const month = String(dateValue.getMonth() + 1).padStart(2, '0')
            const day = String(dateValue.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
          }
          if (typeof dateValue === 'string') {
            // If it's already in YYYY-MM-DD format, return as-is
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
              return dateValue
            }
            // Otherwise parse and format
            const date = new Date(dateValue)
            if (!isNaN(date.getTime())) {
              const year = date.getUTCFullYear()
              const month = String(date.getUTCMonth() + 1).padStart(2, '0')
              const day = String(date.getUTCDate()).padStart(2, '0')
              return `${year}-${month}-${day}`
            }
          }
          return null
        } catch (error) {
          return null
        }
      }
      return {
        id: task.id.toString(),
        uuid: task.uuid,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.due_date ? formatDateOnly(task.due_date) : null,
        projectId: task.project_id.toString(),
        assignedTo: task.assigned_to ? task.assigned_to.toString() : null,
        createdAt: formatDateToISO(task.created_at),
        updatedAt: formatDateToISO(task.updated_at),
      }
    },
    /**
     * Notifications query
     * Fetches all notifications from the database
     * Returns list of notifications with formatted dates
     *
     * @author Thang Truong
     * @date 2024-12-24
     * @returns Array of notification objects
     */
    notifications: async () => {
      const notifications = (await db.query(
        'SELECT id, user_id, message, is_read, created_at, updated_at FROM notifications ORDER BY created_at DESC'
      )) as any[]
      /**
       * Convert MySQL DATETIME to ISO string for proper serialization
       */
      const formatDateToISO = (dateValue: any): string => {
        try {
          if (!dateValue) {
            return new Date().toISOString()
          }
          if (dateValue instanceof Date) {
            return dateValue.toISOString()
          }
          if (typeof dateValue === 'string') {
            const date = new Date(dateValue)
            return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
          }
          return new Date().toISOString()
        } catch (error) {
          return new Date().toISOString()
        }
      }
      return notifications.map((notification: any) => ({
        id: notification.id.toString(),
        userId: notification.user_id.toString(),
        message: notification.message,
        isRead: Boolean(notification.is_read),
        createdAt: formatDateToISO(notification.created_at),
        updatedAt: formatDateToISO(notification.updated_at),
      }))
    },
    /**
     * Notification query
     * Fetches a single notification by ID
     *
     * @author Thang Truong
     * @date 2024-12-24
     * @param id - Notification ID to fetch
     * @returns Notification object or null
     */
    notification: async (_: any, { id }: { id: string }) => {
      const notifications = (await db.query(
        'SELECT id, user_id, message, is_read, created_at, updated_at FROM notifications WHERE id = ?',
        [id]
      )) as any[]
      if (notifications.length === 0) {
        return null
      }
      const notification = notifications[0]
      /**
       * Convert MySQL DATETIME to ISO string for proper serialization
       */
      const formatDateToISO = (dateValue: any): string => {
        try {
          if (!dateValue) {
            return new Date().toISOString()
          }
          if (dateValue instanceof Date) {
            return dateValue.toISOString()
          }
          if (typeof dateValue === 'string') {
            const date = new Date(dateValue)
            return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
          }
          return new Date().toISOString()
        } catch (error) {
          return new Date().toISOString()
        }
      }
      return {
        id: notification.id.toString(),
        userId: notification.user_id.toString(),
        message: notification.message,
        isRead: Boolean(notification.is_read),
        createdAt: formatDateToISO(notification.created_at),
        updatedAt: formatDateToISO(notification.updated_at),
      }
    },
    /**
     * Activities query
     * Fetches all activity logs from the database
     * Provides audit trail data for dashboard table
     *
     * @author Thang Truong
     * @date 2024-12-24
     * @returns Array of activity log objects
     */
    activities: async () => {
      const activities = (await db.query(
        `SELECT
          al.id,
          al.user_id,
          COALESCE(al.target_user_id, t.assigned_to) AS target_user_id,
          al.project_id,
          al.task_id,
          al.action,
          al.type,
          al.metadata,
          al.created_at,
          al.updated_at
        FROM activity_logs AS al
        LEFT JOIN tasks AS t ON al.task_id = t.id
        ORDER BY al.created_at DESC`
      )) as any[]
      /**
       * Convert MySQL DATETIME to ISO string for proper serialization
       */
      const formatDateToISO = (dateValue: any): string => {
        try {
          if (!dateValue) {
            return new Date().toISOString()
          }
          if (dateValue instanceof Date) {
            return dateValue.toISOString()
          }
          if (typeof dateValue === 'string') {
            const date = new Date(dateValue)
            return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
          }
          return new Date().toISOString()
        } catch (error) {
          return new Date().toISOString()
        }
      }
      /**
       * Convert metadata JSON to string for UI display
       */
      const formatMetadata = (metadataValue: any): string | null => {
        if (metadataValue === null || metadataValue === undefined) {
          return null
        }
        if (typeof metadataValue === 'string') {
          return metadataValue
        }
        try {
          return JSON.stringify(metadataValue)
        } catch (error) {
          return null
        }
      }
      return activities.map((activity: any) => ({
        id: activity.id.toString(),
        userId: activity.user_id ? activity.user_id.toString() : '',
        targetUserId: activity.target_user_id ? activity.target_user_id.toString() : null,
        projectId: activity.project_id ? activity.project_id.toString() : null,
        taskId: activity.task_id ? activity.task_id.toString() : null,
        action: resolveActivityAction(activity.type, activity.action),
        type: activity.type,
        metadata: formatMetadata(activity.metadata),
        createdAt: formatDateToISO(activity.created_at),
        updatedAt: formatDateToISO(activity.updated_at),
      }))
    },
    /**
     * Activity query
     * Fetches a single activity log by ID
     *
     * @author Thang Truong
     * @date 2024-12-24
     * @param id - Activity log ID to fetch
     * @returns Activity log object or null
     */
    activity: async (_: any, { id }: { id: string }) => {
      const activities = (await db.query(
        `SELECT
          al.id,
          al.user_id,
          COALESCE(al.target_user_id, t.assigned_to) AS target_user_id,
          al.project_id,
          al.task_id,
          al.action,
          al.type,
          al.metadata,
          al.created_at,
          al.updated_at
        FROM activity_logs AS al
        LEFT JOIN tasks AS t ON al.task_id = t.id
        WHERE al.id = ?`,
        [id]
      )) as any[]
      if (activities.length === 0) {
        return null
      }
      const activity = activities[0]
      /**
       * Convert MySQL DATETIME to ISO string for proper serialization
       */
      const formatDateToISO = (dateValue: any): string => {
        try {
          if (!dateValue) {
            return new Date().toISOString()
          }
          if (dateValue instanceof Date) {
            return dateValue.toISOString()
          }
          if (typeof dateValue === 'string') {
            const date = new Date(dateValue)
            return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
          }
          return new Date().toISOString()
        } catch (error) {
          return new Date().toISOString()
        }
      }
      /**
       * Convert metadata JSON to string for UI display
       */
      const formatMetadata = (metadataValue: any): string | null => {
        if (metadataValue === null || metadataValue === undefined) {
          return null
        }
        if (typeof metadataValue === 'string') {
          return metadataValue
        }
        try {
          return JSON.stringify(metadataValue)
        } catch (error) {
          return null
        }
      }
      return {
        id: activity.id.toString(),
        userId: activity.user_id ? activity.user_id.toString() : '',
        targetUserId: activity.target_user_id ? activity.target_user_id.toString() : null,
        projectId: activity.project_id ? activity.project_id.toString() : null,
        taskId: activity.task_id ? activity.task_id.toString() : null,
        action: resolveActivityAction(activity.type, activity.action),
        type: activity.type,
        metadata: formatMetadata(activity.metadata),
        createdAt: formatDateToISO(activity.created_at),
        updatedAt: formatDateToISO(activity.updated_at),
      }
    },
    /**
     * Refresh token status query
     * Checks refresh token expiration status from HTTP-only cookie
     * Returns whether token is valid, time remaining, and if it's about to expire
     * 
     * @author Thang Truong
     * @date 2024-12-24
     * @param context - GraphQL context containing request object
     * @returns Refresh token status information
     */
    refreshTokenStatus: async (_: any, __: any, context: { req: any }) => {
      try {
        // Get refresh token from HTTP-only cookie
        const refreshToken = context.req.cookies?.refreshToken
        if (!refreshToken) {
          return {
            isValid: false,
            timeRemaining: null,
            isAboutToExpire: false,
          }
        }

        // Check if refresh token exists in database
        const tokenHash = hashRefreshToken(refreshToken)
        const tokens = (await db.query(
          'SELECT * FROM refresh_tokens WHERE token_hash = ? AND expires_at > NOW() AND is_revoked = false',
          [tokenHash]
        )) as any[]

        if (tokens.length === 0) {
          return {
            isValid: false,
            timeRemaining: null,
            isAboutToExpire: false,
          }
        }

        const tokenRecord = tokens[0]
        
        // Calculate elapsed time since refresh token creation (count from zero)
        // created_at is stored when refresh token is first created
        const createdAt = new Date(tokenRecord.created_at)
        const currentTime = new Date()
        const elapsedMs = currentTime.getTime() - createdAt.getTime()
        const elapsedSeconds = Math.floor(elapsedMs / 1000)
        
        // Parse REFRESH_TOKEN_EXPIRY to get total lifetime in seconds
        const refreshTokenExpirySeconds = parseTimeStringToSeconds(REFRESH_TOKEN_EXPIRY)
        
        // Calculate time remaining: REFRESH_TOKEN_EXPIRY - elapsed time
        const timeRemainingSeconds = Math.max(0, refreshTokenExpirySeconds - elapsedSeconds)
        
        // Check if token is about to expire
        // Dialog should appear when elapsed time >= (REFRESH_TOKEN_EXPIRY - REFRESH_TOKEN_DIALOG_THRESHOLD_SECONDS)
        // Which means: timeRemaining <= REFRESH_TOKEN_DIALOG_THRESHOLD_SECONDS
        const isAboutToExpire = elapsedSeconds >= (refreshTokenExpirySeconds - REFRESH_TOKEN_DIALOG_THRESHOLD_SECONDS) && elapsedSeconds < refreshTokenExpirySeconds

        return {
          isValid: true,
          timeRemaining: timeRemainingSeconds,
          isAboutToExpire,
        }
      } catch {
        return {
          isValid: false,
          timeRemaining: null,
          isAboutToExpire: false,
        }
      }
    },
  },
  Mutation: {
    /**
     * Login mutation - authenticates user and returns tokens
     * Sets refresh token as HTTP-only cookie and returns access token in response
     * @param email - User email address
     * @param password - User password
     * @param context - GraphQL context containing request and response objects
     * @returns Access token and user data (refresh token sent as HTTP-only cookie)
     */
    login: async (_: any, { email, password }: { email: string; password: string }, context: { req: any; res: any }) => {
      try {
        // Find user by email
        const users = (await db.query(
          'SELECT * FROM users WHERE email = ? AND is_deleted = false',
          [email]
        )) as any[]

        if (users.length === 0) {
          throw new Error('Invalid email or password')
        }

        const user = users[0]

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password)
        if (!isPasswordValid) {
          throw new Error('Invalid email or password')
        }

        // Generate tokens
        const accessToken = generateAccessToken(user.id, user.email)
        const refreshTokenId = generateRefreshTokenId()
        const refreshToken = generateRefreshToken(user.id, refreshTokenId)

        // Hash refresh token for storage
        const tokenHash = hashRefreshToken(refreshToken)

        // Calculate expiry date based on REFRESH_TOKEN_EXPIRY constant
        const expiresAt = calculateRefreshTokenExpiry()

        // Store refresh token in database
        await db.query(
          'INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)',
          [refreshTokenId, user.id, tokenHash, expiresAt]
        )

        // Set refresh token as HTTP-only cookie (more secure than returning in response)
        setRefreshTokenCookie(context.res, refreshToken)

        return {
          accessToken,
          user: {
            id: user.id.toString(),
            uuid: user.uuid,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            role: user.role,
          },
        }
      } catch (error: any) {
        // Re-throw authentication errors as-is
        if (error.message === 'Invalid email or password') {
          throw error
        }
        // Provide helpful error messages for database connection issues
        if (error.code === 'ER_BAD_DB_ERROR' || error.message?.includes('does not exist')) {
          throw new Error(
            'Database connection error. Please verify:\n' +
            '1. DB_NAME in .env file is set to: project_tracker_mysql_db\n' +
            '2. The database exists (run: npm run migrate)\n' +
            '3. Your database credentials are correct'
          )
        }
        // Re-throw other errors
        throw error
      }
    },
    /**
     * Register mutation - creates a new user account
     * Sets refresh token as HTTP-only cookie and returns access token in response
     * @param input - Registration data containing firstName, lastName, email, and password
     * @param context - GraphQL context containing request and response objects
     * @returns Access token and user data (refresh token sent as HTTP-only cookie)
     */
    register: async (_: any, { input }: { input: { firstName: string; lastName: string; email: string; password: string } }, context: { req: any; res: any }) => {
      // Check if user with email already exists
      const existingUsers = (await db.query(
        'SELECT * FROM users WHERE email = ? AND is_deleted = false',
        [input.email]
      )) as any[]

      if (existingUsers.length > 0) {
        throw new Error('Email already registered')
      }

      // Hash password
      const hashedPassword = await hashPassword(input.password)

      // Generate UUID for user
      const userUuid = uuidv4()

      // Insert new user into database
      const result = (await db.query(
        'INSERT INTO users (uuid, first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?, ?)',
        [userUuid, input.firstName, input.lastName, input.email, hashedPassword, 'Frontend Developer']
      )) as any

      const userId = result.insertId

      // Generate tokens for new user
      const accessToken = generateAccessToken(userId, input.email)
      const refreshTokenId = generateRefreshTokenId()
      const refreshToken = generateRefreshToken(userId, refreshTokenId)

      // Hash refresh token for storage
      const tokenHash = hashRefreshToken(refreshToken)

      // Calculate expiry date based on REFRESH_TOKEN_EXPIRY constant
      const expiresAt = calculateRefreshTokenExpiry()

      // Store refresh token in database
      await db.query(
        'INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)',
        [refreshTokenId, userId, tokenHash, expiresAt]
      )

      // Fetch created user
      const users = (await db.query('SELECT * FROM users WHERE id = ?', [userId])) as any[]
      const user = users[0]

      // Set refresh token as HTTP-only cookie (more secure than returning in response)
      setRefreshTokenCookie(context.res, refreshToken)

      return {
        accessToken,
        user: {
          id: user.id.toString(),
          uuid: user.uuid,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: user.role,
        },
      }
    },
    /**
     * Refresh token mutation - generates new access token using refresh token from HTTP-only cookie
     * Reads refresh token from cookie and sets new refresh token as HTTP-only cookie
     * @param extendSession - If true, always rotate refresh token (user clicked "Yes" on dialog)
     *                        If false or undefined, only rotate if refresh token has >REFRESH_TOKEN_ROTATION_THRESHOLD_SECONDS remaining
     * @param context - GraphQL context containing request and response objects
     * @returns New access token (refresh token sent as HTTP-only cookie if rotated)
     */
    /**
     * Refresh token mutation
     * Refreshes access token and optionally rotates refresh token
     * Prevents refresh token rotation when close to expiration to allow dialog to appear
     * 
     * @author Thang Truong
     * @date 2024-12-24
     * @param extendSession - If true, always rotates refresh token (user clicked "Yes" on dialog)
     * @param context - GraphQL context containing request and response objects
     * @returns New access token
     */
    refreshToken: async (_: any, { extendSession }: { extendSession?: boolean }, context: { req: any; res: any }) => {
      try {
        // Get refresh token from HTTP-only cookie (more secure than mutation parameter)
        const refreshToken = context.req.cookies?.refreshToken
        if (!refreshToken) {
          throw new Error('Refresh token not found')
        }

        // Check if refresh token exists in database first
        // This allows refresh even if JWT token is slightly expired but database record is still valid
        // If extendSession is true, allow extension even if token is slightly expired (within dialog threshold)
        const tokenHash = hashRefreshToken(refreshToken)
        let tokens = (await db.query(
          'SELECT * FROM refresh_tokens WHERE token_hash = ? AND expires_at > NOW() AND is_revoked = false',
          [tokenHash]
        )) as any[]

        // If token not found and extendSession is true, check if token exists but is slightly expired
        // This allows extending session even if token expired within the dialog threshold window
        if (tokens.length === 0 && extendSession === true) {
          // Check if token exists but is expired (within dialog threshold grace period)
          const gracePeriodSeconds = REFRESH_TOKEN_DIALOG_THRESHOLD_SECONDS
          tokens = (await db.query(
            'SELECT * FROM refresh_tokens WHERE token_hash = ? AND expires_at > DATE_SUB(NOW(), INTERVAL ? SECOND) AND is_revoked = false',
            [tokenHash, gracePeriodSeconds]
          )) as any[]
        }

        if (tokens.length === 0) {
          throw new Error('Refresh token expired or invalid')
        }

        // Get user information from database record
        // Allow refresh even if JWT token is slightly expired but database record is still valid
        const tokenRecord = tokens[0]
        const userId = tokenRecord.user_id

        // Verify JWT token to ensure it's a valid refresh token format
        // If JWT is expired but database record is valid, we still allow refresh
        const decoded = verifyRefreshToken(refreshToken)
        if (decoded && decoded.type !== 'refresh') {
          throw new Error('Invalid refresh token type')
        }

        // Get user information
        const users = (await db.query('SELECT * FROM users WHERE id = ? AND is_deleted = false', [
          userId,
        ])) as any[]

        if (users.length === 0) {
          throw new Error('User not found')
        }

        const user = users[0]

        // Generate new access token
        // Access token is rotated every ACCESS_TOKEN_EXPIRY (60 seconds) when it expires
        const newAccessToken = generateAccessToken(user.id, user.email)

        // Only rotate refresh token if user explicitly extends session (clicked "Yes" on dialog)
        // Otherwise, refresh token lifetime is counted from created_at (elapsed time from zero)
        // This allows elapsed time tracking from zero to REFRESH_TOKEN_EXPIRY
        if (extendSession === true) {
          // User clicked "Yes" on dialog - rotate refresh token to extend session
          // Always rotate refresh token when user explicitly extends, even if slightly expired
          // This allows extending session even if token expired within dialog threshold window
          // 
          // @author Thang Truong
          // @date 2024-12-24
          
          // Generate new refresh token (rotate refresh token to extend session)
          const newRefreshTokenId = generateRefreshTokenId()
          const newRefreshToken = generateRefreshToken(user.id, newRefreshTokenId)
          const newTokenHash = hashRefreshToken(newRefreshToken)

          // Calculate new expiry date based on REFRESH_TOKEN_EXPIRY constant
          // This resets the session by creating a new refresh token with a new expiration
          const newExpiresAt = calculateRefreshTokenExpiry()

          // Delete old refresh token and insert new one with updated expires_at and created_at
          // created_at is reset to NOW() to start counting elapsed time from zero again
          await db.query('DELETE FROM refresh_tokens WHERE token_hash = ?', [tokenHash])
          await db.query(
            'INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, NOW())',
            [newRefreshTokenId, user.id, newTokenHash, newExpiresAt]
          )

          // Set new refresh token as HTTP-only cookie (rotate refresh token)
          setRefreshTokenCookie(context.res, newRefreshToken)
        }
        // If extendSession is false/undefined, do NOT rotate refresh token
        // This allows elapsed time to continue counting from created_at until REFRESH_TOKEN_EXPIRY

        return {
          accessToken: newAccessToken,
        }
      } catch (error: any) {
        throw new Error(error.message || 'Failed to refresh token')
      }
    },
    /**
     * Create project mutation
     * Creates a new project
     *
     * @author Thang Truong
     * @date 2024-12-24
     * @param input - Project creation input fields
     * @returns Created project object
     */
    createProject: async (_: any, { input }: { input: any }) => {
      const { name, description, status } = input
      const result = (await db.query(
        'INSERT INTO projects (name, description, status) VALUES (?, ?, ?)',
        [name, description || null, status]
      )) as any
      const projects = (await db.query(
        'SELECT id, name, description, status, created_at, updated_at FROM projects WHERE id = ?',
        [result.insertId]
      )) as any[]
      if (projects.length === 0) {
        throw new Error('Failed to retrieve created project')
      }
      const project = projects[0]
      /**
       * Convert MySQL DATETIME to ISO string for proper serialization
       */
      const formatDateToISO = (dateValue: any): string => {
        try {
          if (!dateValue) {
            return new Date().toISOString()
          }
          if (dateValue instanceof Date) {
            return dateValue.toISOString()
          }
          if (typeof dateValue === 'string') {
            const date = new Date(dateValue)
            return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
          }
          return new Date().toISOString()
        } catch (error) {
          return new Date().toISOString()
        }
      }
      return {
        id: project.id.toString(),
        name: project.name,
        description: project.description,
        status: project.status,
        createdAt: formatDateToISO(project.created_at),
        updatedAt: formatDateToISO(project.updated_at),
      }
    },
    /**
     * Update project mutation
     * Updates project information (name, description, status)
     *
     * @author Thang Truong
     * @date 2024-12-24
     * @param id - Project ID to update
     * @param input - Project update input fields
     * @returns Updated project object
     */
    updateProject: async (_: any, { id, input }: { id: string; input: any }) => {
      const updates: string[] = []
      const values: any[] = []

      if (input.name !== undefined) {
        updates.push('name = ?')
        values.push(input.name)
      }
      if (input.description !== undefined) {
        updates.push('description = ?')
        values.push(input.description)
      }
      if (input.status !== undefined) {
        updates.push('status = ?')
        values.push(input.status)
      }

      if (updates.length === 0) {
        throw new Error('No fields to update')
      }

      values.push(id)
      await db.query(
        `UPDATE projects SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ? AND is_deleted = false`,
        values
      )

      const projects = (await db.query(
        'SELECT id, name, description, status, created_at, updated_at FROM projects WHERE id = ? AND is_deleted = false',
        [id]
      )) as any[]
      if (projects.length === 0) {
        throw new Error('Project not found')
      }
      const project = projects[0]
      /**
       * Convert MySQL DATETIME to ISO string for proper serialization
       */
      const formatDateToISO = (dateValue: any): string => {
        try {
          if (!dateValue) {
            return new Date().toISOString()
          }
          if (dateValue instanceof Date) {
            return dateValue.toISOString()
          }
          if (typeof dateValue === 'string') {
            const date = new Date(dateValue)
            return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
          }
          return new Date().toISOString()
        } catch (error) {
          return new Date().toISOString()
        }
      }
      return {
        id: project.id.toString(),
        name: project.name,
        description: project.description,
        status: project.status,
        createdAt: formatDateToISO(project.created_at),
        updatedAt: formatDateToISO(project.updated_at),
      }
    },
    /**
     * Delete project mutation
     * Soft deletes project by setting is_deleted flag to true
     *
     * @author Thang Truong
     * @date 2024-12-24
     * @param id - Project ID to delete
     * @returns Boolean indicating success
     */
    deleteProject: async (_: any, { id }: { id: string }) => {
      const result = (await db.query(
        'UPDATE projects SET is_deleted = true, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ? AND is_deleted = false',
        [id]
      )) as any
      if (result.affectedRows === 0) {
        throw new Error('Project not found or already deleted')
      }
      return true
    },
    /**
     * Create user mutation
     * Creates a new user account (admin function)
     * Does not generate tokens - user must login separately
     *
     * @author Thang Truong
     * @date 2024-12-24
     * @param input - User creation input fields
     * @returns Created user object
     */
    createUser: async (_: any, { input }: { input: any }) => {
      // Check if user with email already exists
      const existingUsers = (await db.query(
        'SELECT * FROM users WHERE email = ? AND is_deleted = false',
        [input.email]
      )) as any[]

      if (existingUsers.length > 0) {
        throw new Error('Email already registered')
      }

      // Hash password
      const hashedPassword = await hashPassword(input.password)

      // Generate UUID for user
      const userUuid = uuidv4()

      // Set default role if not provided
      const userRole = input.role || 'Frontend Developer'

      // Insert new user into database
      const result = (await db.query(
        'INSERT INTO users (uuid, first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?, ?)',
        [userUuid, input.firstName, input.lastName, input.email, hashedPassword, userRole]
      )) as any

      const userId = result.insertId

      // Fetch created user
      const users = (await db.query(
        'SELECT id, uuid, first_name, last_name, email, role, created_at, updated_at FROM users WHERE id = ?',
        [userId]
      )) as any[]

      if (users.length === 0) {
        throw new Error('Failed to create user')
      }

      const user = users[0]

      /**
       * Convert MySQL DATETIME to ISO string for proper serialization
       */
      const formatDateToISO = (dateValue: any): string => {
        try {
          if (!dateValue) {
            return new Date().toISOString()
          }
          if (dateValue instanceof Date) {
            return dateValue.toISOString()
          }
          if (typeof dateValue === 'string') {
            const date = new Date(dateValue)
            return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
          }
          return new Date().toISOString()
        } catch (error) {
          return new Date().toISOString()
        }
      }

      return {
        id: user.id.toString(),
        uuid: user.uuid,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
        createdAt: formatDateToISO(user.created_at),
        updatedAt: formatDateToISO(user.updated_at),
      }
    },
    /**
     * Update user mutation
     * Updates user information (firstName, lastName, email, role)
     * Uses soft delete pattern - sets is_deleted flag instead of hard delete
     *
     * @author Thang Truong
     * @date 2024-12-24
     * @param id - User ID to update
     * @param input - User update input fields
     * @returns Updated user object
     */
    updateUser: async (_: any, { id, input }: { id: string; input: any }) => {
      const updates: string[] = []
      const values: any[] = []

      if (input.firstName !== undefined) {
        updates.push('first_name = ?')
        values.push(input.firstName)
      }
      if (input.lastName !== undefined) {
        updates.push('last_name = ?')
        values.push(input.lastName)
      }
      if (input.email !== undefined) {
        updates.push('email = ?')
        values.push(input.email)
      }
      if (input.role !== undefined) {
        updates.push('role = ?')
        values.push(input.role)
      }

      if (updates.length === 0) {
        throw new Error('No fields to update')
      }

      values.push(id)
      await db.query(
        `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ? AND is_deleted = false`,
        values
      )

      const users = (await db.query(
        'SELECT id, uuid, first_name, last_name, email, role, created_at, updated_at FROM users WHERE id = ? AND is_deleted = false',
        [id]
      )) as any[]

      if (users.length === 0) {
        throw new Error('User not found')
      }

      const user = users[0]
      /**
       * Convert MySQL DATETIME to ISO string for proper serialization
       */
      const formatDateToISO = (dateValue: any): string => {
        try {
          if (!dateValue) {
            return new Date().toISOString()
          }
          if (dateValue instanceof Date) {
            return dateValue.toISOString()
          }
          if (typeof dateValue === 'string') {
            const date = new Date(dateValue)
            return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
          }
          return new Date().toISOString()
        } catch (error) {
          return new Date().toISOString()
        }
      }

      return {
        id: user.id.toString(),
        uuid: user.uuid,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
        createdAt: formatDateToISO(user.created_at),
        updatedAt: formatDateToISO(user.updated_at),
      }
    },
    /**
     * Delete user mutation
     * Soft deletes user by setting is_deleted flag to true
     * Does not permanently remove user from database
     *
     * @author Thang Truong
     * @date 2024-12-24
     * @param id - User ID to delete
     * @returns Boolean indicating success
     */
    deleteUser: async (_: any, { id }: { id: string }) => {
      const result = (await db.query(
        'UPDATE users SET is_deleted = true, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ? AND is_deleted = false',
        [id]
      )) as any

      if (result.affectedRows === 0) {
        throw new Error('User not found or already deleted')
      }

      return true
    },
    /**
     * Create tag mutation
     * Creates a new tag
     *
     * @author Thang Truong
     * @date 2024-12-24
     * @param input - Tag creation input fields
     * @returns Created tag object
     */
    createTag: async (_: any, { input }: { input: any }) => {
      const { name, description, title, type, category } = input
      
      // Check if tag with name already exists
      const existingTags = (await db.query(
        'SELECT id FROM tags WHERE name = ?',
        [name]
      )) as any[]

      if (existingTags.length > 0) {
        throw new Error('Tag name already exists')
      }

      const result = (await db.query(
        'INSERT INTO tags (name, description, title, type, category) VALUES (?, ?, ?, ?, ?)',
        [name, description || null, title || null, type || null, category || null]
      )) as any
      const tags = (await db.query(
        'SELECT id, name, description, title, type, category, created_at, updated_at FROM tags WHERE id = ?',
        [result.insertId]
      )) as any[]
      if (tags.length === 0) {
        throw new Error('Failed to retrieve created tag')
      }
      const tag = tags[0]
      /**
       * Convert MySQL DATETIME to ISO string for proper serialization
       */
      const formatDateToISO = (dateValue: any): string => {
        try {
          if (!dateValue) {
            return new Date().toISOString()
          }
          if (dateValue instanceof Date) {
            return dateValue.toISOString()
          }
          if (typeof dateValue === 'string') {
            const date = new Date(dateValue)
            return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
          }
          return new Date().toISOString()
        } catch (error) {
          return new Date().toISOString()
        }
      }
      return {
        id: tag.id.toString(),
        name: tag.name,
        description: tag.description,
        title: tag.title,
        type: tag.type,
        category: tag.category,
        createdAt: formatDateToISO(tag.created_at),
        updatedAt: formatDateToISO(tag.updated_at),
      }
    },
    /**
     * Update tag mutation
     * Updates tag information (name, description, title, type, category)
     *
     * @author Thang Truong
     * @date 2024-12-24
     * @param id - Tag ID to update
     * @param input - Tag update input fields
     * @returns Updated tag object
     */
    updateTag: async (_: any, { id, input }: { id: string; input: any }) => {
      const updates: string[] = []
      const values: any[] = []

      if (input.name !== undefined) {
        // Check if new name conflicts with existing tag
        const existingTags = (await db.query(
          'SELECT id FROM tags WHERE name = ? AND id != ?',
          [input.name, id]
        )) as any[]
        if (existingTags.length > 0) {
          throw new Error('Tag name already exists')
        }
        updates.push('name = ?')
        values.push(input.name)
      }
      if (input.description !== undefined) {
        updates.push('description = ?')
        values.push(input.description)
      }
      if (input.title !== undefined) {
        updates.push('title = ?')
        values.push(input.title)
      }
      if (input.type !== undefined) {
        updates.push('type = ?')
        values.push(input.type)
      }
      if (input.category !== undefined) {
        updates.push('category = ?')
        values.push(input.category)
      }

      if (updates.length === 0) {
        throw new Error('No fields to update')
      }

      values.push(id)
      await db.query(
        `UPDATE tags SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?`,
        values
      )

      const tags = (await db.query(
        'SELECT id, name, description, title, type, category, created_at, updated_at FROM tags WHERE id = ?',
        [id]
      )) as any[]
      if (tags.length === 0) {
        throw new Error('Tag not found')
      }
      const tag = tags[0]
      /**
       * Convert MySQL DATETIME to ISO string for proper serialization
       */
      const formatDateToISO = (dateValue: any): string => {
        try {
          if (!dateValue) {
            return new Date().toISOString()
          }
          if (dateValue instanceof Date) {
            return dateValue.toISOString()
          }
          if (typeof dateValue === 'string') {
            const date = new Date(dateValue)
            return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
          }
          return new Date().toISOString()
        } catch (error) {
          return new Date().toISOString()
        }
      }
      return {
        id: tag.id.toString(),
        name: tag.name,
        description: tag.description,
        title: tag.title,
        type: tag.type,
        category: tag.category,
        createdAt: formatDateToISO(tag.created_at),
        updatedAt: formatDateToISO(tag.updated_at),
      }
    },
    /**
     * Delete tag mutation
     * Deletes a tag permanently
     *
     * @author Thang Truong
     * @date 2024-12-24
     * @param id - Tag ID to delete
     * @returns Boolean indicating success
     */
    deleteTag: async (_: any, { id }: { id: string }) => {
      const result = (await db.query('DELETE FROM tags WHERE id = ?', [id])) as any
      if (result.affectedRows === 0) {
        throw new Error('Tag not found')
      }
      return true
    },
    /**
     * Create task mutation
     * Creates a new task
     *
     * @author Thang Truong
     * @date 2024-12-24
     * @param input - Task creation input fields
     * @returns Created task object
     */
    createTask: async (_: any, { input }: { input: any }) => {
      const { title, description, status, priority, dueDate, projectId, assignedTo } = input
      
      // Generate UUID for task
      const taskUuid = uuidv4()

      const result = (await db.query(
        'INSERT INTO tasks (uuid, title, description, status, priority, due_date, project_id, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [taskUuid, title, description, status, priority || 'MEDIUM', dueDate || null, projectId, assignedTo || null]
      )) as any
      const tasks = (await db.query(
        'SELECT id, uuid, title, description, status, priority, due_date, project_id, assigned_to, created_at, updated_at FROM tasks WHERE id = ?',
        [result.insertId]
      )) as any[]
      if (tasks.length === 0) {
        throw new Error('Failed to retrieve created task')
      }
      const task = tasks[0]
      /**
       * Convert MySQL DATETIME to ISO string for proper serialization
       */
      const formatDateToISO = (dateValue: any): string => {
        try {
          if (!dateValue) {
            return new Date().toISOString()
          }
          if (dateValue instanceof Date) {
            return dateValue.toISOString()
          }
          if (typeof dateValue === 'string') {
            const date = new Date(dateValue)
            return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
          }
          return new Date().toISOString()
        } catch (error) {
          return new Date().toISOString()
        }
      }
      /**
       * Format date to ISO string or return null
       */
      const formatDateOrNull = (dateValue: any): string | null => {
        if (!dateValue) {
          return null
        }
        return formatDateToISO(dateValue)
      }
      /**
       * Format DATE field (not DATETIME) to YYYY-MM-DD string or return null
       * DATE fields should be returned as date-only strings without time
       */
      const formatDateOnly = (dateValue: any): string | null => {
        if (!dateValue) {
          return null
        }
        try {
          if (dateValue instanceof Date) {
            const year = dateValue.getFullYear()
            const month = String(dateValue.getMonth() + 1).padStart(2, '0')
            const day = String(dateValue.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
          }
          if (typeof dateValue === 'string') {
            // If it's already in YYYY-MM-DD format, return as-is
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
              return dateValue
            }
            // Otherwise parse and format
            const date = new Date(dateValue)
            if (!isNaN(date.getTime())) {
              const year = date.getUTCFullYear()
              const month = String(date.getUTCMonth() + 1).padStart(2, '0')
              const day = String(date.getUTCDate()).padStart(2, '0')
              return `${year}-${month}-${day}`
            }
          }
          return null
        } catch (error) {
          return null
        }
      }
      return {
        id: task.id.toString(),
        uuid: task.uuid,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.due_date ? formatDateOnly(task.due_date) : null,
        projectId: task.project_id.toString(),
        assignedTo: task.assigned_to ? task.assigned_to.toString() : null,
        createdAt: formatDateToISO(task.created_at),
        updatedAt: formatDateToISO(task.updated_at),
      }
    },
    /**
     * Update task mutation
     * Updates task information
     *
     * @author Thang Truong
     * @date 2024-12-24
     * @param id - Task ID to update
     * @param input - Task update input fields
     * @returns Updated task object
     */
    updateTask: async (_: any, { id, input }: { id: string; input: any }) => {
      const updates: string[] = []
      const values: any[] = []

      if (input.title !== undefined) {
        updates.push('title = ?')
        values.push(input.title)
      }
      if (input.description !== undefined) {
        updates.push('description = ?')
        values.push(input.description)
      }
      if (input.status !== undefined) {
        updates.push('status = ?')
        values.push(input.status)
      }
      if (input.priority !== undefined) {
        updates.push('priority = ?')
        values.push(input.priority)
      }
      if (input.dueDate !== undefined) {
        updates.push('due_date = ?')
        values.push(input.dueDate || null)
      }
      if (input.projectId !== undefined) {
        updates.push('project_id = ?')
        values.push(input.projectId)
      }
      if (input.assignedTo !== undefined) {
        updates.push('assigned_to = ?')
        values.push(input.assignedTo || null)
      }

      if (updates.length === 0) {
        throw new Error('No fields to update')
      }

      values.push(id)
      await db.query(
        `UPDATE tasks SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ? AND is_deleted = false`,
        values
      )

      const tasks = (await db.query(
        'SELECT id, uuid, title, description, status, priority, due_date, project_id, assigned_to, created_at, updated_at FROM tasks WHERE id = ? AND is_deleted = false',
        [id]
      )) as any[]
      if (tasks.length === 0) {
        throw new Error('Task not found')
      }
      const task = tasks[0]
      /**
       * Convert MySQL DATETIME to ISO string for proper serialization
       */
      const formatDateToISO = (dateValue: any): string => {
        try {
          if (!dateValue) {
            return new Date().toISOString()
          }
          if (dateValue instanceof Date) {
            return dateValue.toISOString()
          }
          if (typeof dateValue === 'string') {
            const date = new Date(dateValue)
            return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
          }
          return new Date().toISOString()
        } catch (error) {
          return new Date().toISOString()
        }
      }
      /**
       * Format date to ISO string or return null
       */
      const formatDateOrNull = (dateValue: any): string | null => {
        if (!dateValue) {
          return null
        }
        return formatDateToISO(dateValue)
      }
      /**
       * Format DATE field (not DATETIME) to YYYY-MM-DD string or return null
       * DATE fields should be returned as date-only strings without time
       */
      const formatDateOnly = (dateValue: any): string | null => {
        if (!dateValue) {
          return null
        }
        try {
          if (dateValue instanceof Date) {
            const year = dateValue.getFullYear()
            const month = String(dateValue.getMonth() + 1).padStart(2, '0')
            const day = String(dateValue.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
          }
          if (typeof dateValue === 'string') {
            // If it's already in YYYY-MM-DD format, return as-is
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
              return dateValue
            }
            // Otherwise parse and format
            const date = new Date(dateValue)
            if (!isNaN(date.getTime())) {
              const year = date.getUTCFullYear()
              const month = String(date.getUTCMonth() + 1).padStart(2, '0')
              const day = String(date.getUTCDate()).padStart(2, '0')
              return `${year}-${month}-${day}`
            }
          }
          return null
        } catch (error) {
          return null
        }
      }
      return {
        id: task.id.toString(),
        uuid: task.uuid,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.due_date ? formatDateOnly(task.due_date) : null,
        projectId: task.project_id.toString(),
        assignedTo: task.assigned_to ? task.assigned_to.toString() : null,
        createdAt: formatDateToISO(task.created_at),
        updatedAt: formatDateToISO(task.updated_at),
      }
    },
    /**
     * Delete task mutation
     * Soft deletes task by setting is_deleted flag to true
     *
     * @author Thang Truong
     * @date 2024-12-24
     * @param id - Task ID to delete
     * @returns Boolean indicating success
     */
    deleteTask: async (_: any, { id }: { id: string }) => {
      const result = (await db.query(
        'UPDATE tasks SET is_deleted = true, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ? AND is_deleted = false',
        [id]
      )) as any

      if (result.affectedRows === 0) {
        throw new Error('Task not found or already deleted')
      }

      return true
    },
    /**
     * Create notification mutation
     * Creates a new notification
     *
     * @author Thang Truong
     * @date 2024-12-24
     * @param input - Notification creation input fields
     * @returns Created notification object
     */
    createNotification: async (_: any, { input }: { input: any }) => {
      const { userId, message, isRead } = input

      const result = (await db.query(
        'INSERT INTO notifications (user_id, message, is_read) VALUES (?, ?, ?)',
        [userId, message, isRead || false]
      )) as any
      const notifications = (await db.query(
        'SELECT id, user_id, message, is_read, created_at, updated_at FROM notifications WHERE id = ?',
        [result.insertId]
      )) as any[]
      if (notifications.length === 0) {
        throw new Error('Failed to retrieve created notification')
      }
      const notification = notifications[0]
      /**
       * Convert MySQL DATETIME to ISO string for proper serialization
       */
      const formatDateToISO = (dateValue: any): string => {
        try {
          if (!dateValue) {
            return new Date().toISOString()
          }
          if (dateValue instanceof Date) {
            return dateValue.toISOString()
          }
          if (typeof dateValue === 'string') {
            const date = new Date(dateValue)
            return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
          }
          return new Date().toISOString()
        } catch (error) {
          return new Date().toISOString()
        }
      }
      return {
        id: notification.id.toString(),
        userId: notification.user_id.toString(),
        message: notification.message,
        isRead: Boolean(notification.is_read),
        createdAt: formatDateToISO(notification.created_at),
        updatedAt: formatDateToISO(notification.updated_at),
      }
    },
    /**
     * Update notification mutation
     * Updates notification information
     *
     * @author Thang Truong
     * @date 2024-12-24
     * @param id - Notification ID to update
     * @param input - Notification update input fields
     * @returns Updated notification object
     */
    updateNotification: async (_: any, { id, input }: { id: string; input: any }) => {
      const updates: string[] = []
      const values: any[] = []

      if (input.userId !== undefined) {
        updates.push('user_id = ?')
        values.push(input.userId)
      }
      if (input.message !== undefined) {
        updates.push('message = ?')
        values.push(input.message)
      }
      if (input.isRead !== undefined) {
        updates.push('is_read = ?')
        values.push(input.isRead)
      }

      if (updates.length === 0) {
        throw new Error('No fields to update')
      }

      values.push(id)
      await db.query(
        `UPDATE notifications SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?`,
        values
      )

      const notifications = (await db.query(
        'SELECT id, user_id, message, is_read, created_at, updated_at FROM notifications WHERE id = ?',
        [id]
      )) as any[]
      if (notifications.length === 0) {
        throw new Error('Notification not found')
      }
      const notification = notifications[0]
      /**
       * Convert MySQL DATETIME to ISO string for proper serialization
       */
      const formatDateToISO = (dateValue: any): string => {
        try {
          if (!dateValue) {
            return new Date().toISOString()
          }
          if (dateValue instanceof Date) {
            return dateValue.toISOString()
          }
          if (typeof dateValue === 'string') {
            const date = new Date(dateValue)
            return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
          }
          return new Date().toISOString()
        } catch (error) {
          return new Date().toISOString()
        }
      }
      return {
        id: notification.id.toString(),
        userId: notification.user_id.toString(),
        message: notification.message,
        isRead: Boolean(notification.is_read),
        createdAt: formatDateToISO(notification.created_at),
        updatedAt: formatDateToISO(notification.updated_at),
      }
    },
    /**
     * Delete notification mutation
     * Deletes a notification permanently
     *
     * @author Thang Truong
     * @date 2024-12-24
     * @param id - Notification ID to delete
     * @returns Boolean indicating success
     */
    deleteNotification: async (_: any, { id }: { id: string }) => {
      const result = (await db.query('DELETE FROM notifications WHERE id = ?', [id])) as any

      if (result.affectedRows === 0) {
        throw new Error('Notification not found')
      }

      return true
    },
    /**
     * Create activity mutation
     * Creates a new activity log entry for auditing
     *
     * @author Thang Truong
     * @date 2024-12-24
     * @param input - Activity log creation input fields
     * @returns Created activity log object
     */
    createActivity: async (_: any, { input }: { input: any }) => {
      const { userId, targetUserId, projectId, taskId, action, type, metadata } = input
      const normalizeMetadata = (metadataValue?: string | null) => {
        if (!metadataValue || !metadataValue.trim()) {
          return null
        }
        try {
          const parsed = JSON.parse(metadataValue)
          return JSON.stringify(parsed)
        } catch (error) {
          return JSON.stringify({ note: metadataValue })
        }
      }
      const metadataValue = normalizeMetadata(metadata)

      const result = (await db.query(
        'INSERT INTO activity_logs (user_id, target_user_id, project_id, task_id, action, type, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, targetUserId || null, projectId || null, taskId || null, action || null, type, metadataValue]
      )) as any
      const activities = (await db.query(
        `SELECT
          al.id,
          al.user_id,
          COALESCE(al.target_user_id, t.assigned_to) AS target_user_id,
          al.project_id,
          al.task_id,
          al.action,
          al.type,
          al.metadata,
          al.created_at,
          al.updated_at
        FROM activity_logs AS al
        LEFT JOIN tasks AS t ON al.task_id = t.id
        WHERE al.id = ?`,
        [result.insertId]
      )) as any[]
      if (activities.length === 0) {
        throw new Error('Failed to retrieve created activity log')
      }
      const activity = activities[0]
      const formatDateToISO = (dateValue: any): string => {
        try {
          if (!dateValue) {
            return new Date().toISOString()
          }
          if (dateValue instanceof Date) {
            return dateValue.toISOString()
          }
          if (typeof dateValue === 'string') {
            const date = new Date(dateValue)
            return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
          }
          return new Date().toISOString()
        } catch (error) {
          return new Date().toISOString()
        }
      }
      const formatMetadata = (metadataRecord: any): string | null => {
        if (metadataRecord === null || metadataRecord === undefined) {
          return null
        }
        if (typeof metadataRecord === 'string') {
          return metadataRecord
        }
        try {
          return JSON.stringify(metadataRecord)
        } catch (error) {
          return null
        }
      }
      return {
        id: activity.id.toString(),
        userId: activity.user_id ? activity.user_id.toString() : '',
        targetUserId: activity.target_user_id ? activity.target_user_id.toString() : null,
        projectId: activity.project_id ? activity.project_id.toString() : null,
        taskId: activity.task_id ? activity.task_id.toString() : null,
        action: resolveActivityAction(activity.type, activity.action),
        type: activity.type,
        metadata: formatMetadata(activity.metadata),
        createdAt: formatDateToISO(activity.created_at),
        updatedAt: formatDateToISO(activity.updated_at),
      }
    },
    /**
     * Update activity mutation
     * Updates an existing activity log entry
     *
     * @author Thang Truong
     * @date 2024-12-24
     * @param id - Activity log ID to update
     * @param input - Activity log update input fields
     * @returns Updated activity log object
     */
    updateActivity: async (_: any, { id, input }: { id: string; input: any }) => {
      const updates: string[] = []
      const values: any[] = []
      const normalizeMetadata = (metadataValue?: string | null) => {
        if (!metadataValue || !metadataValue.trim()) {
          return null
        }
        try {
          const parsed = JSON.parse(metadataValue)
          return JSON.stringify(parsed)
        } catch (error) {
          return JSON.stringify({ note: metadataValue })
        }
      }

      if (input.userId !== undefined) {
        updates.push('user_id = ?')
        values.push(input.userId)
      }
      if (input.targetUserId !== undefined) {
        updates.push('target_user_id = ?')
        values.push(input.targetUserId || null)
      }
      if (input.projectId !== undefined) {
        updates.push('project_id = ?')
        values.push(input.projectId || null)
      }
      if (input.taskId !== undefined) {
        updates.push('task_id = ?')
        values.push(input.taskId || null)
      }
      if (input.action !== undefined) {
        updates.push('action = ?')
        values.push(input.action || null)
      }
      if (input.type !== undefined) {
        updates.push('type = ?')
        values.push(input.type)
      }
      if (input.metadata !== undefined) {
        updates.push('metadata = ?')
        values.push(normalizeMetadata(input.metadata))
      }

      if (updates.length === 0) {
        throw new Error('No fields to update')
      }

      values.push(id)
      await db.query(
        `UPDATE activity_logs SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?`,
        values
      )

      const activities = (await db.query(
        `SELECT
          al.id,
          al.user_id,
          COALESCE(al.target_user_id, t.assigned_to) AS target_user_id,
          al.project_id,
          al.task_id,
          al.action,
          al.type,
          al.metadata,
          al.created_at,
          al.updated_at
        FROM activity_logs AS al
        LEFT JOIN tasks AS t ON al.task_id = t.id
        WHERE al.id = ?`,
        [id]
      )) as any[]
      if (activities.length === 0) {
        throw new Error('Activity log not found')
      }
      const activity = activities[0]
      const formatDateToISO = (dateValue: any): string => {
        try {
          if (!dateValue) {
            return new Date().toISOString()
          }
          if (dateValue instanceof Date) {
            return dateValue.toISOString()
          }
          if (typeof dateValue === 'string') {
            const date = new Date(dateValue)
            return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
          }
          return new Date().toISOString()
        } catch (error) {
          return new Date().toISOString()
        }
      }
      const formatMetadata = (metadataRecord: any): string | null => {
        if (metadataRecord === null || metadataRecord === undefined) {
          return null
        }
        if (typeof metadataRecord === 'string') {
          return metadataRecord
        }
        try {
          return JSON.stringify(metadataRecord)
        } catch (error) {
          return null
        }
      }
      return {
        id: activity.id.toString(),
        userId: activity.user_id ? activity.user_id.toString() : '',
        targetUserId: activity.target_user_id ? activity.target_user_id.toString() : null,
        projectId: activity.project_id ? activity.project_id.toString() : null,
        taskId: activity.task_id ? activity.task_id.toString() : null,
        action: resolveActivityAction(activity.type, activity.action),
        type: activity.type,
        metadata: formatMetadata(activity.metadata),
        createdAt: formatDateToISO(activity.created_at),
        updatedAt: formatDateToISO(activity.updated_at),
      }
    },
    /**
     * Delete activity mutation
     * Deletes an activity log entry permanently
     *
     * @author Thang Truong
     * @date 2024-12-24
     * @param id - Activity log ID to delete
     * @returns Boolean indicating success
     */
    deleteActivity: async (_: any, { id }: { id: string }) => {
      const result = (await db.query('DELETE FROM activity_logs WHERE id = ?', [id])) as any

      if (result.affectedRows === 0) {
        throw new Error('Activity log not found')
      }

      return true
    },
    /**
     * Create team member mutation
     * Adds a user to a project team (reactivates if previously removed)
     */
    createTeamMember: async (_: any, { input }: { input: { projectId: string; userId: string; role?: string } }) => {
      const { projectId, userId, role } = input
      const members = (await db.query(
        'SELECT is_deleted FROM project_members WHERE project_id = ? AND user_id = ?',
        [projectId, userId]
      )) as any[]

      if (members.length > 0) {
        if (members[0].is_deleted) {
          await db.query(
            'UPDATE project_members SET is_deleted = false, role = ?, updated_at = CURRENT_TIMESTAMP(3) WHERE project_id = ? AND user_id = ?',
            [role || 'VIEWER', projectId, userId]
          )
        } else {
          throw new Error('User is already a member of this project')
        }
      } else {
        await db.query(
          'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
          [projectId, userId, role || 'VIEWER']
        )
      }

      return fetchTeamMemberRecord(projectId, userId)
    },
    /**
     * Update team member mutation
     * Updates team member role for a given project/user pairing
     */
    updateTeamMember: async (_: any, { input }: { input: { projectId: string; userId: string; role: string } }) => {
      const { projectId, userId, role } = input
      const result = (await db.query(
        'UPDATE project_members SET role = ?, updated_at = CURRENT_TIMESTAMP(3) WHERE project_id = ? AND user_id = ? AND is_deleted = false',
        [role, projectId, userId]
      )) as any

      if (result.affectedRows === 0) {
        throw new Error('Team member not found')
      }

      return fetchTeamMemberRecord(projectId, userId)
    },
    /**
     * Delete team member mutation
     * Soft deletes team membership by marking is_deleted flag
     */
    deleteTeamMember: async (_: any, { projectId, userId }: { projectId: string; userId: string }) => {
      const result = (await db.query(
        'UPDATE project_members SET is_deleted = true, updated_at = CURRENT_TIMESTAMP(3) WHERE project_id = ? AND user_id = ? AND is_deleted = false',
        [projectId, userId]
      )) as any

      if (result.affectedRows === 0) {
        throw new Error('Team member not found or already deleted')
      }

      return true
    },
  },
}

