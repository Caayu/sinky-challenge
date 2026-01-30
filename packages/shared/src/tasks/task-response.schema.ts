import { z } from 'zod'

export const taskResponseSchema = z.object({
  id: z.string().uuid().describe('The unique identifier of the task'),
  title: z.string().describe('The title of the task'),
  description: z.string().optional().describe('The detailed description of the task'),
  isCompleted: z.boolean().describe('Whether the task is completed'),
  createdAt: z.date().describe('The date and time when the task was created')
})

export type TaskResponse = z.infer<typeof taskResponseSchema>
