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
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'

export function TasksView({ initialData }: { initialData: PaginatedResponse<TaskResponse> }) {
  const [page, setPage] = useState(initialData.meta.page)
  const queryClient = useQueryClient()
  const limit = initialData.meta.limit

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['tasks', page, limit],
    queryFn: () => fetchTasks(page, limit),
    placeholderData: keepPreviousData,
    initialData: page === 1 ? initialData : undefined
  })

  // Use data from query or fallback to initial (though initialData handles page 1)
  const tasks = data?.data ?? []
  const meta = data?.meta ?? initialData.meta

  const handleTaskCreated = () => {
    // Invalidate and refetch tasks to show new one
    queryClient.invalidateQueries({ queryKey: ['tasks'] })
    // Reset to page 1 to see new task if desired, or stay current?
    // User expectation: usually want to see the new task.
    // Given sorting is by createdAt DESC, new task is on page 1.
    if (page !== 1) setPage(1)
  }

  const handleNextPage = () => {
    if (meta.hasNextPage) setPage((old) => old + 1)
  }

  const handlePrevPage = () => {
    if (meta.hasPreviousPage) setPage((old) => Math.max(old - 1, 1))
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
            <CreateTaskForm onTaskCreated={handleTaskCreated} />
          </TabsContent>
          <TabsContent value="ai">
            <AiTaskGenerator onTaskCreated={handleTaskCreated} />
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
            onClick={() => refetch()}
            className="text-primary hover:underline gap-1"
            disabled={isFetching}
          >
            {isFetching && <Loader2 className="w-3 h-3 animate-spin" />}
            Refresh
          </Button>
        </div>

        <TaskList tasks={tasks} onRefresh={() => queryClient.invalidateQueries({ queryKey: ['tasks'] })} />

        {/* Pagination Controls */}
        <div className="flex items-center justify-between text-sm py-4">
          <div className="text-muted-foreground">
            Page {meta.page} of {meta.totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={isFetching || !meta.hasPreviousPage}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Prev
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={isFetching || !meta.hasNextPage}>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
