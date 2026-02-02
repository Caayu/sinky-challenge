import { Injectable, InternalServerErrorException, Logger, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'
import { AiTaskResponse, AiTaskResponseSchema } from '@repo/shared'
import { z } from 'zod'
import { AiQuotaExceededError, AiGenerationError } from './domain/errors'

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name)
  private readonly genAI: GoogleGenerativeAI
  private readonly model: GenerativeModel

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY')
    if (!apiKey) {
      this.logger.error('GEMINI_API_KEY is not defined')
      throw new InternalServerErrorException('AI Service configuration error')
    }

    this.genAI = new GoogleGenerativeAI(apiKey)
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      generationConfig: { responseMimeType: 'application/json' }
    })
  }

  async enhanceTask(text: string): Promise<AiTaskResponse> {
    if (text.length > 500) {
      throw new BadRequestException('Texto muito longo para processar (máx: 500 caracteres).')
    }
    try {
      const now = new Date().toISOString()
      const prompt = `
        You are an executive assistant. Analise o texto e a data atual para inferir prazos relativos (ex: 'próxima sexta' vira uma data ISO real baseada em now). 
        Retorne APENAS o JSON estrito seguindo o schema.
        
        Current Date (ISO): ${now}
        Raw Text: "${text}"

        Output JSON format (strict schema):
        {
          "title": "String (Clear and concise action)",
          "description": "String (Details inferred or generated)",
          "category": "String (Enum: WORK, PERSONAL, HEALTH, FINANCE, SHOPPING)",
          "priority": "String (HIGH, MEDIUM, LOW)",
          "suggestedDeadline": "String (ISO Date) or null"
        }
      `

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const textResponse = response.text()

      const parsed = JSON.parse(textResponse)
      return AiTaskResponseSchema.parse(parsed)
    } catch (error: any) {
      this.logger.error('Failed to enhance task', error instanceof Error ? error.stack : error)

      if (error.message?.includes('429') || error.message?.includes('Resource exhausted')) {
        throw new AiQuotaExceededError()
      }

      throw new AiGenerationError()
    }
  }

  async suggestSubtasks(title: string): Promise<AiTaskResponse[]> {
    try {
      const now = new Date().toISOString()
      const prompt = `
        You are a productivity expert. Break down the task "${title}" into 3-5 actionable subtasks.
        Return ONLY a JSON array of objects following the strict schema below.

        Current Date (ISO): ${now}

        Output JSON format (strict schema):
        [
          {
            "title": "String (Clear and concise action)",
            "description": "String (Details inferred or generated)",
            "category": "String (Enum: WORK, PERSONAL, HEALTH, FINANCE, SHOPPING)",
            "priority": "String (HIGH, MEDIUM, LOW)",
            "suggestedDeadline": "String (ISO Date) or null"
          }
        ]
      `
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const textResponse = response.text()

      const parsed = JSON.parse(textResponse)
      return z.array(AiTaskResponseSchema).parse(parsed)
    } catch (error: any) {
      this.logger.error('Failed to suggest subtasks', error instanceof Error ? error.stack : error)

      if (error.message?.includes('429') || error.message?.includes('Resource exhausted')) {
        throw new AiQuotaExceededError()
      }

      throw new AiGenerationError()
    }
  }
}
