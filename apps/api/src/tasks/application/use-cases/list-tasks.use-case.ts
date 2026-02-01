import { Inject, Injectable } from '@nestjs/common'
import { TaskRepository } from '../../domain/repositories/task.repository'
import { Task } from '../../domain/entities/task.entity'

import { PaginationQuery, PaginatedResponse } from '@repo/shared'

@Injectable()
export class ListTasksUseCase {
  constructor(
    @Inject('TaskRepository')
    private readonly taskRepository: TaskRepository
  ) {}

  async execute(params: PaginationQuery): Promise<PaginatedResponse<Task>> {
    const { page, limit } = params
    const { items, total } = await this.taskRepository.findAll({ page, limit })

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1
      }
    }
  }
}
