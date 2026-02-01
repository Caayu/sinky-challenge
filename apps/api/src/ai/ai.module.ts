import { Module, HttpStatus, OnModuleInit } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AiController } from './ai.controller'
import { AiService } from './ai.service'
import { TasksModule } from '../tasks/tasks.module'
import { DomainErrorRegistry } from '../common/filters/domain-error.registry'
import { AiQuotaExceededError, AiGenerationError } from './domain/errors'

@Module({
  imports: [ConfigModule, TasksModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService]
})
export class AiModule implements OnModuleInit {
  onModuleInit() {
    DomainErrorRegistry.register(AiQuotaExceededError, HttpStatus.SERVICE_UNAVAILABLE, 'Service Unavailable')
    DomainErrorRegistry.register(AiGenerationError, HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error')
  }
}
