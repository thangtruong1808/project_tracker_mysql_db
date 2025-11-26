/**
 * Search Feature Resolvers
 * Handles search queries for dashboard
 * Filters projects and tasks by keyword and status
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { db } from '../../db'
import { formatDateToISO, formatUser } from '../../utils/formatters'
import { tryGetUserIdFromRequest, clampPageSize, clampPageNumber, applySearchFilters } from '../../utils/helpers'

/**
 * Search Query Resolvers
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const searchQueryResolvers = {
  /**
   * Search dashboard resources
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  searchDashboard: async (_: any, { input }: { input: any }, context: { req: any }) => {
    const searchTerm = input?.query?.trim() || ''
    const projectStatuses = Array.isArray(input?.projectStatuses) ? input.projectStatuses.filter((s: string) => !!s) : []
    const taskStatuses = Array.isArray(input?.taskStatuses) ? input.taskStatuses.filter((s: string) => !!s) : []

    const projectPageSize = clampPageSize(input?.projectPageSize)
    const taskPageSize = clampPageSize(input?.taskPageSize)
    const projectPage = clampPageNumber(input?.projectPage)
    const taskPage = clampPageNumber(input?.taskPage)

    const shouldSearchProjects = Boolean(searchTerm) || projectStatuses.length > 0
    const shouldSearchTasks = Boolean(searchTerm) || taskStatuses.length > 0

    const userId = tryGetUserIdFromRequest(context.req)

    let userLikedProjects: Set<number> = new Set()
    let userLikedTasks: Set<number> = new Set()

    if (userId) {
      const userProjectLikes = (await db.query('SELECT project_id FROM project_likes WHERE user_id = ?', [userId])) as any[]
      userLikedProjects = new Set(userProjectLikes.map((like: any) => Number(like.project_id)))

      const userTaskLikes = (await db.query('SELECT task_id FROM task_likes WHERE user_id = ?', [userId])) as any[]
      userLikedTasks = new Set(userTaskLikes.map((like: any) => Number(like.task_id)))
    }

    const projectValues: any[] = []
    const baseProjectSql = `SELECT p.id, p.name, p.description, p.status, p.owner_id, p.updated_at,
      u.id as owner_user_id, u.first_name as owner_first_name, u.last_name as owner_last_name,
      u.email as owner_email, u.role as owner_role, u.uuid as owner_uuid,
      u.created_at as owner_created_at, u.updated_at as owner_updated_at,
      COALESCE(pl.likes_count, 0) as likes_count, COALESCE(pc.comments_count, 0) as comments_count
    FROM projects p
    LEFT JOIN users u ON p.owner_id = u.id AND u.is_deleted = false
    LEFT JOIN (SELECT project_id, COUNT(*) as likes_count FROM project_likes GROUP BY project_id) pl ON p.id = pl.project_id
    LEFT JOIN (SELECT t.project_id, COUNT(*) as comments_count FROM comments c
      INNER JOIN tasks t ON c.task_id = t.id WHERE c.is_deleted = false AND t.is_deleted = false GROUP BY t.project_id) pc ON p.id = pc.project_id
    WHERE p.is_deleted = false`

    let projectSql = applySearchFilters(baseProjectSql, searchTerm, projectStatuses, projectValues, ['p.name', 'p.description'])
    const projectOffset = (projectPage - 1) * projectPageSize
    projectSql += ` ORDER BY p.updated_at DESC LIMIT ${projectPageSize} OFFSET ${projectOffset}`

    const projectCountValues: any[] = []
    const projectCountSql = applySearchFilters('SELECT COUNT(*) as total FROM projects WHERE is_deleted = false', searchTerm, projectStatuses, projectCountValues, ['name', 'description'])

    const taskValues: any[] = []
    const baseTaskSql = `SELECT t.id, t.title, t.description, t.status, t.project_id, t.assigned_to, t.updated_at,
      u.id as owner_user_id, u.first_name as owner_first_name, u.last_name as owner_last_name,
      u.email as owner_email, u.role as owner_role, u.uuid as owner_uuid,
      u.created_at as owner_created_at, u.updated_at as owner_updated_at,
      COALESCE(tl.likes_count, 0) as likes_count, COALESCE(tc.comments_count, 0) as comments_count
    FROM tasks t
    LEFT JOIN users u ON t.assigned_to = u.id AND u.is_deleted = false
    LEFT JOIN (SELECT task_id, COUNT(*) as likes_count FROM task_likes GROUP BY task_id) tl ON t.id = tl.task_id
    LEFT JOIN (SELECT task_id, COUNT(*) as comments_count FROM comments WHERE is_deleted = false GROUP BY task_id) tc ON t.id = tc.task_id
    WHERE t.is_deleted = false`

    let taskSql = applySearchFilters(baseTaskSql, searchTerm, taskStatuses, taskValues, ['t.title', 't.description'])
    const taskOffset = (taskPage - 1) * taskPageSize
    taskSql += ` ORDER BY t.updated_at DESC LIMIT ${taskPageSize} OFFSET ${taskOffset}`

    const taskCountValues: any[] = []
    const taskCountSql = applySearchFilters('SELECT COUNT(*) as total FROM tasks WHERE is_deleted = false', searchTerm, taskStatuses, taskCountValues, ['title', 'description'])

    const [projects, projectCountResult, tasks, taskCountResult] = await Promise.all([
      shouldSearchProjects ? (db.query(projectSql, projectValues) as Promise<any[]>) : Promise.resolve([]),
      shouldSearchProjects ? (db.query(projectCountSql, projectCountValues) as Promise<any[]>) : Promise.resolve([{ total: 0 }]),
      shouldSearchTasks ? (db.query(taskSql, taskValues) as Promise<any[]>) : Promise.resolve([]),
      shouldSearchTasks ? (db.query(taskCountSql, taskCountValues) as Promise<any[]>) : Promise.resolve([{ total: 0 }]),
    ])

    return {
      projects: projects.map((project: any) => ({
        id: project.id.toString(),
        name: project.name,
        status: project.status,
        description: project.description,
        owner: formatUser(project, 'owner_'),
        likesCount: Number(project.likes_count || 0),
        commentsCount: Number(project.comments_count || 0),
        isLiked: userId ? userLikedProjects.has(Number(project.id)) : false,
        updatedAt: formatDateToISO(project.updated_at),
      })),
      tasks: tasks.map((task: any) => ({
        id: task.id.toString(),
        title: task.title,
        status: task.status,
        projectId: task.project_id ? task.project_id.toString() : '',
        description: task.description,
        owner: formatUser(task, 'owner_'),
        likesCount: Number(task.likes_count || 0),
        commentsCount: Number(task.comments_count || 0),
        isLiked: userId ? userLikedTasks.has(Number(task.id)) : false,
        updatedAt: formatDateToISO(task.updated_at),
      })),
      projectTotal: Number(projectCountResult[0]?.total || 0),
      taskTotal: Number(taskCountResult[0]?.total || 0),
    }
  },
}

export const searchMutationResolvers = {}

