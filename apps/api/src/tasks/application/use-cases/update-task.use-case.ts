import { Inject, Injectable } from '@nestjs/common'
import { TaskRepository } from '../../domain/repositories/task.repository'
import { Task } from '../../domain/entities/task.entity'
import { UpdateTaskDto } from '../dto/update-task.dto'
import { TaskNotFoundError } from '../../domain/errors/task-not-found.error'

@Injectable()
export class UpdateTaskUseCase {
  constructor(
    @Inject('TaskRepository')
    private readonly taskRepository: TaskRepository
  ) {}

  async execute(id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.taskRepository.findById(id)

    if (!task) {
      throw new TaskNotFoundError(id)
    }

    task.update(dto)

    await this.taskRepository.update(task)

    return task
  }
}
