import { createZodDto } from 'nestjs-zod'
import { updateTaskSchema } from '@repo/shared'

export class UpdateTaskDto extends createZodDto(updateTaskSchema) {}
