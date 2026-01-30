import { Inject, Injectable } from '@nestjs/common'
import { TaskRepository } from '../../domain/repositories/task.repository'
import { Task } from '../../domain/entities/task.entity'
import { TaskNotFoundError } from '../../domain/errors/task-not-found.error'

@Injectable()
export class GetTaskUseCase {
  constructor(
    @Inject('TaskRepository')
    private readonly taskRepository: TaskRepository
  ) {}

  async execute(id: string): Promise<Task> {
    const task = await this.taskRepository.findById(id)

    if (!task) {
      throw new TaskNotFoundError(id)
    }

    return task
  }
}
