import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const suggestSubtasksSchema = z.object({
  title: z.string().min(3).describe('Task title to generate subtasks for')
})

export class SuggestSubtasksDto extends createZodDto(suggestSubtasksSchema) {}
