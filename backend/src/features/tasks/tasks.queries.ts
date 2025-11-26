/**
 * Tasks Query Resolvers
 * Handles task query operations
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { db } from '../../db'
import { formatDateToISO } from '../../utils/formatters'

/**
 * Tasks Query Resolvers
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const tasksQueryResolvers = {
  /**
   * Fetch all tasks with tags
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  tasks: async () => {
    const tasks = (await db.query(
      `SELECT t.id, t.uuid, t.title, t.description, t.status, t.priority, t.due_date,
        t.project_id, t.assigned_to, t.created_at, t.updated_at
      FROM tasks t WHERE t.is_deleted = false ORDER BY t.created_at DESC`
    )) as any[]

    const taskIds = tasks.map((t: any) => t.id)
    const taskTagsMap = new Map<number, any[]>()

    if (taskIds.length > 0) {
      const placeholders = taskIds.map(() => '?').join(',')
      const taskTags = (await db.query(
        `SELECT tt.task_id, tg.id, tg.name, tg.description, tg.category
        FROM task_tags tt INNER JOIN tags tg ON tt.tag_id = tg.id
        WHERE tt.task_id IN (${placeholders})`,
        taskIds
      )) as any[]

      taskTags.forEach((tag: any) => {
        const tags = taskTagsMap.get(tag.task_id) || []
        tags.push({ id: tag.id.toString(), name: tag.name, description: tag.description, category: tag.category })
        taskTagsMap.set(tag.task_id, tags)
      })
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
      tags: taskTagsMap.get(task.id) || [],
      createdAt: formatDateToISO(task.created_at),
      updatedAt: formatDateToISO(task.updated_at),
    }))
  },

  /**
   * Fetch single task by ID
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  task: async (_: any, { id }: { id: string }) => {
    const tasks = (await db.query(
      `SELECT t.id, t.uuid, t.title, t.description, t.status, t.priority, t.due_date,
        t.project_id, t.assigned_to, t.created_at, t.updated_at
      FROM tasks t WHERE t.id = ? AND t.is_deleted = false`,
      [id]
    )) as any[]

    if (tasks.length === 0) return null

    const task = tasks[0]
    const taskTags = (await db.query(
      `SELECT tg.id, tg.name, tg.description, tg.category
      FROM task_tags tt INNER JOIN tags tg ON tt.tag_id = tg.id WHERE tt.task_id = ?`,
      [id]
    )) as any[]

    return {
      id: task.id.toString(),
      uuid: task.uuid || '',
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.due_date ? formatDateToISO(task.due_date) : null,
      projectId: task.project_id.toString(),
      assignedTo: task.assigned_to ? task.assigned_to.toString() : null,
      tags: taskTags.map((tag: any) => ({
        id: tag.id.toString(), name: tag.name, description: tag.description, category: tag.category
      })),
      createdAt: formatDateToISO(task.created_at),
      updatedAt: formatDateToISO(task.updated_at),
    }
  },
}

