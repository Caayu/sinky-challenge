import { Body, Controller, Post } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { CreateTaskUseCase } from '../../application/use-cases/create-task.use-case'
import { CreateTaskDto } from '../../application/dto/create-task.dto'
import { TaskPresenter } from '../presenters/task.presenter'
import { TaskResponseDto } from '../../application/dto/task-response.dto'

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly createTaskUseCase: CreateTaskUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'The task has been successfully created.', type: TaskResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request - Title is required' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async create(@Body() createTaskDto: CreateTaskDto) {
    const task = await this.createTaskUseCase.execute(createTaskDto)
    return TaskPresenter.toResponse(task)
  }
}
