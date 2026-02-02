import { Body, Controller, Post, Headers } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { AiService } from './ai.service'
import { EnhanceTaskDto, EnhancedTaskResponseDto } from './dto/enhance-task.dto'
import { SuggestSubtasksDto } from './dto/suggest-subtasks.dto'
import { AiTaskResponse } from '@repo/shared'
import { CreateTaskUseCase } from '../tasks/application/use-cases/create-task.use-case'

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly createTaskUseCase: CreateTaskUseCase
  ) {}

  @Post('enhance')
  @ApiOperation({ summary: 'Enhance raw text into a structured task' })
  @ApiResponse({ status: 201, description: 'Task enhanced successfully', type: EnhancedTaskResponseDto })
  async enhance(@Body() dto: EnhanceTaskDto, @Headers('x-api-key') apiKey: string): Promise<AiTaskResponse> {
    const enhanced = await this.aiService.enhanceTask(dto.text, apiKey)

    // Automatic creation
    await this.createTaskUseCase.execute({
      title: enhanced.title,
      description: enhanced.description,
      category: enhanced.category,
      priority: enhanced.priority,
      suggestedDeadline: enhanced.suggestedDeadline
    })

    return enhanced
  }

  @Post('tasks')
  @ApiOperation({ summary: 'Suggest and create subtasks for a given title' })
  @ApiResponse({ status: 201, description: 'Subtasks created successfully', type: [EnhancedTaskResponseDto] })
  async createTasks(@Body() dto: SuggestSubtasksDto, @Headers('x-api-key') apiKey: string): Promise<AiTaskResponse[]> {
    const aiResponse = await this.aiService.suggestSubtasks(dto.title, apiKey)

    // Automatic creation
    for (const task of aiResponse) {
      await this.createTaskUseCase.execute({
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        suggestedDeadline: task.suggestedDeadline
      })
    }

    return aiResponse
  }
}
