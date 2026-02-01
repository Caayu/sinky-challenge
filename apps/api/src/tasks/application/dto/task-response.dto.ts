import { createZodDto } from 'nestjs-zod'
import { taskResponseSchema } from '@repo/shared'

export class TaskResponseDto extends createZodDto(taskResponseSchema) {}
