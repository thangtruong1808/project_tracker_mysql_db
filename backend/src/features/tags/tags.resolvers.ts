/**
 * Tags Feature Resolvers
 * Handles tag queries and mutations
 * CRUD operations for tag management
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { db } from '../../db'
import { formatDateToISO } from '../../utils/formatters'

/**
 * Tags Query Resolvers
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const tagsQueryResolvers = {
  /**
   * Fetch all tags
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  tags: async () => {
    const tags = (await db.query(
      'SELECT id, name, description, title, type, category, created_at, updated_at FROM tags ORDER BY created_at DESC'
    )) as any[]

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
   * Fetch single tag by ID
   *
   * @author Thang Truong
   * @date 2025-11-26
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
}

/**
 * Tags Mutation Resolvers
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const tagsMutationResolvers = {
  /**
   * Create tag mutation
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  createTag: async (_: any, { input }: { input: any }) => {
    const { name, description, title, type, category } = input

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
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  updateTag: async (_: any, { id, input }: { id: string; input: any }) => {
    const updates: string[] = []
    const values: any[] = []

    if (input.name !== undefined) {
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
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  deleteTag: async (_: any, { id }: { id: string }) => {
    const result = (await db.query('DELETE FROM tags WHERE id = ?', [id])) as any
    if (result.affectedRows === 0) {
      throw new Error('Tag not found')
    }
    return true
  },
}

