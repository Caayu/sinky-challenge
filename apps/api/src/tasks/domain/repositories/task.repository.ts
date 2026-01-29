import { Task } from '../entities'

export interface TaskRepository {
  create(task: Task): Promise<void>
}
