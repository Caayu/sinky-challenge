import { TaskAlreadyCompletedError, TaskTitleRequiredError } from '../errors'

export type TaskProps = {
  title: string
  description?: string
  category?: string
  priority?: string
  suggestedDeadline?: Date | null
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

export class Task {
  private props: TaskProps
  private readonly _id: string

  private constructor(props: TaskProps, id?: string) {
    this.props = props
    this._id = id ?? crypto.randomUUID()
  }

  public static create(
    title: string,
    description?: string,
    category?: string,
    priority?: string,
    suggestedDeadline?: string | null
  ): Task {
    if (!title) {
      throw new TaskTitleRequiredError()
    }

    return new Task({
      title,
      description,
      category,
      priority,
      suggestedDeadline: suggestedDeadline ? new Date(suggestedDeadline) : null,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  public complete(): void {
    if (this.props.isCompleted) {
      throw new TaskAlreadyCompletedError()
    }
    this.props.isCompleted = true
    this.props.updatedAt = new Date()
  }

  public updateTitle(title: string): void {
    if (!title) {
      throw new TaskTitleRequiredError()
    }
    this.props.title = title
    this.props.updatedAt = new Date()
  }

  public update(props: Partial<Omit<TaskProps, 'updatedAt' | 'createdAt'>>): void {
    if (props.title !== undefined) {
      this.updateTitle(props.title)
    }
    if (props.description !== undefined) {
      this.props.description = props.description
    }
    if (props.category !== undefined) {
      this.props.category = props.category
    }
    if (props.priority !== undefined) {
      this.props.priority = props.priority
    }
    if (props.suggestedDeadline !== undefined) {
      this.props.suggestedDeadline = props.suggestedDeadline ? new Date(props.suggestedDeadline) : null
    }
    if (props.isCompleted !== undefined) {
      this.props.isCompleted = props.isCompleted
    }
    this.props.updatedAt = new Date()
  }

  get id(): string {
    return this._id
  }

  get title(): string {
    return this.props.title
  }

  get description(): string | undefined {
    return this.props.description
  }

  get category(): string | undefined {
    return this.props.category
  }

  get priority(): string | undefined {
    return this.props.priority
  }

  get suggestedDeadline(): Date | null | undefined {
    return this.props.suggestedDeadline
  }

  get isCompleted(): boolean {
    return this.props.isCompleted
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  // Method to rehydrate from DB without triggering business rules or changing dates
  public static restore(id: string, props: TaskProps): Task {
    return new Task(props, id)
  }
}
