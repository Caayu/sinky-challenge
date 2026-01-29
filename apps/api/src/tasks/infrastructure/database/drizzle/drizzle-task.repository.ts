import { Inject, Injectable } from '@nestjs/common'
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { TaskRepository } from '../../../domain/repositories/task.repository'
import { Task } from '../../../domain/entities/task.entity'
import { DRIZZLE_DB } from '../../../../database/database.provider'
import { tasks } from '../../../../database/schema'
import * as schema from '../../../../database/schema'

@Injectable()
export class DrizzleTaskRepository implements TaskRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: BetterSQLite3Database<typeof schema>) {}

  async create(task: Task): Promise<void> {
    await this.db.insert(tasks).values({
      id: task.id,
      title: task.title,
      description: task.description,
      isCompleted: task.isCompleted,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    })
  }
}
