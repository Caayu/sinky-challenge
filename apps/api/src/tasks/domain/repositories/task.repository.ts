import { Task } from '../entities'

export interface TaskRepository {
  create(task: Task): Promise<void>
  findById(id: string): Promise<Task | null>
  findAll(params: {
    page: number
    limit: number
    search?: string
    isCompleted?: boolean
    priority?: string
    category?: string
    sort?: 'newest' | 'oldest'
  }): Promise<{ items: Task[]; total: number }>
  update(task: Task): Promise<void>
  delete(id: string): Promise<void>
}
