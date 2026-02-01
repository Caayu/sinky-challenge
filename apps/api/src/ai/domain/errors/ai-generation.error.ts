export class AiGenerationError extends Error {
  constructor(message: string = 'Failed to process AI request') {
    super(message)
    this.name = 'AiGenerationError'
  }
}
