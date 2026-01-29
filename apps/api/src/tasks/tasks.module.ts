import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { DrizzleTaskRepository } from './infrastructure/database/drizzle/drizzle-task.repository'
import { CreateTaskUseCase } from './application/use-cases/create-task.use-case'

@Module({
  imports: [DatabaseModule],
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
