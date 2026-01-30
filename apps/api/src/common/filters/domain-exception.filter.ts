import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common'
import { Response } from 'express'
import { TaskTitleRequiredError, TaskAlreadyCompletedError, TaskNotFoundError } from '../../tasks/domain/errors'
import { ErrorResponseDto } from '../dto/error-response.dto'

@Catch(TaskTitleRequiredError, TaskAlreadyCompletedError, TaskNotFoundError)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name)

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    let status = HttpStatus.BAD_REQUEST
    let errorType = 'Bad Request'

    if (exception instanceof TaskNotFoundError) {
      status = HttpStatus.NOT_FOUND
      errorType = 'Not Found'
    }

    const message = exception.message
    this.logger.warn(`Domain exception caught: ${message}`)

    response.status(status).json({
      statusCode: status,
      message: message,
      error: errorType
    } as ErrorResponseDto)
  }
}
