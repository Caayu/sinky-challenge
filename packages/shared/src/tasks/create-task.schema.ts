import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long').describe('Task title (e.g., Implement Auth)'),

  description: z.string().optional().describe('Optional details')
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
