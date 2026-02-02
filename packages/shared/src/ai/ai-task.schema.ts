import { z } from 'zod'
import { TaskCategory, TaskPriority } from '../tasks/enums' // Assuming enums is in the same directory or adjust path

// But ai-task.schema.ts is in `src/ai`, enums are in `src/tasks`.
// I need to check the path. `src/tasks/enums.ts`.
// So path should be `../tasks/enums`.

export const AiTaskResponseSchema = z.object({
  title: z.string().describe('Clear and concise action title'),
  description: z.string().describe('Detailed description inferred from text'),
  category: z.nativeEnum(TaskCategory).describe('Task category'),
  priority: z.nativeEnum(TaskPriority).describe('Task priority'),
  suggestedDeadline: z.string().nullable().describe('Suggested deadline in ISO format or null')
})

export type AiTaskResponse = z.infer<typeof AiTaskResponseSchema>
