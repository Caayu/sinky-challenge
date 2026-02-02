import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { json } from 'express'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors()
  app.setGlobalPrefix('api')
  app.use(json({ limit: '10kb' }))

  const config = new DocumentBuilder()
    .setTitle('Sinky API')
    .setDescription('The Sinky API description')
    .setVersion('1.0')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  const { ZodValidationPipe } = await import('nestjs-zod')
  app.useGlobalPipes(new ZodValidationPipe())

  const { DomainExceptionFilter } = await import('./common/filters/domain-exception.filter')
  app.useGlobalFilters(new DomainExceptionFilter())

  const port = process.env.PORT || 3000
  await app.listen(port, '0.0.0.0')
}

void bootstrap()
