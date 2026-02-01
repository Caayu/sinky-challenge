import { Inject, Injectable } from '@nestjs/common'
import { TaskRepository } from '../../domain/repositories/task.repository'
import { TaskNotFoundError } from '../../domain/errors/task-not-found.error'

@Injectable()
export class DeleteTaskUseCase {
  constructor(
    @Inject('TaskRepository')
    private readonly taskRepository: TaskRepository
  ) {}

  async execute(id: string): Promise<void> {
    const task = await this.taskRepository.findById(id)

    if (!task) {
      throw new TaskNotFoundError(id)
    }

    await this.taskRepository.delete(id)
  }
}
