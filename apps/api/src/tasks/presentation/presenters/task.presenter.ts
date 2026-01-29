import { Task } from '../../domain/entities/task.entity'

export class TaskPresenter {
  static toResponse(task: Task) {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      isCompleted: task.isCompleted,
      createdAt: task.createdAt
    }
  }
}
