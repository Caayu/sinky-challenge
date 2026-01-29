import 'dotenv/config'
import { Test, TestingModule } from '@nestjs/testing'
import { CreateTaskUseCase } from './create-task.use-case'
import { TasksModule } from '../../tasks.module'
import { DRIZZLE_DB } from '../../../database/database.provider'
import { tasks } from '../../../database/schema'
import { eq } from 'drizzle-orm'
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from '../../../database/schema'

describe('CreateTaskUseCase Integration', () => {
  let useCase: CreateTaskUseCase
  let db: BetterSQLite3Database<typeof schema>

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TasksModule]
    }).compile()

    useCase = module.get<CreateTaskUseCase>(CreateTaskUseCase)
    db = module.get(DRIZZLE_DB)
  })

  it('should create a task in the database', async () => {
    const dto = {
      title: 'Integration Test Task',
      description: 'Created via integration test'
    }

    const task = await useCase.execute(dto)

    expect(task.id).toBeDefined()
    expect(task.title).toBe(dto.title)
    expect(task.description).toBe(dto.description)

    // Verify in DB
    const results = await db.select().from(tasks).where(eq(tasks.id, task.id))
    const persisted = results[0]

    expect(persisted).toBeDefined()
    expect(persisted?.title).toBe(dto.title)
  })
})
