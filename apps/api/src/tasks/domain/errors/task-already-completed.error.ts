export class TaskAlreadyCompletedError extends Error {
  constructor() {
    super('Task is already completed')
    this.name = 'TaskAlreadyCompletedError'
  }
}
