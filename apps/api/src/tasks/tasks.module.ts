import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { DrizzleTaskRepository } from './infrastructure/database/drizzle/drizzle-task.repository'
import { CreateTaskUseCase } from './application/use-cases/create-task.use-case'
import { TasksController } from './presentation/controllers/tasks.controller'

@Module({
  imports: [DatabaseModule],
  controllers: [TasksController],
  providers: [
    {
      provide: 'TaskRepository',
      useClass: DrizzleTaskRepository
    },
    CreateTaskUseCase
  ],
  exports: [CreateTaskUseCase]
})
export class TasksModule {}
