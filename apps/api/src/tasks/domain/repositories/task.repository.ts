import { Task } from '../entities'

export interface TaskRepository {
  create(task: Task): Promise<void>
  findById(id: string): Promise<Task | null>
  findAll(params: { page: number; limit: number }): Promise<{ items: Task[]; total: number }>
  update(task: Task): Promise<void>
  delete(id: string): Promise<void>
}
