import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { DrizzleTaskRepository } from './infrastructure/database/drizzle/drizzle-task.repository'
import { CreateTaskUseCase } from './application/use-cases/create-task.use-case'
import { GetTaskUseCase } from './application/use-cases/get-task.use-case'
import { ListTasksUseCase } from './application/use-cases/list-tasks.use-case'
import { UpdateTaskUseCase } from './application/use-cases/update-task.use-case'
import { DeleteTaskUseCase } from './application/use-cases/delete-task.use-case'
import { TasksController } from './presentation/controllers/tasks.controller'

@Module({
  imports: [DatabaseModule],
  controllers: [TasksController],
  providers: [
    {
      provide: 'TaskRepository',
      useClass: DrizzleTaskRepository
    },
    CreateTaskUseCase,
    GetTaskUseCase,
    ListTasksUseCase,
    UpdateTaskUseCase,
    DeleteTaskUseCase
  ],
  exports: [CreateTaskUseCase]
})
export class TasksModule {}
