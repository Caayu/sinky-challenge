import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long').describe('Task title (e.g., Implement Auth)'),

  description: z.string().optional().describe('Optional details'),

  category: z.enum(['WORK', 'PERSONAL', 'HEALTH', 'FINANCE', 'SHOPPING']).optional().describe('Task category'),

  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional().describe('Task priority'),

  suggestedDeadline: z.string().optional().nullable().describe('Suggested deadline (ISO Date)')
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
