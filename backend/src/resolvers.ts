/**
 * GraphQL Resolvers
 * Handles all GraphQL queries and mutations
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { v4 as uuidv4 } from 'uuid'
import {
  REFRESH_TOKEN_DIALOG_THRESHOLD_SECONDS,
  REFRESH_TOKEN_EXPIRY,
} from './constants/auth'
import { db } from './db'
import {
  calculateRefreshTokenExpiry,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  generateRefreshTokenId,
  hashPassword,
  hashRefreshToken,
  parseTimeStringToSeconds,
  setRefreshTokenCookie,
  verifyAccessToken,
  verifyRefreshToken
} from './utils/auth'
import { pubsub } from './utils/pubsub'

const DEFAULT_PROJECT_STATUSES = ['PLANNING', 'IN_PROGRESS', 'COMPLETED']
const DEFAULT_TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE']
const DEFAULT_PAGE_SIZE = 12
const MAX_PAGE_SIZE = 50

const userNameCache = new Map<number, string>()

const tryGetUserIdFromRequest = (req: any): number | null => {
  try {
    const authHeader = req?.headers?.authorization || ''
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }
    const token = authHeader.replace('Bearer ', '')
    const decoded = verifyAccessToken(token)
    if (!decoded || !decoded.userId) {
      return null
    }
    return Number(decoded.userId)
  } catch {
    return null
  }
}

const getUserDisplayName = async (userId: number): Promise<string> => {
  if (userNameCache.has(userId)) {
    return userNameCache.get(userId) as string
  }
  const users = (await db.query(
    'SELECT first_name, last_name FROM users WHERE id = ?',
    [userId]
  )) as any[]
  const displayName = users.length
    ? `${users[0].first_name || ''} ${users[0].last_name || ''}`.trim() || 'A team member'
    : 'A team member'
  userNameCache.set(userId, displayName)
  return displayName
}

const createNotificationRecord = async (userId: number, message: string, isRead = false) => {
  const result = (await db.query(
    'INSERT INTO notifications (user_id, message, is_read) VALUES (?, ?, ?)',
    [userId, message, isRead]
  )) as any
  const notifications = (await db.query(
    'SELECT id, user_id, message, is_read, created_at, updated_at FROM notifications WHERE id = ?',
    [result.insertId]
  )) as any[]
  if (notifications.length === 0) {
    throw new Error('Failed to retrieve created notification')
  }
  const notification = notifications[0]
  const payload = {
    id: notification.id.toString(),
    userId: notification.user_id.toString(),
    message: notification.message,
    isRead: Boolean(notification.is_read),
    createdAt: notification.created_at instanceof Date ? notification.created_at.toISOString() : new Date(notification.created_at).toISOString(),
    updatedAt: notification.updated_at instanceof Date ? notification.updated_at.toISOString() : new Date(notification.updated_at).toISOString(),
  }
  await pubsub.publish(`NOTIFICATION_CREATED_${payload.userId}`, {
    notificationCreated: payload,
  })
  return payload
}

const notifyProjectParticipants = async ({
  projectId,
  actorUserId,
  message,
}: {
  projectId: number | string
  actorUserId?: number | null
  message: string
}) => {
  const projectIdNumber = Number(projectId)
  if (Number.isNaN(projectIdNumber)) {
    return
  }
  const projects = (await db.query(
    'SELECT owner_id FROM projects WHERE id = ? AND is_deleted = false',
    [projectIdNumber]
  )) as any[]
  if (projects.length === 0) {
    return
  }
  const ownerId = projects[0].owner_id ? Number(projects[0].owner_id) : null
  const members = (await db.query(
    'SELECT user_id FROM project_members WHERE project_id = ? AND is_deleted = false',
    [projectIdNumber]
  )) as any[]
  const recipientIds = new Set<number>()
  if (ownerId) {
    recipientIds.add(ownerId)
  }
  members.forEach((member: any) => {
    if (member.user_id) {
      recipientIds.add(Number(member.user_id))
    }
  })
  if (actorUserId) {
    recipientIds.delete(Number(actorUserId))
  }
  if (recipientIds.size === 0) {
    return
  }
  await Promise.all([...recipientIds].map((recipientId) => createNotificationRecord(recipientId, message)))
}

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
     * Returns list of projects with owner, likes count, comments count, and isLiked status
     *
     * @author Thang Truong
     * @date 2025-01-27
     * @param context - GraphQL context containing request headers
     * @returns Array of project objects
     */
    projects: async (_: any, __: any, context: { req: any }) => {
      const projects = (await db.query(
        `SELECT 
          p.id, 
          p.name, 
          p.description, 
          p.status, 
          p.owner_id,
          p.created_at, 
          p.updated_at,
          u.id as owner_user_id,
          u.first_name as owner_first_name,
          u.last_name as owner_last_name,
          u.email as owner_email,
          u.role as owner_role,
          u.uuid as owner_uuid,
          u.created_at as owner_created_at,
          u.updated_at as owner_updated_at,
          COALESCE(pl.likes_count, 0) as likes_count,
          COALESCE(pc.comments_count, 0) as comments_count
        FROM projects p
        LEFT JOIN users u ON p.owner_id = u.id AND u.is_deleted = false
        LEFT JOIN (
          SELECT project_id, COUNT(*) as likes_count
          FROM project_likes
          GROUP BY project_id
        ) pl ON p.id = pl.project_id
        LEFT JOIN (
          SELECT t.project_id, COUNT(*) as comments_count
          FROM comments c
          INNER JOIN tasks t ON c.task_id = t.id
          WHERE c.is_deleted = false AND t.is_deleted = false
          GROUP BY t.project_id
        ) pc ON p.id = pc.project_id
        WHERE p.is_deleted = false 
        ORDER BY p.created_at DESC`
      )) as any[]
      
      /**
       * Get authenticated user ID from JWT token
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      let userId: number | null = null
      try {
        const authHeader = context.req?.headers?.authorization || ''
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.replace('Bearer ', '')
          const decoded = verifyAccessToken(token)
          if (decoded && decoded.userId) {
            userId = Number(decoded.userId)
          }
        }
      } catch {
        userId = null
      }

      /**
       * Get user's liked projects if authenticated
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      let userLikedProjects: Set<number> = new Set()
      if (userId) {
        try {
          const userLikes = (await db.query(
            'SELECT project_id FROM project_likes WHERE user_id = ?',
            [userId]
          )) as any[]
          userLikedProjects = new Set(userLikes.map((like: any) => Number(like.project_id)))
        } catch {
          userLikedProjects = new Set()
        }
      }
      
      /**
       * Convert MySQL DATETIME to ISO string for proper serialization
       *
       * @author Thang Truong
       * @date 2025-01-27
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
       * Format user object for GraphQL response
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      const formatUser = (project: any) => {
        if (!project.owner_user_id) {
          return null
        }
        return {
          id: project.owner_user_id.toString(),
          uuid: project.owner_uuid || '',
          firstName: project.owner_first_name || '',
          lastName: project.owner_last_name || '',
          email: project.owner_email || '',
          role: project.owner_role || '',
          createdAt: formatDateToISO(project.owner_created_at),
          updatedAt: formatDateToISO(project.owner_updated_at),
        }
      }

      return projects.map((project: any) => ({
        id: project.id.toString(),
        name: project.name,
        description: project.description,
        status: project.status,
        owner: formatUser(project),
        likesCount: Number(project.likes_count || 0),
        commentsCount: Number(project.comments_count || 0),
        isLiked: userId ? userLikedProjects.has(Number(project.id)) : false,
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
      },
      context: { req: any }
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

      /**
       * Get authenticated user ID from JWT token for isLiked check
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      let userId: number | null = null
      try {
        const authHeader = context.req?.headers?.authorization || ''
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.replace('Bearer ', '')
          const decoded = verifyAccessToken(token)
          if (decoded && decoded.userId) {
            userId = Number(decoded.userId)
          }
        }
      } catch {
        userId = null
      }

      /**
       * Get user's liked projects and tasks if authenticated
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      let userLikedProjects: Set<number> = new Set()
      let userLikedTasks: Set<number> = new Set()
      if (userId) {
        try {
          const userProjectLikes = (await db.query(
            'SELECT project_id FROM project_likes WHERE user_id = ?',
            [userId]
          )) as any[]
          userLikedProjects = new Set(userProjectLikes.map((like: any) => Number(like.project_id)))

          const userTaskLikes = (await db.query(
            'SELECT task_id FROM task_likes WHERE user_id = ?',
            [userId]
          )) as any[]
          userLikedTasks = new Set(userTaskLikes.map((like: any) => Number(like.task_id)))
        } catch {
          userLikedProjects = new Set()
          userLikedTasks = new Set()
        }
      }

      const projectValues: any[] = []
      const baseProjectSql = `SELECT 
        p.id, 
        p.name, 
        p.description, 
        p.status, 
        p.owner_id,
        p.updated_at,
        u.id as owner_user_id,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name,
        u.email as owner_email,
        u.role as owner_role,
        u.uuid as owner_uuid,
        u.created_at as owner_created_at,
        u.updated_at as owner_updated_at,
        COALESCE(pl.likes_count, 0) as likes_count,
        COALESCE(pc.comments_count, 0) as comments_count
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.id AND u.is_deleted = false
      LEFT JOIN (
        SELECT project_id, COUNT(*) as likes_count
        FROM project_likes
        GROUP BY project_id
      ) pl ON p.id = pl.project_id
      LEFT JOIN (
        SELECT t.project_id, COUNT(*) as comments_count
        FROM comments c
        INNER JOIN tasks t ON c.task_id = t.id
        WHERE c.is_deleted = false AND t.is_deleted = false
        GROUP BY t.project_id
      ) pc ON p.id = pc.project_id
      WHERE p.is_deleted = false`
      
      let projectSql = applySearchFilters(
        baseProjectSql,
        searchTerm,
        projectStatuses,
        projectValues,
        ['p.name', 'p.description']
      )
      const projectOffset = (projectPage - 1) * projectPageSize
      projectSql += ` ORDER BY p.updated_at DESC LIMIT ${projectPageSize} OFFSET ${projectOffset}`

      const projectCountValues: any[] = []
      const projectCountSql = applySearchFilters(
        'SELECT COUNT(*) as total FROM projects WHERE is_deleted = false',
        searchTerm,
        projectStatuses,
        projectCountValues,
        ['name', 'description']
      )

      const taskValues: any[] = []
      const baseTaskSql = `SELECT 
        t.id, 
        t.title, 
        t.description, 
        t.status, 
        t.project_id,
        t.assigned_to,
        t.updated_at,
        u.id as owner_user_id,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name,
        u.email as owner_email,
        u.role as owner_role,
        u.uuid as owner_uuid,
        u.created_at as owner_created_at,
        u.updated_at as owner_updated_at,
        COALESCE(tl.likes_count, 0) as likes_count,
        COALESCE(tc.comments_count, 0) as comments_count
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id AND u.is_deleted = false
      LEFT JOIN (
        SELECT task_id, COUNT(*) as likes_count
        FROM task_likes
        GROUP BY task_id
      ) tl ON t.id = tl.task_id
      LEFT JOIN (
        SELECT task_id, COUNT(*) as comments_count
        FROM comments
        WHERE is_deleted = false
        GROUP BY task_id
      ) tc ON t.id = tc.task_id
      WHERE t.is_deleted = false`

      let taskSql = applySearchFilters(
        baseTaskSql,
        searchTerm,
        taskStatuses,
        taskValues,
        ['t.title', 't.description']
      )
      const taskOffset = (taskPage - 1) * taskPageSize
      taskSql += ` ORDER BY t.updated_at DESC LIMIT ${taskPageSize} OFFSET ${taskOffset}`

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

      /**
       * Convert MySQL DATETIME to ISO string for proper serialization
       *
       * @author Thang Truong
       * @date 2025-01-27
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
       * Format user object for GraphQL response
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      const formatUser = (project: any) => {
        if (!project.owner_user_id) {
          return null
        }
        return {
          id: project.owner_user_id.toString(),
          uuid: project.owner_uuid || '',
          firstName: project.owner_first_name || '',
          lastName: project.owner_last_name || '',
          email: project.owner_email || '',
          role: project.owner_role || '',
          createdAt: formatDateToISO(project.owner_created_at),
          updatedAt: formatDateToISO(project.owner_updated_at),
        }
      }

      /**
       * Format user object for task (from assigned_to)
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      const formatTaskUser = (task: any) => {
        if (!task.owner_user_id) {
          return null
        }
        return {
          id: task.owner_user_id.toString(),
          uuid: task.owner_uuid || '',
          firstName: task.owner_first_name || '',
          lastName: task.owner_last_name || '',
          email: task.owner_email || '',
          role: task.owner_role || '',
          createdAt: formatDateToISO(task.owner_created_at),
          updatedAt: formatDateToISO(task.owner_updated_at),
        }
      }

      return {
        projects: projects.map((project) => ({
          id: project.id.toString(),
          name: project.name,
          status: project.status,
          description: project.description,
          owner: formatUser(project),
          likesCount: Number(project.likes_count || 0),
          commentsCount: Number(project.comments_count || 0),
          isLiked: userId ? userLikedProjects.has(Number(project.id)) : false,
          updatedAt: formatDateToISO(project.updated_at),
        })),
        tasks: tasks.map((task) => ({
          id: task.id.toString(),
          title: task.title,
          status: task.status,
          projectId: task.project_id ? task.project_id.toString() : '',
          description: task.description,
          owner: formatTaskUser(task),
          likesCount: Number(task.likes_count || 0),
          commentsCount: Number(task.comments_count || 0),
          isLiked: userId ? userLikedTasks.has(Number(task.id)) : false,
          updatedAt: formatDateToISO(task.updated_at),
        })),
        projectTotal: Number(projectCountResult[0]?.total || 0),
        taskTotal: Number(taskCountResult[0]?.total || 0),
      }
    },
    /**
     * Project query
     * Fetches a single project by ID with owner, tasks, members, likes count, comments count, and isLiked status
     *
     * @author Thang Truong
     * @date 2025-01-27
     * @param id - Project ID to fetch
     * @param context - GraphQL context containing request headers
     * @returns Project object or null
     */
    project: async (_: any, { id }: { id: string }, context: { req: any }) => {
      const projects = (await db.query(
        `SELECT 
          p.id, 
          p.name, 
          p.description, 
          p.status, 
          p.owner_id,
          p.created_at, 
          p.updated_at,
          u.id as owner_user_id,
          u.first_name as owner_first_name,
          u.last_name as owner_last_name,
          u.email as owner_email,
          u.role as owner_role,
          u.uuid as owner_uuid,
          u.created_at as owner_created_at,
          u.updated_at as owner_updated_at,
          COALESCE(pl.likes_count, 0) as likes_count,
          COALESCE(pc.comments_count, 0) as comments_count
        FROM projects p
        LEFT JOIN users u ON p.owner_id = u.id AND u.is_deleted = false
        LEFT JOIN (
          SELECT project_id, COUNT(*) as likes_count
          FROM project_likes
          GROUP BY project_id
        ) pl ON p.id = pl.project_id
        LEFT JOIN (
          SELECT t.project_id, COUNT(*) as comments_count
          FROM comments c
          INNER JOIN tasks t ON c.task_id = t.id
          WHERE c.is_deleted = false AND t.is_deleted = false
          GROUP BY t.project_id
        ) pc ON p.id = pc.project_id
        WHERE p.id = ? AND p.is_deleted = false`,
        [id]
      )) as any[]
      
      if (projects.length === 0) {
        return null
      }
      
      const project = projects[0]
      const projectId = project.id
      
      /**
       * Convert MySQL DATETIME to ISO string for proper serialization
       *
       * @author Thang Truong
       * @date 2025-01-27
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
       * Format user object for GraphQL response
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      const formatUser = (project: any) => {
        if (!project.owner_user_id) {
          return null
        }
        return {
          id: project.owner_user_id.toString(),
          uuid: project.owner_uuid || '',
          firstName: project.owner_first_name || '',
          lastName: project.owner_last_name || '',
          email: project.owner_email || '',
          role: project.owner_role || '',
          createdAt: formatDateToISO(project.owner_created_at),
          updatedAt: formatDateToISO(project.owner_updated_at),
        }
      }

      /**
       * Fetch tasks for this project with owner, likes, and comments
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      const fetchTasks = async () => {
        try {
          const tasks = (await db.query(
            `SELECT 
              t.id, 
              t.uuid, 
              t.title, 
              t.description, 
              t.status, 
              t.priority, 
              t.due_date, 
              t.project_id, 
              t.assigned_to, 
              t.created_at, 
              t.updated_at,
              u.id as owner_user_id,
              u.first_name as owner_first_name,
              u.last_name as owner_last_name,
              u.email as owner_email,
              u.role as owner_role,
              u.uuid as owner_uuid,
              u.created_at as owner_created_at,
              u.updated_at as owner_updated_at,
              COALESCE(tl.likes_count, 0) as likes_count,
              COALESCE(tc.comments_count, 0) as comments_count
            FROM tasks t
            LEFT JOIN users u ON t.assigned_to = u.id AND u.is_deleted = false
            LEFT JOIN (
              SELECT task_id, COUNT(*) as likes_count
              FROM task_likes
              GROUP BY task_id
            ) tl ON t.id = tl.task_id
            LEFT JOIN (
              SELECT task_id, COUNT(*) as comments_count
              FROM comments
              WHERE is_deleted = false
              GROUP BY task_id
            ) tc ON t.id = tc.task_id
            WHERE t.project_id = ? AND t.is_deleted = false 
            ORDER BY t.created_at DESC`,
            [projectId]
          )) as any[]

          /**
           * Get user's liked tasks if authenticated
           *
           * @author Thang Truong
           * @date 2025-01-27
           */
          let userLikedTasks: Set<number> = new Set()
          if (userId) {
            try {
              const taskIds = tasks.map((t: any) => t.id)
              if (taskIds.length > 0) {
                const placeholders = taskIds.map(() => '?').join(',')
                const userTaskLikes = (await db.query(
                  `SELECT task_id FROM task_likes WHERE user_id = ? AND task_id IN (${placeholders})`,
                  [userId, ...taskIds]
                )) as any[]
                userLikedTasks = new Set(userTaskLikes.map((like: any) => Number(like.task_id)))
              }
            } catch {
              userLikedTasks = new Set()
            }
          }

          /**
           * Format user object for task (from assigned_to)
           *
           * @author Thang Truong
           * @date 2025-01-27
           */
          const formatTaskUser = (task: any) => {
            if (!task.owner_user_id) {
              return null
            }
            return {
              id: task.owner_user_id.toString(),
              uuid: task.owner_uuid || '',
              firstName: task.owner_first_name || '',
              lastName: task.owner_last_name || '',
              email: task.owner_email || '',
              role: task.owner_role || '',
              createdAt: formatDateToISO(task.owner_created_at),
              updatedAt: formatDateToISO(task.owner_updated_at),
            }
          }
          
          return tasks.map((task: any) => ({
            id: task.id.toString(),
            uuid: task.uuid || '',
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: task.due_date ? formatDateToISO(task.due_date) : null,
            projectId: task.project_id.toString(),
            assignedTo: task.assigned_to ? task.assigned_to.toString() : null,
            owner: formatTaskUser(task),
            likesCount: Number(task.likes_count || 0),
            commentsCount: Number(task.comments_count || 0),
            isLiked: userId ? userLikedTasks.has(Number(task.id)) : false,
            createdAt: formatDateToISO(task.created_at),
            updatedAt: formatDateToISO(task.updated_at),
          }))
        } catch {
          return []
        }
      }

      /**
       * Fetch members for this project
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      const fetchMembers = async () => {
        try {
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
            WHERE pm.project_id = ? AND pm.is_deleted = false
            ORDER BY pm.created_at DESC`,
            [projectId]
          )) as any[]
          
          return members.map((member: any) => mapTeamMemberRecord(member))
        } catch {
          return []
        }
      }

      /**
       * Get authenticated user ID from JWT token
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      let userId: number | null = null
      let isLiked = false
      try {
        const authHeader = context.req?.headers?.authorization || ''
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.replace('Bearer ', '')
          const decoded = verifyAccessToken(token)
          if (decoded && decoded.userId) {
            userId = Number(decoded.userId)
          }
        }
      } catch {
        userId = null
      }

      /**
       * Check if user has liked this project
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      if (userId) {
        try {
          const userLikes = (await db.query(
            'SELECT id FROM project_likes WHERE user_id = ? AND project_id = ?',
            [userId, projectId]
          )) as any[]
          isLiked = userLikes.length > 0
        } catch {
          isLiked = false
        }
      }

      /**
       * Fetch comments from all tasks in this project
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      const fetchComments = async () => {
        try {
          /**
           * Get authenticated user ID from JWT token for isLiked calculation
           *
           * @author Thang Truong
           * @date 2025-01-27
           */
          let userId: number | null = null
          try {
            const authHeader = context.req?.headers?.authorization || ''
            if (authHeader && authHeader.startsWith('Bearer ')) {
              const token = authHeader.replace('Bearer ', '')
              const decoded = verifyAccessToken(token)
              if (decoded && decoded.userId) {
                userId = decoded.userId
              }
            }
          } catch {
            // User not authenticated - userId remains null
          }

          const comments = (await db.query(
            `SELECT 
              c.id, 
              c.uuid, 
              c.content, 
              c.task_id,
              c.created_at, 
              c.updated_at,
              u.id as user_id,
              u.first_name as user_first_name,
              u.last_name as user_last_name,
              u.email as user_email,
              u.role as user_role,
              u.uuid as user_uuid,
              u.created_at as user_created_at,
              u.updated_at as user_updated_at,
              COALESCE(cl.likes_count, 0) as likes_count,
              EXISTS(SELECT 1 FROM comment_likes WHERE user_id = ? AND comment_id = c.id) as is_liked
            FROM comments c
            INNER JOIN tasks t ON c.task_id = t.id
            LEFT JOIN users u ON c.user_id = u.id AND u.is_deleted = false
            LEFT JOIN (
              SELECT comment_id, COUNT(*) as likes_count
              FROM comment_likes
              GROUP BY comment_id
            ) cl ON c.id = cl.comment_id
            WHERE t.project_id = ? AND c.is_deleted = false AND t.is_deleted = false
            ORDER BY c.created_at DESC`,
            [userId || 0, projectId]
          )) as any[]

          /**
           * Format user object for comment author
           *
           * @author Thang Truong
           * @date 2025-01-27
           */
          const formatCommentUser = (comment: any) => {
            if (!comment.user_id) {
              return null
            }
            return {
              id: comment.user_id.toString(),
              uuid: comment.user_uuid || '',
              firstName: comment.user_first_name || '',
              lastName: comment.user_last_name || '',
              email: comment.user_email || '',
              role: comment.user_role || '',
              createdAt: formatDateToISO(comment.user_created_at),
              updatedAt: formatDateToISO(comment.user_updated_at),
            }
          }

          return comments.map((comment: any) => ({
            id: comment.id.toString(),
            uuid: comment.uuid || '',
            content: comment.content,
            taskId: comment.task_id.toString(),
            user: formatCommentUser(comment),
            likesCount: Number(comment.likes_count || 0),
            isLiked: Boolean(comment.is_liked || false),
            createdAt: formatDateToISO(comment.created_at),
            updatedAt: formatDateToISO(comment.updated_at),
          }))
        } catch {
          return []
        }
      }

      const [tasks, members, comments] = await Promise.all([fetchTasks(), fetchMembers(), fetchComments()])

      return {
        id: project.id.toString(),
        name: project.name,
        description: project.description,
        status: project.status,
        owner: formatUser(project),
        likesCount: Number(project.likes_count || 0),
        commentsCount: Number(project.comments_count || 0),
        isLiked,
        tasks,
        members,
        comments,
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
    updateProject: async (_: any, { id, input }: { id: string; input: any }, context: { req: any }) => {
      const actorUserId = tryGetUserIdFromRequest(context.req)
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
      const updatedProject = {
        id: project.id.toString(),
        name: project.name,
        description: project.description,
        status: project.status,
        createdAt: formatDateToISO(project.created_at),
        updatedAt: formatDateToISO(project.updated_at),
      }
      if (actorUserId) {
        const actorName = await getUserDisplayName(actorUserId)
        await notifyProjectParticipants({
          projectId: Number(project.id),
          actorUserId,
          message: `${actorName} updated project "${project.name}".`,
        })
      }
      return updatedProject
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
    deleteProject: async (_: any, { id }: { id: string }, context: { req: any }) => {
      const actorUserId = tryGetUserIdFromRequest(context.req)
      if (!actorUserId) {
        throw new Error('Authentication required. Please login to delete projects.')
      }

      /**
       * Get all task IDs for this project to clean up related records
       *
       * @author Thang Truong
       * @date 2025-11-25
       */
      const projectTasks = (await db.query(
        'SELECT id FROM tasks WHERE project_id = ? AND is_deleted = false',
        [id]
      )) as any[]

      const taskIds = projectTasks.map((t: any) => t.id)

      if (taskIds.length > 0) {
        /**
         * Delete task_tags for all tasks in the project
         *
         * @author Thang Truong
         * @date 2025-11-25
         */
        const taskPlaceholders = taskIds.map(() => '?').join(',')
        await db.query(`DELETE FROM task_tags WHERE task_id IN (${taskPlaceholders})`, taskIds)

        /**
         * Delete task_likes for all tasks in the project
         *
         * @author Thang Truong
         * @date 2025-11-25
         */
        await db.query(`DELETE FROM task_likes WHERE task_id IN (${taskPlaceholders})`, taskIds)

        /**
         * Get all comment IDs for tasks in this project
         *
         * @author Thang Truong
         * @date 2025-11-25
         */
        const taskComments = (await db.query(
          `SELECT id FROM comments WHERE task_id IN (${taskPlaceholders}) AND is_deleted = false`,
          taskIds
        )) as any[]

        const commentIds = taskComments.map((c: any) => c.id)

        if (commentIds.length > 0) {
          /**
           * Delete comment_likes for all comments on tasks in the project
           *
           * @author Thang Truong
           * @date 2025-11-25
           */
          const commentPlaceholders = commentIds.map(() => '?').join(',')
          await db.query(`DELETE FROM comment_likes WHERE comment_id IN (${commentPlaceholders})`, commentIds)
        }
      }

      /**
       * Delete project_likes before soft-deleting the project
       *
       * @author Thang Truong
       * @date 2025-11-25
       */
      await db.query('DELETE FROM project_likes WHERE project_id = ?', [id])

      /**
       * Soft delete the project
       * Triggers will cascade soft-delete tasks, project_members, and comments
       *
       * @author Thang Truong
       * @date 2025-11-25
       */
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
     * Like project mutation
     * Allows authenticated users to like a project
     * Requires authentication via JWT token
     *
     * @author Thang Truong
     * @date 2025-01-27
     * @param projectId - Project ID to like
     * @param context - GraphQL context containing request headers
     * @returns LikeProjectResponse with success status and updated likes count
     */
    likeProject: async (_: any, { projectId }: { projectId: string }, context: { req: any }) => {
      /**
       * Extract and verify JWT token from Authorization header
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      const authHeader = context.req?.headers?.authorization || ''
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Authentication required. Please login to like projects.')
      }

      const token = authHeader.replace('Bearer ', '')
      const decoded = verifyAccessToken(token)

      if (!decoded || !decoded.userId) {
        throw new Error('Invalid or expired token. Please login again.')
      }

      const userId = decoded.userId

      /**
       * Verify project exists and is not deleted
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      const projects = (await db.query(
        'SELECT id, name FROM projects WHERE id = ? AND is_deleted = false',
        [projectId]
      )) as any[]

      if (projects.length === 0) {
        throw new Error('Project not found or has been deleted')
      }

      /**
       * Check if user already liked this project
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      const existingLikes = (await db.query(
        'SELECT id FROM project_likes WHERE user_id = ? AND project_id = ?',
        [userId, projectId]
      )) as any[]

      if (existingLikes.length > 0) {
        /**
         * User already liked - delete the like (unlike)
         *
         * @author Thang Truong
         * @date 2025-01-27
         */
        await db.query(
          'DELETE FROM project_likes WHERE user_id = ? AND project_id = ?',
          [userId, projectId]
        )

        const likesCountResult = (await db.query(
          'SELECT COUNT(*) as count FROM project_likes WHERE project_id = ?',
          [projectId]
        )) as any[]

        return {
          success: true,
          message: 'Project unliked successfully',
          likesCount: Number(likesCountResult[0]?.count || 0),
          isLiked: false,
        }
      }

      const projectName = projects[0].name || 'this project'

      /**
       * User hasn't liked - insert new like into database
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      try {
        await db.query(
          'INSERT INTO project_likes (user_id, project_id) VALUES (?, ?)',
          [userId, projectId]
        )

        /**
         * Get updated likes count
         *
         * @author Thang Truong
         * @date 2025-01-27
         */
        const likesCountResult = (await db.query(
          'SELECT COUNT(*) as count FROM project_likes WHERE project_id = ?',
          [projectId]
        )) as any[]

        const response = {
          success: true,
          message: 'Project liked successfully',
          likesCount: Number(likesCountResult[0]?.count || 0),
          isLiked: true,
        }
        const actorName = await getUserDisplayName(userId)
        await notifyProjectParticipants({
          projectId: Number(projectId),
          actorUserId: userId,
          message: `${actorName} liked project "${projectName}".`,
        })
        return response
      } catch (error: any) {
        /**
         * Handle duplicate like error (should not happen due to check above, but safe fallback)
         *
         * @author Thang Truong
         * @date 2025-01-27
         */
        if (error.code === 'ER_DUP_ENTRY') {
          const likesCountResult = (await db.query(
            'SELECT COUNT(*) as count FROM project_likes WHERE project_id = ?',
            [projectId]
          )) as any[]

          const response = {
            success: true,
            message: 'Project liked successfully',
            likesCount: Number(likesCountResult[0]?.count || 0),
            isLiked: true,
          }
          const actorName = await getUserDisplayName(userId)
          await notifyProjectParticipants({
            projectId: Number(projectId),
            actorUserId: userId,
            message: `${actorName} liked project "${projectName}".`,
          })
          return response
        }
        throw new Error('Failed to like project. Please try again.')
      }
    },
    /**
     * Like task mutation
     * Allows authenticated users to like a task
     * Requires authentication via JWT token
     *
     * @author Thang Truong
     * @date 2025-01-27
     * @param taskId - Task ID to like
     * @param context - GraphQL context containing request headers
     * @returns LikeTaskResponse with success status and updated likes count
     */
    likeTask: async (_: any, { taskId }: { taskId: string }, context: { req: any }) => {
      /**
       * Extract and verify JWT token from Authorization header
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      const authHeader = context.req?.headers?.authorization || ''
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Authentication required. Please login to like tasks.')
      }

      const token = authHeader.replace('Bearer ', '')
      const decoded = verifyAccessToken(token)

      if (!decoded || !decoded.userId) {
        throw new Error('Invalid or expired token. Please login again.')
      }

      const userId = decoded.userId

      /**
       * Verify task exists and is not deleted
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      const tasks = (await db.query(
        `SELECT 
          t.id,
          t.title,
          t.project_id,
          p.owner_id
        FROM tasks t
        INNER JOIN projects p ON t.project_id = p.id AND p.is_deleted = false
        WHERE t.id = ? AND t.is_deleted = false`,
        [taskId]
      )) as any[]

      if (tasks.length === 0) {
        throw new Error('Task not found or has been deleted')
      }

      const task = tasks[0]

      /**
       * Ensure user is the project owner or active member before liking tasks
       *
       * @author Thang Truong
       * @date 2025-11-25
       */
      const isOwner = Number(task.owner_id) === Number(userId)
      if (!isOwner) {
        const membership = (await db.query(
          'SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ? AND is_deleted = false',
          [task.project_id, userId]
        )) as any[]

        if (membership.length === 0) {
          throw new Error('Only project members can like tasks. Please join this project first.')
        }
      }

      /**
       * Check if user already liked this task
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      const existingLikes = (await db.query(
        'SELECT id FROM task_likes WHERE user_id = ? AND task_id = ?',
        [userId, taskId]
      )) as any[]

      if (existingLikes.length > 0) {
        /**
         * User already liked - delete the like (unlike)
         *
         * @author Thang Truong
         * @date 2025-01-27
         */
        await db.query(
          'DELETE FROM task_likes WHERE user_id = ? AND task_id = ?',
          [userId, taskId]
        )

        const likesCountResult = (await db.query(
          'SELECT COUNT(*) as count FROM task_likes WHERE task_id = ?',
          [taskId]
        )) as any[]

        return {
          success: true,
          message: 'Task unliked successfully',
          likesCount: Number(likesCountResult[0]?.count || 0),
          isLiked: false,
        }
      }

      /**
       * User hasn't liked - insert new like into database
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      try {
        await db.query(
          'INSERT INTO task_likes (user_id, task_id) VALUES (?, ?)',
          [userId, taskId]
        )

        /**
         * Get updated likes count
         *
         * @author Thang Truong
         * @date 2025-01-27
         */
        const likesCountResult = (await db.query(
          'SELECT COUNT(*) as count FROM task_likes WHERE task_id = ?',
          [taskId]
        )) as any[]

        const response = {
          success: true,
          message: 'Task liked successfully',
          likesCount: Number(likesCountResult[0]?.count || 0),
          isLiked: true,
        }
        const actorName = await getUserDisplayName(userId)
        await notifyProjectParticipants({
          projectId: Number(task.project_id),
          actorUserId: userId,
          message: `${actorName} liked task "${task.title || 'Untitled task'}".`,
        })
        return response
      } catch (error: any) {
        /**
         * Handle duplicate like error (should not happen due to check above, but safe fallback)
         *
         * @author Thang Truong
         * @date 2025-01-27
         */
        if (error.code === 'ER_DUP_ENTRY') {
          const likesCountResult = (await db.query(
            'SELECT COUNT(*) as count FROM task_likes WHERE task_id = ?',
            [taskId]
          )) as any[]

          return {
            success: true,
            message: 'Task liked successfully',
            likesCount: Number(likesCountResult[0]?.count || 0),
            isLiked: true,
          }
        }
        throw new Error('Failed to like task. Please try again.')
      }
    },
    /**
     * Like comment mutation
     * Allows authenticated users to like a comment
     * Requires authentication via JWT token
     *
     * @author Thang Truong
     * @date 2025-01-27
     */
    likeComment: async (_: any, { commentId }: { commentId: string }, context: { req: any }) => {
      /**
       * Extract and verify JWT token from Authorization header
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      const authHeader = context.req?.headers?.authorization || ''
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Authentication required. Please login to like comments.')
      }

      const token = authHeader.replace('Bearer ', '')
      const decoded = verifyAccessToken(token)

      if (!decoded || !decoded.userId) {
        throw new Error('Invalid or expired token. Please login again.')
      }

      const userId = decoded.userId

      /**
       * Verify comment exists, belongs to valid project, and ensure membership
       *
       * @author Thang Truong
       * @date 2025-11-25
       */
      const commentRecords = (await db.query(
        `SELECT 
          c.id,
          c.task_id,
          t.project_id,
          p.owner_id
        FROM comments c
        LEFT JOIN tasks t ON c.task_id = t.id AND t.is_deleted = false
        INNER JOIN projects p ON t.project_id = p.id AND p.is_deleted = false
        WHERE c.id = ? AND c.is_deleted = false`,
        [commentId]
      )) as any[]

      if (commentRecords.length === 0) {
        throw new Error('Comment not found or has been deleted')
      }

      const commentRecord = commentRecords[0]
      const projectIdForComment = commentRecord.project_id
      const projectOwnerId = commentRecord.owner_id

      if (projectOwnerId !== userId) {
        const membership = (await db.query(
          'SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ? AND is_deleted = false',
          [projectIdForComment, userId]
        )) as any[]

        if (membership.length === 0) {
          throw new Error('Only project members can like comments.')
        }
      }

      /**
       * Helper to convert MySQL date values to ISO strings
       *
       * @author Thang Truong
       * @date 2025-11-25
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
        } catch {
          return new Date().toISOString()
        }
      }

      /**
       * Build subscription payload with latest comment data
       *
       * @author Thang Truong
       * @date 2025-11-25
       */
      const buildCommentPayload = async (likesCountValue: number, isLikedValue: boolean) => {
        const commentDetails = (await db.query(
          `SELECT 
            c.id,
            c.uuid,
            c.content,
            c.task_id,
            c.created_at,
            c.updated_at,
            u.id as user_id,
            u.first_name as user_first_name,
            u.last_name as user_last_name,
            u.email as user_email,
            u.role as user_role,
            u.uuid as user_uuid,
            u.created_at as user_created_at,
            u.updated_at as user_updated_at
          FROM comments c
          LEFT JOIN users u ON c.user_id = u.id AND u.is_deleted = false
          WHERE c.id = ?`,
          [commentId]
        )) as any[]

        if (commentDetails.length === 0) {
          return null
        }

        const comment = commentDetails[0]
        const formatCommentUser = (record: any) => {
          if (!record.user_id) {
            return null
          }
          return {
            id: record.user_id.toString(),
            uuid: record.user_uuid || '',
            firstName: record.user_first_name || '',
            lastName: record.user_last_name || '',
            email: record.user_email || '',
            role: record.user_role || '',
            createdAt: formatDateToISO(record.user_created_at),
            updatedAt: formatDateToISO(record.user_updated_at),
          }
        }

        return {
          id: comment.id.toString(),
          uuid: comment.uuid || '',
          content: comment.content,
          taskId: comment.task_id.toString(),
          user: formatCommentUser(comment),
          likesCount: likesCountValue,
          isLiked: isLikedValue,
          createdAt: formatDateToISO(comment.created_at),
          updatedAt: formatDateToISO(comment.updated_at),
        }
      }

      /**
       * Check if user already liked this comment
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      const existingLikes = (await db.query(
        'SELECT id FROM comment_likes WHERE user_id = ? AND comment_id = ?',
        [userId, commentId]
      )) as any[]

      let updatedLikesCount = 0
      let updatedIsLiked = false
      let responseMessage = ''

      if (existingLikes.length > 0) {
        /**
         * User already liked - delete the like (unlike)
         *
         * @author Thang Truong
         * @date 2025-01-27
         */
        await db.query(
          'DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?',
          [userId, commentId]
        )

        const likesCountResult = (await db.query(
          'SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ?',
          [commentId]
        )) as any[]

        updatedLikesCount = Number(likesCountResult[0]?.count || 0)
        updatedIsLiked = false
        responseMessage = 'Comment unliked successfully'
      } else {
      /**
       * User hasn't liked - insert new like into database
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      try {
        await db.query(
          'INSERT INTO comment_likes (user_id, comment_id) VALUES (?, ?)',
          [userId, commentId]
        )
        } catch (error: any) {
          if (error.code !== 'ER_DUP_ENTRY') {
            throw new Error('Failed to like comment. Please try again.')
          }
        }

        const likesCountResult = (await db.query(
          'SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ?',
          [commentId]
        )) as any[]

        updatedLikesCount = Number(likesCountResult[0]?.count || 0)
        updatedIsLiked = true
        responseMessage = 'Comment liked successfully'
      }

      const subscriptionPayload = await buildCommentPayload(updatedLikesCount, updatedIsLiked)

      if (subscriptionPayload) {
        await pubsub.publish(`COMMENT_LIKE_UPDATED_${projectIdForComment}`, {
          commentLikeUpdated: subscriptionPayload,
        })
      }

      const response = {
        success: true,
        message: responseMessage,
        likesCount: updatedLikesCount,
        isLiked: updatedIsLiked,
      }
      if (updatedIsLiked) {
        const actorName = await getUserDisplayName(userId)
        await notifyProjectParticipants({
          projectId: Number(projectIdForComment),
          actorUserId: userId,
          message: `${actorName} liked a comment on this project.`,
        })
      }
      return response
    },
    /**
     * Create comment mutation
     * Allows authenticated users to create comments for a project
     * Comments are stored linked to the first task in the project
     * Requires authentication via JWT token
     *
     * @author Thang Truong
     * @date 2025-01-27
     * @param projectId - Project ID to comment on
     * @param content - Comment content
     * @param context - GraphQL context containing request headers
     * @returns Created comment object
     */
    createComment: async (_: any, { projectId, content }: { projectId: string; content: string }, context: { req: any }) => {
      /**
       * Extract and verify JWT token from Authorization header
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      const authHeader = context.req?.headers?.authorization || ''
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Authentication required. Please login to post comments.')
      }

      const token = authHeader.replace('Bearer ', '')
      const decoded = verifyAccessToken(token)

      if (!decoded || !decoded.userId) {
        throw new Error('Invalid or expired token. Please login again.')
      }

      const userId = decoded.userId

      /**
       * Verify project exists and is not deleted, and check if user is a member
       * Only project members (or owner) can post comments
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      const projects = (await db.query(
        'SELECT id, owner_id FROM projects WHERE id = ? AND is_deleted = false',
        [projectId]
      )) as any[]

      if (projects.length === 0) {
        throw new Error('Project not found or has been deleted')
      }

      const project = projects[0]
      const isOwner = project.owner_id === userId

      /**
       * Check if user is a project member (if not the owner)
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      if (!isOwner) {
        const members = (await db.query(
          'SELECT user_id FROM project_members WHERE project_id = ? AND user_id = ? AND is_deleted = false',
          [projectId, userId]
        )) as any[]

        if (members.length === 0) {
          throw new Error('Only project members can view and post comments. Please join this project first.')
        }
      }

      /**
       * Get first task from project to link comment
       * Comments require a task_id in the database structure
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      const tasks = (await db.query(
        'SELECT id FROM tasks WHERE project_id = ? AND is_deleted = false ORDER BY id LIMIT 1',
        [projectId]
      )) as any[]

      if (tasks.length === 0) {
        throw new Error('Cannot post comments. Project must have at least one task.')
      }

      const taskId = tasks[0].id

      /**
       * Validate comment content
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      const trimmedContent = content.trim()
      if (!trimmedContent) {
        throw new Error('Comment content cannot be empty')
      }

      /**
       * Create comment in database
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      try {
        const commentUuid = uuidv4()
        const result = (await db.query(
          'INSERT INTO comments (uuid, task_id, user_id, content) VALUES (?, ?, ?, ?)',
          [commentUuid, taskId, userId, trimmedContent]
        )) as any

        /**
         * Fetch created comment with user information
         *
         * @author Thang Truong
         * @date 2025-01-27
         */
        const comments = (await db.query(
          `SELECT 
            c.id, 
            c.uuid, 
            c.content, 
            c.task_id,
            c.created_at, 
            c.updated_at,
            u.id as user_id,
            u.first_name as user_first_name,
            u.last_name as user_last_name,
            u.email as user_email,
            u.role as user_role,
            u.uuid as user_uuid,
            u.created_at as user_created_at,
            u.updated_at as user_updated_at
          FROM comments c
          LEFT JOIN users u ON c.user_id = u.id AND u.is_deleted = false
          WHERE c.id = ?`,
          [result.insertId]
        )) as any[]

        if (comments.length === 0) {
          throw new Error('Failed to retrieve created comment')
        }

        const comment = comments[0]

        /**
         * Convert MySQL DATETIME to ISO string for proper serialization
         *
         * @author Thang Truong
         * @date 2025-01-27
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
         * Format user object for comment author
         *
         * @author Thang Truong
         * @date 2025-01-27
         */
        const formatCommentUser = (comment: any) => {
          if (!comment.user_id) {
            throw new Error('User information not found for comment')
          }
          return {
            id: comment.user_id.toString(),
            uuid: comment.user_uuid || '',
            firstName: comment.user_first_name || '',
            lastName: comment.user_last_name || '',
            email: comment.user_email || '',
            role: comment.user_role || '',
            createdAt: formatDateToISO(comment.user_created_at),
            updatedAt: formatDateToISO(comment.user_updated_at),
          }
        }

        /**
         * Get likes count for the newly created comment (should be 0)
         *
         * @author Thang Truong
         * @date 2025-01-27
         */
        const likesCountResult = (await db.query(
          'SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ?',
          [comment.id]
        )) as any[]

        /**
         * Check if the authenticated user has liked this comment (should be false for new comments)
         *
         * @author Thang Truong
         * @date 2025-01-27
         */
        const isLikedResult = (await db.query(
          'SELECT 1 FROM comment_likes WHERE user_id = ? AND comment_id = ?',
          [userId, comment.id]
        )) as any[]

        const formattedComment = {
          id: comment.id.toString(),
          uuid: comment.uuid || '',
          content: comment.content,
          taskId: comment.task_id.toString(),
          user: formatCommentUser(comment),
          likesCount: Number(likesCountResult[0]?.count || 0),
          isLiked: Boolean(isLikedResult.length > 0),
          createdAt: formatDateToISO(comment.created_at),
          updatedAt: formatDateToISO(comment.updated_at),
        }

        /**
         * Publish comment created event for real-time subscriptions
         * Only project members (or owner) will receive the update
         *
         * @author Thang Truong
         * @date 2025-01-27
         */
        await pubsub.publish(`COMMENT_CREATED_${projectId}`, {
          commentCreated: formattedComment,
        })

        const actorName = await getUserDisplayName(userId)
        const previewContent = trimmedContent.length > 80 ? `${trimmedContent.slice(0, 77)}...` : trimmedContent
        await notifyProjectParticipants({
          projectId: Number(projectId),
          actorUserId: userId,
          message: `${actorName} commented: "${previewContent}".`,
        })

        return formattedComment
      } catch (error: any) {
        throw new Error(error.message || 'Failed to create comment. Please try again.')
      }
    },
    /**
     * Update comment mutation
     * Allows authenticated users to update their own comments
     * Requires authentication via JWT token and ownership verification
     *
     * @author Thang Truong
     * @date 2025-01-27
     * @param commentId - Comment ID to update
     * @param content - New comment content
     * @param context - GraphQL context containing request headers
     * @returns Updated comment object
     */
    updateComment: async (_: any, { commentId, content }: { commentId: string; content: string }, context: { req: any }) => {
      /**
       * Extract and verify JWT token from Authorization header
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      const authHeader = context.req?.headers?.authorization || ''
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Authentication required. Please login to edit comments.')
      }

      const token = authHeader.replace('Bearer ', '')
      const decoded = verifyAccessToken(token)

      if (!decoded || !decoded.userId) {
        throw new Error('Invalid or expired token. Please login again.')
      }

      const userId = decoded.userId

      if (!content || !content.trim()) {
        throw new Error('Comment content cannot be empty.')
      }

      /**
       * Verify comment exists, is not deleted, and belongs to the authenticated user
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      const comments = (await db.query(
        `SELECT c.id, c.user_id, c.version, c.created_at, c.updated_at, c.uuid, c.task_id,
          t.project_id,
          u.id as user_id, u.first_name as user_first_name, u.last_name as user_last_name,
          u.email as user_email, u.role as user_role, u.uuid as user_uuid,
          u.created_at as user_created_at, u.updated_at as user_updated_at
        FROM comments c
        LEFT JOIN tasks t ON c.task_id = t.id AND t.is_deleted = false
        LEFT JOIN users u ON c.user_id = u.id AND u.is_deleted = false
        WHERE c.id = ? AND c.is_deleted = false`,
        [commentId]
      )) as any[]

      if (comments.length === 0) {
        throw new Error('Comment not found or has been deleted')
      }

      const comment = comments[0]

      /**
       * Verify comment ownership
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      if (Number(comment.user_id) !== userId) {
        throw new Error('You can only edit your own comments.')
      }

      /**
       * Update comment content and version
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      try {
        await db.query(
          'UPDATE comments SET content = ?, version = version + 1, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ? AND user_id = ?',
          [content.trim(), commentId, userId]
        )

        /**
         * Fetch updated comment
         *
         * @author Thang Truong
         * @date 2025-01-27
         */
        const updatedComments = (await db.query(
          `SELECT c.id, c.user_id, c.version, c.created_at, c.updated_at, c.uuid, c.task_id, c.content,
            t.project_id,
            u.id as user_id, u.first_name as user_first_name, u.last_name as user_last_name,
            u.email as user_email, u.role as user_role, u.uuid as user_uuid,
            u.created_at as user_created_at, u.updated_at as user_updated_at
          FROM comments c
          LEFT JOIN tasks t ON c.task_id = t.id AND t.is_deleted = false
          LEFT JOIN users u ON c.user_id = u.id AND u.is_deleted = false
          WHERE c.id = ? AND c.is_deleted = false`,
          [commentId]
        )) as any[]

        if (updatedComments.length === 0) {
          throw new Error('Failed to retrieve updated comment')
        }

        const updatedComment = updatedComments[0]

        /**
         * Convert MySQL DATETIME to ISO string for proper serialization
         *
         * @author Thang Truong
         * @date 2025-01-27
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
         * Format user object for comment author
         *
         * @author Thang Truong
         * @date 2025-01-27
         */
        const formatCommentUser = (comment: any) => {
          if (!comment.user_id) {
            throw new Error('User information not found for comment')
          }
          return {
            id: comment.user_id.toString(),
            uuid: comment.user_uuid || '',
            firstName: comment.user_first_name || '',
            lastName: comment.user_last_name || '',
            email: comment.user_email || '',
            role: comment.user_role || '',
            createdAt: formatDateToISO(comment.user_created_at),
            updatedAt: formatDateToISO(comment.user_updated_at),
          }
        }

        /**
         * Get likes count for the comment
         *
         * @author Thang Truong
         * @date 2025-01-27
         */
        const likesCountResult = (await db.query(
          'SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ?',
          [commentId]
        )) as any[]

        const isLikedResult = (await db.query(
          'SELECT 1 FROM comment_likes WHERE user_id = ? AND comment_id = ?',
          [userId, commentId]
        )) as any[]

        const formattedComment = {
          id: updatedComment.id.toString(),
          uuid: updatedComment.uuid || '',
          content: updatedComment.content,
          taskId: updatedComment.task_id.toString(),
          user: formatCommentUser(updatedComment),
          likesCount: Number(likesCountResult[0]?.count || 0),
          isLiked: Boolean(isLikedResult.length > 0),
          createdAt: formatDateToISO(updatedComment.created_at),
          updatedAt: formatDateToISO(updatedComment.updated_at),
        }

        /**
         * Publish comment updated event for real-time subscriptions
         * Mirrors comment creation flow to keep clients synchronized
         *
         * @author Thang Truong
         * @date 2025-11-25
         */
        if (updatedComment.project_id) {
          await pubsub.publish(`COMMENT_UPDATED_${updatedComment.project_id}`, {
            commentUpdated: formattedComment,
          })
          const actorName = await getUserDisplayName(userId)
          const updatedPreview = content.trim().length > 80 ? `${content.trim().slice(0, 77)}...` : content.trim()
          await notifyProjectParticipants({
            projectId: Number(updatedComment.project_id),
            actorUserId: userId,
            message: `${actorName} updated a comment: "${updatedPreview}".`,
          })
        }

        return formattedComment
      } catch (error: any) {
        throw new Error(error.message || 'Failed to update comment. Please try again.')
      }
    },
    /**
     * Delete comment mutation
     * Allows authenticated users to delete their own comments
     * Requires authentication via JWT token and ownership verification
     *
     * @author Thang Truong
     * @date 2025-01-27
     * @param commentId - Comment ID to delete
     * @param context - GraphQL context containing request headers
     * @returns Boolean indicating success
     */
    deleteComment: async (_: any, { commentId }: { commentId: string }, context: { req: any }) => {
      /**
       * Extract and verify JWT token from Authorization header
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      const authHeader = context.req?.headers?.authorization || ''
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Authentication required. Please login to delete comments.')
      }

      const token = authHeader.replace('Bearer ', '')
      const decoded = verifyAccessToken(token)

      if (!decoded || !decoded.userId) {
        throw new Error('Invalid or expired token. Please login again.')
      }

      const userId = decoded.userId

      /**
       * Verify comment exists, is not deleted, and belongs to the authenticated user
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      const comments = (await db.query(
        `SELECT 
          c.id,
          c.user_id,
          c.uuid,
          c.content,
          c.task_id,
          c.created_at,
          c.updated_at,
          t.project_id,
          u.id as user_id,
          u.first_name as user_first_name,
          u.last_name as user_last_name,
          u.email as user_email,
          u.role as user_role,
          u.uuid as user_uuid,
          u.created_at as user_created_at,
          u.updated_at as user_updated_at
        FROM comments c
        LEFT JOIN tasks t ON c.task_id = t.id AND t.is_deleted = false
        LEFT JOIN users u ON c.user_id = u.id AND u.is_deleted = false
        WHERE c.id = ? AND c.is_deleted = false`,
        [commentId]
      )) as any[]

      if (comments.length === 0) {
        throw new Error('Comment not found or has been deleted')
      }

      const comment = comments[0]

      /**
       * Verify comment ownership
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      if (Number(comment.user_id) !== userId) {
        throw new Error('You can only delete your own comments.')
      }

      /**
       * Soft delete comment (mark as deleted)
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      /**
       * Helper to convert MySQL DATETIME to ISO strings
       *
       * @author Thang Truong
       * @date 2025-11-25
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
        } catch {
          return new Date().toISOString()
        }
      }

      /**
       * Format user information for deleted comment payload
       *
       * @author Thang Truong
       * @date 2025-11-25
       */
      const formatCommentUser = (record: any) => {
        if (!record.user_id) {
          throw new Error('User information not found for comment')
        }
        return {
          id: record.user_id.toString(),
          uuid: record.user_uuid || '',
          firstName: record.user_first_name || '',
          lastName: record.user_last_name || '',
          email: record.user_email || '',
          role: record.user_role || '',
          createdAt: formatDateToISO(record.user_created_at),
          updatedAt: formatDateToISO(record.user_updated_at),
        }
      }

      /**
       * Fetch likes count for deleted comment to provide consistent payload
       *
       * @author Thang Truong
       * @date 2025-11-25
       */
      const likesCountResult = (await db.query(
        'SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ?',
        [commentId]
      )) as any[]

      const formattedDeletedComment = {
        id: comment.id.toString(),
        uuid: comment.uuid || '',
        content: comment.content,
        taskId: comment.task_id ? comment.task_id.toString() : '',
        user: formatCommentUser(comment),
        likesCount: Number(likesCountResult[0]?.count || 0),
        isLiked: false,
        createdAt: formatDateToISO(comment.created_at),
        updatedAt: formatDateToISO(comment.updated_at),
      }

      try {
        /**
         * Delete associated comment_likes before soft-deleting the comment
         * This cleans up likes to prevent orphaned records
         *
         * @author Thang Truong
         * @date 2025-11-25
         */
        await db.query('DELETE FROM comment_likes WHERE comment_id = ?', [commentId])

        /**
         * Soft delete the comment
         *
         * @author Thang Truong
         * @date 2025-11-25
         */
        await db.query('UPDATE comments SET is_deleted = true WHERE id = ? AND user_id = ?', [commentId, userId])

        /**
         * Publish comment deleted subscription event
         * Notifies all members to refresh their view immediately
         *
         * @author Thang Truong
         * @date 2025-11-25
         */
        if (comment.project_id) {
          await pubsub.publish(`COMMENT_DELETED_${comment.project_id}`, {
            commentDeleted: formattedDeletedComment,
          })
          const actorName = await getUserDisplayName(userId)
          await notifyProjectParticipants({
            projectId: Number(comment.project_id),
            actorUserId: userId,
            message: `${actorName} deleted a comment from the project.`,
          })
        }

        return true
      } catch (error: any) {
        throw new Error(error.message || 'Failed to delete comment. Please try again.')
      }
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
    createTask: async (_: any, { input }: { input: any }, context: { req: any }) => {
      const actorUserId = tryGetUserIdFromRequest(context.req)
      if (!actorUserId) {
        throw new Error('Authentication required. Please login to create tasks.')
      }
      const { title, description, status, priority, dueDate, projectId, assignedTo, tagIds } = input
      
      // Generate UUID for task
      const taskUuid = uuidv4()

      const result = (await db.query(
        'INSERT INTO tasks (uuid, title, description, status, priority, due_date, project_id, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [taskUuid, title, description, status, priority || 'MEDIUM', dueDate || null, projectId, assignedTo || null]
      )) as any
      
      const taskId = result.insertId
      
      /**
       * Insert tag associations if tagIds provided
       *
       * @author Thang Truong
       * @date 2025-11-25
       */
      if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
        const tagValues = tagIds.map((tagId: string) => [taskId, Number(tagId)])
        for (const [tId, tagId] of tagValues) {
          await db.query(
            'INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)',
            [tId, tagId]
          )
        }
      }
      
      const tasks = (await db.query(
        'SELECT id, uuid, title, description, status, priority, due_date, project_id, assigned_to, created_at, updated_at FROM tasks WHERE id = ?',
        [taskId]
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
      const formattedTask = {
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
      const actorName = await getUserDisplayName(actorUserId)
      await notifyProjectParticipants({
        projectId: Number(projectId),
        actorUserId,
        message: `${actorName} created task "${task.title}".`,
      })
      return formattedTask
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
    updateTask: async (_: any, { id, input }: { id: string; input: any }, context: { req: any }) => {
      const actorUserId = tryGetUserIdFromRequest(context.req)
      if (!actorUserId) {
        throw new Error('Authentication required. Please login to update tasks.')
      }
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

      /**
       * Handle tag associations update
       * Replace existing tags with new tag selection
       *
       * @author Thang Truong
       * @date 2025-11-25
       */
      if (input.tagIds !== undefined) {
        // Delete existing tag associations
        await db.query('DELETE FROM task_tags WHERE task_id = ?', [id])
        
        // Insert new tag associations if provided
        if (Array.isArray(input.tagIds) && input.tagIds.length > 0) {
          for (const tagId of input.tagIds) {
            await db.query(
              'INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)',
              [Number(id), Number(tagId)]
            )
          }
        }
      }

      if (updates.length === 0 && input.tagIds === undefined) {
        throw new Error('No fields to update')
      }

      if (updates.length > 0) {
        values.push(id)
        await db.query(
          `UPDATE tasks SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ? AND is_deleted = false`,
          values
        )
      }

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
      const updatedTask = {
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
      const actorName = await getUserDisplayName(actorUserId)
      await notifyProjectParticipants({
        projectId: Number(task.project_id),
        actorUserId,
        message: `${actorName} updated task "${task.title}".`,
      })
      return updatedTask
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
    deleteTask: async (_: any, { id }: { id: string }, context: { req: any }) => {
      const actorUserId = tryGetUserIdFromRequest(context.req)
      if (!actorUserId) {
        throw new Error('Authentication required. Please login to delete tasks.')
      }

      const tasks = (await db.query(
        'SELECT id, title, project_id FROM tasks WHERE id = ? AND is_deleted = false',
        [id]
      )) as any[]

      if (tasks.length === 0) {
        throw new Error('Task not found or already deleted')
      }

      /**
       * Delete associated task_tags records before soft-deleting the task
       * This cleans up the junction table to prevent orphaned records
       *
       * @author Thang Truong
       * @date 2025-11-25
       */
      await db.query('DELETE FROM task_tags WHERE task_id = ?', [id])

      /**
       * Delete associated task_likes records before soft-deleting the task
       * This cleans up likes to prevent orphaned records
       *
       * @author Thang Truong
       * @date 2025-11-25
       */
      await db.query('DELETE FROM task_likes WHERE task_id = ?', [id])

      /**
       * Soft delete the task by setting is_deleted flag
       *
       * @author Thang Truong
       * @date 2025-11-25
       */
      await db.query(
        'UPDATE tasks SET is_deleted = true, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ? AND is_deleted = false',
        [id]
      )

      const actorName = await getUserDisplayName(actorUserId)
      await notifyProjectParticipants({
        projectId: Number(tasks[0].project_id),
        actorUserId,
        message: `${actorName} deleted task "${tasks[0].title}".`,
      })

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
      return createNotificationRecord(Number(userId), message, Boolean(isRead))
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
    createTeamMember: async (_: any, { input }: { input: { projectId: string; userId: string; role?: string } }, context: { req: any }) => {
      const actorUserId = tryGetUserIdFromRequest(context.req)
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

      const createdMember = await fetchTeamMemberRecord(projectId, userId)
      if (actorUserId) {
        const actorName = await getUserDisplayName(actorUserId)
        await notifyProjectParticipants({
          projectId: Number(projectId),
          actorUserId,
          message: `${actorName} added ${createdMember.memberName || 'a new teammate'} to the project.`,
        })
      }
      return createdMember
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
  Subscription: {
    /**
     * Comment created subscription
     * Real-time subscription for new comments on a project
     * Only project members (or owner) can subscribe
     *
     * @author Thang Truong
     * @date 2025-01-27
     */
    commentCreated: {
      subscribe: (_: any, { projectId }: { projectId: string }) => {
        return pubsub.asyncIterator(`COMMENT_CREATED_${projectId}`)
      },
      resolve: (payload: any) => {
        // Extract commentCreated from payload published by createComment mutation
        return payload.commentCreated
      },
    },
    /**
     * Comment like updated subscription
     * Real-time subscription for comment like/unlike events on a project
     *
     * @author Thang Truong
     * @date 2025-11-25
     */
    commentLikeUpdated: {
      subscribe: (_: any, { projectId }: { projectId: string }) => {
        return pubsub.asyncIterator(`COMMENT_LIKE_UPDATED_${projectId}`)
      },
      resolve: (payload: any) => {
        return payload.commentLikeUpdated
      },
    },
    /**
     * Comment updated subscription
     * Real-time subscription for edited comments on a project
     *
     * @author Thang Truong
     * @date 2025-11-25
     */
    commentUpdated: {
      subscribe: (_: any, { projectId }: { projectId: string }) => {
        return pubsub.asyncIterator(`COMMENT_UPDATED_${projectId}`)
      },
      resolve: (payload: any) => {
        return payload.commentUpdated
      },
    },
    /**
     * Comment deleted subscription
     * Real-time subscription for deleted comments on a project
     *
     * @author Thang Truong
     * @date 2025-11-25
     */
    commentDeleted: {
      subscribe: (_: any, { projectId }: { projectId: string }) => {
        return pubsub.asyncIterator(`COMMENT_DELETED_${projectId}`)
      },
      resolve: (payload: any) => {
        return payload.commentDeleted
      },
    },
    /**
     * Notification created subscription
     * Delivers newly created notifications to subscribed users
     *
     * @author Thang Truong
     * @date 2025-11-26
     */
    notificationCreated: {
      subscribe: (_: any, { userId }: { userId: string }) => {
        return pubsub.asyncIterator(`NOTIFICATION_CREATED_${userId}`)
      },
      resolve: (payload: any) => {
        return payload.notificationCreated
      },
    },
  },
  /**
   * Task Type Resolver
   * Resolves additional fields for Task type
   *
   * @author Thang Truong
   * @date 2025-11-25
   */
  Task: {
    /**
     * Resolve tags for a task
     * Fetches all tags associated with the task via task_tags junction table
     *
     * @author Thang Truong
     * @date 2025-11-25
     * @param parent - Parent task object containing the task id
     * @returns Array of tag objects
     */
    tags: async (parent: { id: string }) => {
      try {
        const taskId = Number(parent.id)
        const tags = (await db.query(
          `SELECT t.id, t.name, t.description, t.title, t.type, t.category, t.created_at, t.updated_at
           FROM tags t
           INNER JOIN task_tags tt ON t.id = tt.tag_id
           WHERE tt.task_id = ?
           ORDER BY t.name ASC`,
          [taskId]
        )) as any[]

        /**
         * Convert MySQL DATETIME to ISO string for proper serialization
         *
         * @author Thang Truong
         * @date 2025-11-25
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
          } catch {
            return new Date().toISOString()
          }
        }

        return tags.map((tag: any) => ({
          id: tag.id.toString(),
          name: tag.name,
          description: tag.description || null,
          title: tag.title || null,
          type: tag.type || null,
          category: tag.category || null,
          createdAt: formatDateToISO(tag.created_at),
          updatedAt: formatDateToISO(tag.updated_at),
        }))
      } catch {
        return []
      }
    },
  },
}

