/**
 * Activity Log Maintenance Utility
 * Keeps task-related activity logs in sync with their assigned users
 *
 * @author Thang Truong
 * @date 2025-11-24
 */

import { db } from '../db'

/**
 * Ensure activity logs always store the task assignee in target_user_id.
 * - Backfills missing target_user_id values using the current task assignment.
 * - Recreates task triggers so future inserts/updates persist the assignee.
 *
 * @author Thang Truong
 * @date 2025-11-24
 */
export const ensureActivityLogTargetUsers = async () => {
  await backfillMissingTargets()
  await refreshTaskActivityTriggers()
}

/**
 * Backfill target_user_id for existing activity logs where it is missing.
 *
 * @author Thang Truong
 * @date 2025-11-24
 */
const backfillMissingTargets = async () => {
  await db.query(`
    UPDATE activity_logs AS al
    LEFT JOIN tasks AS t ON al.task_id = t.id
    SET al.target_user_id = t.assigned_to
    WHERE al.target_user_id IS NULL
      AND t.assigned_to IS NOT NULL
  `)
}

/**
 * Recreate task triggers so they store the task assignee as the target user.
 *
 * @author Thang Truong
 * @date 2025-11-24
 */
const refreshTaskActivityTriggers = async () => {
  const statements = [
    'DROP TRIGGER IF EXISTS trg_tasks_after_insert_log',
    `
      CREATE TRIGGER trg_tasks_after_insert_log
      AFTER INSERT ON tasks
      FOR EACH ROW
      INSERT INTO activity_logs (
        user_id,
        target_user_id,
        project_id,
        task_id,
        type,
        metadata,
        created_at
      ) VALUES (
        COALESCE(NEW.assigned_to, 1),
        NEW.assigned_to,
        NEW.project_id,
        NEW.id,
        'TASK_CREATED',
        JSON_OBJECT('uuid', NEW.uuid, 'title', NEW.title, 'status', NEW.status),
        NOW(3)
      )
    `,
    'DROP TRIGGER IF EXISTS trg_tasks_after_update_log',
    `
      CREATE TRIGGER trg_tasks_after_update_log
      AFTER UPDATE ON tasks
      FOR EACH ROW
      INSERT INTO activity_logs (
        user_id,
        target_user_id,
        project_id,
        task_id,
        type,
        metadata,
        created_at
      ) VALUES (
        COALESCE(NEW.assigned_to, 1),
        NEW.assigned_to,
        NEW.project_id,
        NEW.id,
        CASE
          WHEN NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE THEN 'TASK_DELETED'
          ELSE 'TASK_UPDATED'
        END,
        CASE
          WHEN NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE THEN JSON_OBJECT('uuid', NEW.uuid)
          ELSE JSON_OBJECT('uuid', NEW.uuid, 'version', NEW.version)
        END,
        NOW(3)
      )
    `,
  ]

  await runRawStatements(statements)
}

/**
 * Execute DDL statements without prepared-statements restrictions.
 *
 * @author Thang Truong
 * @date 2025-11-24
 */
const runRawStatements = async (statements: string[]) => {
  const connection = await db.getConnection()
  try {
    for (const statement of statements) {
      await connection.query(statement)
    }
  } finally {
    connection.release()
  }
}


