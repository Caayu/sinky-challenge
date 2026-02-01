import { Inject, Injectable } from '@nestjs/common'
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { eq } from 'drizzle-orm'
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
      category: task.category,
      priority: task.priority,
      limitDate: task.suggestedDeadline,
      isCompleted: task.isCompleted,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    })
  }

  async findById(id: string): Promise<Task | null> {
    const result = await this.db.select().from(tasks).where(eq(tasks.id, id)).get()

    if (!result) {
      return null
    }

    return Task.restore(result.id, {
      title: result.title,
      description: result.description ?? undefined,
      category: result.category ?? undefined,
      priority: result.priority ?? undefined,
      suggestedDeadline: result.limitDate ?? null,
      isCompleted: result.isCompleted,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    })
  }

  async findAll(): Promise<Task[]> {
    const results = await this.db.select().from(tasks).all()

    return results.map((result) =>
      Task.restore(result.id, {
        title: result.title,
        description: result.description ?? undefined,
        category: result.category ?? undefined,
        priority: result.priority ?? undefined,
        suggestedDeadline: result.limitDate ?? null,
        isCompleted: result.isCompleted,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      })
    )
  }

  async update(task: Task): Promise<void> {
    await this.db
      .update(tasks)
      .set({
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        limitDate: task.suggestedDeadline,
        isCompleted: task.isCompleted,
        updatedAt: task.updatedAt
      })
      .where(eq(tasks.id, task.id))
      .run()
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(tasks).where(eq(tasks.id, id)).run()
  }
}
