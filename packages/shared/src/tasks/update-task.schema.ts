import { z } from 'zod'
import { TaskCategory, TaskPriority } from './enums'

export const updateTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long').describe('Task title').optional(),
  description: z.string().describe('Task description').optional(),
  category: z.nativeEnum(TaskCategory).describe('Task category').optional(),
  priority: z.nativeEnum(TaskPriority).describe('Task priority').optional(),
  suggestedDeadline: z.string().nullable().describe('Suggested deadline (ISO Date)').optional(),
  isCompleted: z.boolean().describe('Task completion status').optional()
})

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
