import { Provider } from '@nestjs/common'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'

export const DRIZZLE_DB = 'DRIZZLE_DB'

export const databaseProvider: Provider = {
  provide: DRIZZLE_DB,
  useFactory: () => {
    const sqlite = new Database(process.env.DATABASE_URL?.replace('file:', '') || 'dev.db')
    return drizzle(sqlite, { schema })
  }
}
