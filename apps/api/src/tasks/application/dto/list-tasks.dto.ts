import { createZodDto } from 'nestjs-zod'
import { PaginationQuerySchema } from '@repo/shared'

import { z } from 'zod'

export class ListTasksQueryDto extends createZodDto(
  PaginationQuerySchema.extend({
    search: z.string().optional(),
    status: z.enum(['PENDING', 'DONE']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    category: z.enum(['WORK', 'PERSONAL', 'SHOPPING', 'HEALTH', 'FINANCE']).optional()
  })
) {}
