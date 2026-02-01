import { z } from 'zod'

export const AiTaskResponseSchema = z.object({
  title: z.string().describe('Clear and concise action title'),
  description: z.string().describe('Detailed description inferred from text'),
  category: z.enum(['WORK', 'PERSONAL', 'HEALTH', 'FINANCE', 'SHOPPING']).describe('Task category'),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).describe('Task priority'),
  suggestedDeadline: z.string().nullable().describe('Suggested deadline in ISO format or null')
})

export type AiTaskResponse = z.infer<typeof AiTaskResponseSchema>
