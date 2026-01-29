import { Module } from '@nestjs/common'

import { AppService } from './app.service'
import { AppController } from './app.controller'

import { TasksModule } from './tasks/tasks.module'

@Module({
  imports: [TasksModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
