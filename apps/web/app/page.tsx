import { fetchTasks } from '@/lib/api'
import { TasksView } from '@/components/tasks-view'
import { TaskResponse } from '@repo/shared'

// Force dynamic rendering since we are fetching data that changes often
export const dynamic = 'force-dynamic'

async function getInitialTasks(): Promise<TaskResponse[]> {
  try {
    const data = await fetchTasks()
    return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (error) {
    console.error('Failed to fetch initial tasks:', error)
    return []
  }
}

export default async function Home() {
  const initialTasks = await getInitialTasks()

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Sinky Challenge</h1>
          <p className="text-muted-foreground">Manage your tasks efficiently with AI power.</p>
        </header>

        <TasksView initialTasks={initialTasks} />
      </div>
    </main>
  )
}
