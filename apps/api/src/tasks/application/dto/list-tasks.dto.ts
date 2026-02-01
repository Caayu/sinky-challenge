import { createZodDto } from 'nestjs-zod'
import { PaginationQuerySchema } from '@repo/shared'

export class ListTasksQueryDto extends createZodDto(PaginationQuerySchema) {}
