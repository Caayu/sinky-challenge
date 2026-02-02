import { Inject, Injectable } from '@nestjs/common'
import { TaskRepository } from '../../domain/repositories/task.repository'
import { Task } from '../../domain/entities/task.entity'
import { PaginatedResponse } from '@repo/shared'
import { ListTasksQueryDto } from '../dto/list-tasks.dto'

@Injectable()
export class ListTasksUseCase {
  constructor(
    @Inject('TaskRepository')
    private readonly taskRepository: TaskRepository
  ) {}

  async execute(query: ListTasksQueryDto): Promise<PaginatedResponse<Task>> {
    const page = query.page || 1
    const limit = query.limit || 10

    const { items, total } = await this.taskRepository.findAll({
      page,
      limit,
      search: query.search,
      isCompleted: query.status === 'DONE' ? true : query.status === 'PENDING' ? false : undefined,
      priority: query.priority,
      category: query.category,
      sort: query.sort
    })

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
