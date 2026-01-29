import { Body, Controller, Post } from '@nestjs/common'
import { CreateTaskUseCase } from '../../application/use-cases/create-task.use-case'
import { CreateTaskDto } from '../../application/dto/create-task.dto'
import { TaskPresenter } from '../presenters/task.presenter'

@Controller('tasks')
export class TasksController {
  constructor(private readonly createTaskUseCase: CreateTaskUseCase) {}

  @Post()
  async create(@Body() createTaskDto: CreateTaskDto) {
    const task = await this.createTaskUseCase.execute(createTaskDto)
    return TaskPresenter.toResponse(task)
  }
}
