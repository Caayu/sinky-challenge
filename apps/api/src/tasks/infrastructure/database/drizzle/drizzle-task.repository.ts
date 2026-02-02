import { Inject, Injectable } from '@nestjs/common'
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { eq, count, like, and, SQL } from 'drizzle-orm'
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

  async findAll({
    page,
    limit,
    search,
    isCompleted,
    priority,
    category
  }: {
    page: number
    limit: number
    search?: string
    isCompleted?: boolean
    priority?: string
    category?: string
  }): Promise<{ items: Task[]; total: number }> {
    const offset = (page - 1) * limit
    const conditions: SQL[] = []

    if (search) {
      conditions.push(like(tasks.title, `%${search}%`))
      // conditions.push(like(tasks.description, `%${search}%`)) // Optional: search description too
    }

    if (isCompleted !== undefined) {
      // Logic for status filter: DONE -> isCompleted: true, PENDING -> isCompleted: false
      // If passing boolean directly:
      conditions.push(eq(tasks.isCompleted, isCompleted))
    }

    // Since isCompleted is derived from 'status' enum in DTO logic outside, keep consistent.
    // However, if status param is missing, we fetch ALL.
    // The boolean check above handles this if undefined is passed.

    if (priority) {
      conditions.push(eq(tasks.priority, priority))
    }

    if (category) {
      conditions.push(eq(tasks.category, category))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [results, totalCount] = await Promise.all([
      this.db.select().from(tasks).where(whereClause).limit(limit).offset(offset).orderBy(tasks.createdAt).all(),
      this.db.select({ count: count() }).from(tasks).where(whereClause).get()
    ])

    const items = results.map((result) =>
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

    return {
      items,
      total: totalCount?.count ?? 0
    }
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
