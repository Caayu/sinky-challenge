import { Task } from '../entities'

export interface TaskRepository {
  create(task: Task): Promise<void>
  findById(id: string): Promise<Task | null>
  findAll(): Promise<Task[]>
  update(task: Task): Promise<void>
  delete(id: string): Promise<void>
}
