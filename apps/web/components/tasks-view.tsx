'use client'

import { useState, useEffect } from 'react'
import { fetchTasks } from '@/lib/api'
import { TaskResponse, PaginatedResponse } from '@repo/shared'
import { TaskList } from '@/components/task-list'
import { CreateTaskForm } from '@/components/create-task-form'
import { AiTaskGenerator } from '@/components/ai-task-generator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'

export function TasksView({ initialData }: { initialData: PaginatedResponse<TaskResponse> }) {
  const [page, setPage] = useState(initialData.meta.page)
  const queryClient = useQueryClient()
  const limit = initialData.meta.limit

  // Hydration fix: Tabs generate random IDs on server vs client in some versions
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const [priority, setPriority] = useState('ALL')
  const [category, setCategory] = useState('ALL')

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(timer)
  }, [search])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status, priority, category])

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['tasks', page, limit, debouncedSearch, status, priority, category],
    queryFn: () =>
      fetchTasks({
        page,
        limit,
        search: debouncedSearch,
        status,
        priority,
        category
      }),
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

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          {/* Skeleton for Tabs during SSR to avoid mismatch */}
          <div className="h-[300px] border rounded-lg bg-muted/10 animate-pulse" />
        </div>

        {/* Render TaskList immediately since it has initialData and no complex interactive state causing ID mismatch */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Tasks ({meta.total})</h2>
            <Button variant="ghost" size="sm" className="text-primary hover:underline gap-1" disabled>
              Refresh
            </Button>
          </div>
          <TaskList tasks={initialData.data} onRefresh={() => {}} />
          {/* Pagination placeholder */}
          <div className="flex items-center justify-between text-sm py-4">
            <div className="text-muted-foreground">
              Page {initialData.meta.page} of {initialData.meta.totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Prev
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
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
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64"
          />
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="DONE">Done</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priorities</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                <SelectItem value="WORK">Work</SelectItem>
                <SelectItem value="PERSONAL">Personal</SelectItem>
                <SelectItem value="SHOPPING">Shopping</SelectItem>
                <SelectItem value="HEALTH">Health</SelectItem>
                <SelectItem value="FINANCE">Finance</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSearch('')
                setStatus('ALL')
                setPriority('ALL')
                setCategory('ALL')
              }}
              title="Clear filters"
            >
              <span className="sr-only">Clear filters</span>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Tasks ({meta.total})</h2>
          <div className="flex items-center gap-2">
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
        </div>

        <div className={isFetching ? 'opacity-50 transition-opacity' : 'transition-opacity'}>
          <TaskList tasks={tasks} onRefresh={() => queryClient.invalidateQueries({ queryKey: ['tasks'] })} />
        </div>

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
