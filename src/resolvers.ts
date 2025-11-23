import { db } from './db'

export const resolvers = {
  Query: {
    hello: () => 'Hello from GraphQL!',
    projects: async () => {
      const projects = (await db.query('SELECT * FROM projects ORDER BY createdAt DESC')) as any[]
      return projects
    },
    project: async (_: any, { id }: { id: string }) => {
      const projects = (await db.query('SELECT * FROM projects WHERE id = ?', [id])) as any[]
      return projects[0] || null
    },
  },
  Mutation: {
    createProject: async (_: any, { input }: { input: any }) => {
      const { name, description, status } = input
      const result = (await db.query(
        'INSERT INTO projects (name, description, status) VALUES (?, ?, ?)',
        [name, description || null, status]
      )) as any
      const projects = (await db.query('SELECT * FROM projects WHERE id = ?', [
        result.insertId,
      ])) as any[]
      return projects[0]
    },
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
        `UPDATE projects SET ${updates.join(', ')}, updatedAt = NOW() WHERE id = ?`,
        values
      )

      const projects = (await db.query('SELECT * FROM projects WHERE id = ?', [id])) as any[]
      return projects[0]
    },
    deleteProject: async (_: any, { id }: { id: string }) => {
      await db.query('DELETE FROM projects WHERE id = ?', [id])
      return true
    },
  },
}

