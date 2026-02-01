export class AiQuotaExceededError extends Error {
  constructor() {
    super('AI quota exceeded, please try again later')
    this.name = 'AiQuotaExceededError'
  }
}
