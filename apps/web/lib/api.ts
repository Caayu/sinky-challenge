import { AiTaskResponse, TaskResponse, PaginatedResponse } from '@repo/shared'

const API_URL = 'http://localhost:3000'

export async function fetchTasks({
  page = 1,
  limit = 10,
  search,
  status,
  priority,
  category
}: {
  page?: number
  limit?: number
  search?: string
  status?: string
  priority?: string
  category?: string
}): Promise<PaginatedResponse<TaskResponse>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  })

  if (search) params.append('search', search)
  if (status && status !== 'ALL') params.append('status', status)
  if (priority && priority !== 'ALL') params.append('priority', priority)
  if (category && category !== 'ALL') params.append('category', category)

  const res = await fetch(`${API_URL}/tasks?${params}`, {
    cache: 'no-store'
  })
  if (!res.ok) throw new Error('Failed to fetch tasks')
  return res.json()
}

export async function getTask(id: string): Promise<TaskResponse> {
  const res = await fetch(`${API_URL}/tasks/${id}`)
  if (!res.ok) throw new Error('Failed to fetch task')
  return res.json()
}

export async function createTask(data: any): Promise<TaskResponse> {
  const res = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to create task')
  return res.json()
}

export async function updateTask(id: string, data: any): Promise<TaskResponse> {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to update task')
  return res.json()
}

export async function completeTask(id: string): Promise<TaskResponse> {
  const res = await fetch(`${API_URL}/tasks/${id}/complete`, {
    method: 'PATCH'
  })
  if (!res.ok) throw new Error('Failed to complete task')
  return res.json()
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'DELETE'
  })
  if (!res.ok) throw new Error('Failed to delete task')
}

export async function enhanceTask(text: string): Promise<AiTaskResponse> {
  const res = await fetch(`${API_URL}/ai/enhance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  })
  if (!res.ok) throw new Error('Failed to enhance task')
  return res.json()
}

export async function generateSubtasks(text: string): Promise<AiTaskResponse[]> {
  const res = await fetch(`${API_URL}/ai/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: text })
  })
  if (!res.ok) throw new Error('Failed to generate subtasks')
  return res.json()
}
