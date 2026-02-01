'use client'

import { useState } from 'react'
import { fetchTasks } from '@/lib/api'
import { TaskResponse, PaginatedResponse } from '@repo/shared'
import { TaskList } from '@/components/task-list'
import { CreateTaskForm } from '@/components/create-task-form'
import { AiTaskGenerator } from '@/components/ai-task-generator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

export function TasksView({ initialData }: { initialData: PaginatedResponse<TaskResponse> }) {
  const [tasks, setTasks] = useState<TaskResponse[]>(initialData.data)
  const [meta, setMeta] = useState(initialData.meta)
  const [loading, setLoading] = useState(false)

  const loadTasks = async (page = meta.page) => {
    try {
      setLoading(true)
      const response = await fetchTasks(page, meta.limit)
      setTasks(response.data)
      setMeta(response.meta)
    } catch (error) {
      console.error(error)
      toast.error('Failed to refresh tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleNextPage = () => {
    if (meta.hasNextPage) loadTasks(meta.page + 1)
  }

  const handlePrevPage = () => {
    if (meta.hasPreviousPage) loadTasks(meta.page - 1)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left Column: Creation Forms */}
      <div className="md:col-span-1 space-y-6">
        <Tabs defaultValue="ai" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="ai">AI Magic</TabsTrigger>
          </TabsList>
          <TabsContent value="manual">
            <CreateTaskForm onTaskCreated={() => loadTasks(1)} />
          </TabsContent>
          <TabsContent value="ai">
            <AiTaskGenerator onTaskCreated={() => loadTasks(1)} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Column: Task List */}
      <div className="md:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Tasks ({meta.total})</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadTasks(meta.page)}
            className="text-primary hover:underline gap-1"
            disabled={loading}
          >
            {loading && <Loader2 className="w-3 h-3 animate-spin" />}
            Refresh
          </Button>
        </div>

        <TaskList tasks={tasks} onRefresh={() => loadTasks(meta.page)} />

        {/* Pagination Controls */}
        <div className="flex items-center justify-between text-sm py-4">
          <div className="text-muted-foreground">
            Page {meta.page} of {meta.totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={loading || !meta.hasPreviousPage}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Prev
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={loading || !meta.hasNextPage}>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
