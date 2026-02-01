import { Task } from '../../domain/entities/task.entity'

export class TaskPresenter {
  static toResponse(task: Task) {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      suggestedDeadline: task.suggestedDeadline,
      isCompleted: task.isCompleted,
      createdAt: task.createdAt
    }
  }
}
