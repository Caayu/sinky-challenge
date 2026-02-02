import { getTranslations } from 'next-intl/server'
import { fetchTasks } from '@/lib/api'
import { TasksView } from '@/components/tasks-view'
import { TaskResponse, PaginatedResponse } from '@repo/shared'

// Force dynamic rendering since we are fetching data that changes often
export const dynamic = 'force-dynamic'

async function getInitialTasks(): Promise<PaginatedResponse<TaskResponse>> {
  try {
    return await fetchTasks({})
  } catch {
    return {
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0, hasNextPage: false, hasPreviousPage: false }
    }
  }
}

export default async function Home() {
  const t = await getTranslations('Home')
  const initialData = await getInitialTasks()

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </header>

        <TasksView initialData={initialData} />
      </div>
    </main>
  )
}
