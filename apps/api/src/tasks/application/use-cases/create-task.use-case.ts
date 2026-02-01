import { Inject, Injectable } from '@nestjs/common'
import { TaskRepository } from '../../domain/repositories/task.repository'
import { Task } from '../../domain/entities/task.entity'
import { CreateTaskDto } from '../dto/create-task.dto'

@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject('TaskRepository')
    private readonly taskRepository: TaskRepository
  ) {}

  async execute(dto: CreateTaskDto): Promise<Task> {
    const task = Task.create(dto.title, dto.description, dto.category, dto.priority, dto.suggestedDeadline)
    await this.taskRepository.create(task)
    return task
  }
}
