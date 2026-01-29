import { Test, TestingModule } from '@nestjs/testing'
import { TasksController } from './tasks.controller'
import { CreateTaskUseCase } from '../../application/use-cases/create-task.use-case'
import { CreateTaskDto } from '../../application/dto/create-task.dto'

describe('TasksController', () => {
  let controller: TasksController
  let createTaskUseCase: CreateTaskUseCase

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: CreateTaskUseCase,
          useValue: {
            execute: jest.fn().mockResolvedValue({
              id: 'test-id',
              title: 'Test Task',
              description: 'Test Description',
              isCompleted: false,
              createdAt: new Date(),
              updatedAt: new Date()
            })
          }
        }
      ]
    }).compile()

    controller = module.get<TasksController>(TasksController)
    createTaskUseCase = module.get<CreateTaskUseCase>(CreateTaskUseCase)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should create a task', async () => {
    const dto: CreateTaskDto = {
      title: 'Test Task',
      description: 'Test Description'
    }

    const result = await controller.create(dto)

    expect(result).toBeDefined()
    expect(result.id).toBe('test-id')
    expect(result.title).toBe('Test Task')
    expect(result.description).toBe('Test Description')
    expect(result.isCompleted).toBe(false)
    expect(result.createdAt).toBeDefined()
    expect(Object.keys(result)).toEqual(['id', 'title', 'description', 'isCompleted', 'createdAt'])
    expect(createTaskUseCase.execute).toHaveBeenCalledWith(dto)
  })
})
