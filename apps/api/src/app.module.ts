import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppService } from './app.service'
import { AppController } from './app.controller'
import { DatabaseModule } from './database/database.module'
import { TasksModule } from './tasks/tasks.module'
import { AiModule } from './ai/ai.module'

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, TasksModule, AiModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
