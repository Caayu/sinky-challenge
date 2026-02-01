import { HttpStatus } from '@nestjs/common'

type ErrorConstructor = new (...args: any[]) => Error

interface ErrorMapping {
  status: HttpStatus
  errorType: string
}

export class DomainErrorRegistry {
  private static readonly mapping = new Map<string, ErrorMapping>()

  static register(errorClass: ErrorConstructor, status: HttpStatus, errorType: string) {
    this.mapping.set(errorClass.name, { status, errorType })
  }

  static get(error: Error): ErrorMapping | undefined {
    return this.mapping.get(error.constructor.name)
  }
}
