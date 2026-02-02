import { z } from 'zod'
import { TaskCategory, TaskPriority } from './enums'

export const createTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long').describe('Task title (e.g., Implement Auth)'),

  description: z.string().optional().describe('Optional details'),

  category: z.nativeEnum(TaskCategory).optional().describe('Task category'),

  priority: z.nativeEnum(TaskPriority).optional().describe('Task priority'),

  suggestedDeadline: z.string().optional().nullable().describe('Suggested deadline (ISO Date)')
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
