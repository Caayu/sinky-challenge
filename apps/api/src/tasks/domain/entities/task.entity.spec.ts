import { Task } from './task.entity'
import { TaskAlreadyCompletedError, TaskTitleRequiredError } from '../errors'

describe('Task Entity', () => {
  it('should create a new task', () => {
    const task = Task.create('Test Title', 'Test Description')

    expect(task.id).toBeDefined()
    expect(task.title).toBe('Test Title')
    expect(task.description).toBe('Test Description')
    expect(task.isCompleted).toBe(false)
    expect(task.createdAt).toBeInstanceOf(Date)
    expect(task.updatedAt).toBeInstanceOf(Date)
  })

  it('should throw error when title is empty', () => {
    expect(() => Task.create('')).toThrow(TaskTitleRequiredError)
  })

  it('should complete a task', () => {
    const task = Task.create('Test Title')
    task.complete()

    expect(task.isCompleted).toBe(true)
    expect(task.updatedAt.getTime()).toBeGreaterThanOrEqual(task.createdAt.getTime())
  })

  it('should throw error when completing an already completed task', () => {
    const task = Task.create('Test Title')
    task.complete()

    expect(() => task.complete()).toThrow(TaskAlreadyCompletedError)
  })

  it('should update task title', () => {
    const task = Task.create('Old Title')

    // Slight delay to ensure update time diff (optional, but good for robust checks)
    // const initialUpdate = task.updatedAt

    task.updateTitle('New Title')

    expect(task.title).toBe('New Title')
    // We can't easily assert time strictly without mocking, but it should be set
    expect(task.updatedAt).toBeInstanceOf(Date)
  })

  it('should restore a task', () => {
    const props = {
      title: 'Restored Title',
      description: 'Restored Description',
      isCompleted: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02')
    }
    const id = 'existing-id'

    const task = Task.restore(id, props)

    expect(task).toBeInstanceOf(Task)
    expect(task.id).toBe(id)
    expect(task.title).toBe(props.title)
    expect(task.description).toBe(props.description)
    expect(task.isCompleted).toBe(true)
    expect(task.createdAt).toEqual(props.createdAt)
    expect(task.updatedAt).toEqual(props.updatedAt)
  })
})
