import { Body, Controller, Post } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { CreateTaskUseCase } from '../../application/use-cases/create-task.use-case'
import { CreateTaskDto } from '../../application/dto/create-task.dto'
import { TaskPresenter } from '../presenters/task.presenter'
import { TaskResponseDto } from '../../application/dto/task-response.dto'
import { GetTaskUseCase } from '../../application/use-cases/get-task.use-case'
import { ListTasksUseCase } from '../../application/use-cases/list-tasks.use-case'
import { UpdateTaskUseCase } from '../../application/use-cases/update-task.use-case'
import { DeleteTaskUseCase } from '../../application/use-cases/delete-task.use-case'
import { UpdateTaskDto } from '../../application/dto/update-task.dto'
import { HttpCode, Param, Patch, Get, Delete } from '@nestjs/common'
import { ErrorResponseDto } from '../../../common/dto/error-response.dto'

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly getTaskUseCase: GetTaskUseCase,
    private readonly listTasksUseCase: ListTasksUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'The task has been successfully created.', type: TaskResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request - Title is required' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async create(@Body() createTaskDto: CreateTaskDto) {
    const task = await this.createTaskUseCase.execute(createTaskDto)
    return TaskPresenter.toResponse(task)
  }

  @Get()
  @ApiOperation({ summary: 'List all tasks' })
  @ApiResponse({ status: 200, description: 'Return all tasks.', type: [TaskResponseDto] })
  async findAll() {
    const tasks = await this.listTasksUseCase.execute()
    return tasks.map(TaskPresenter.toResponse)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by id' })
  @ApiResponse({ status: 200, description: 'Return the task.', type: TaskResponseDto })
  @ApiResponse({ status: 404, description: 'Task not found', type: ErrorResponseDto })
  async findOne(@Param('id') id: string) {
    const task = await this.getTaskUseCase.execute(id)
    return TaskPresenter.toResponse(task)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiResponse({ status: 200, description: 'The task has been successfully updated.', type: TaskResponseDto })
  @ApiResponse({ status: 404, description: 'Task not found', type: ErrorResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request', type: ErrorResponseDto })
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    const task = await this.updateTaskUseCase.execute(id, updateTaskDto)
    return TaskPresenter.toResponse(task)
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: 204, description: 'The task has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Task not found', type: ErrorResponseDto })
  async remove(@Param('id') id: string) {
    await this.deleteTaskUseCase.execute(id)
  }
}
