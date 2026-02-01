import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { AiTaskResponseSchema } from '@repo/shared'

export const enhanceTaskSchema = z.object({
  text: z.string().min(3).describe('Raw text input to generate task from')
})

export class EnhanceTaskDto extends createZodDto(enhanceTaskSchema) {}

export class EnhancedTaskResponseDto extends createZodDto(AiTaskResponseSchema) {}
