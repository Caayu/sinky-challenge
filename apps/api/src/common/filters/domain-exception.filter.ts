import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger, HttpException } from '@nestjs/common'
import { Response } from 'express'
import { DomainErrorRegistry } from './domain-error.registry'
import { ErrorResponseDto } from '../dto/error-response.dto'

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name)

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    // Pass through NestJS built-in HttpExceptions (like 400 Validation, 404 Route Not Found, etc.)
    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const exceptionResponse = exception.getResponse()
      response.status(status).json(exceptionResponse)
      return
    }

    const mapping = DomainErrorRegistry.get(exception)

    const status = mapping?.status ?? HttpStatus.INTERNAL_SERVER_ERROR
    const errorType = mapping?.errorType ?? 'Internal Server Error'

    const message = exception.message

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`Domain exception caught: ${message}`, exception.stack)
    } else {
      this.logger.warn(`Domain exception caught: ${message} (Status: ${status})`)
    }

    response.status(status).json({
      statusCode: status,
      message: message,
      error: errorType
    } as ErrorResponseDto)
  }
}
