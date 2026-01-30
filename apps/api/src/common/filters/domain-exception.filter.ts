import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common'
import { Response } from 'express'
import { TaskTitleRequiredError, TaskAlreadyCompletedError } from '../../tasks/domain/errors'

@Catch(TaskTitleRequiredError, TaskAlreadyCompletedError)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name)

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    // Default to Bad Request for domain validation errors
    const status = HttpStatus.BAD_REQUEST
    const message = exception.message

    this.logger.warn(`Domain exception caught: ${exception.message}`)

    response.status(status).json({
      statusCode: status,
      message: message,
      error: 'Bad Request'
    })
  }
}
