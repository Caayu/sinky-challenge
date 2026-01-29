export class TaskTitleRequiredError extends Error {
  constructor() {
    super('Title is required')
    this.name = 'TaskTitleRequiredError'
  }
}
