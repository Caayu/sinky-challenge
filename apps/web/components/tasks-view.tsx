'use client'

import { motion } from 'framer-motion'

import { useState, useEffect } from 'react'
import { fetchTasks } from '@/lib/api'
import { TaskResponse, PaginatedResponse, TaskCategory, TaskPriority } from '@repo/shared'
import { TaskList } from '@/components/task-list'
import { CreateTaskForm } from '@/components/create-task-form'
import { AiTaskGenerator } from '@/components/ai-task-generator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { useTaskFilters } from '@/hooks/use-task-filters'

import { useTranslations } from 'next-intl'

export function TasksView({ initialData }: { initialData: PaginatedResponse<TaskResponse> }) {
  const t = useTranslations('Tasks')
  const tEnums = useTranslations('Enums')
  const [page, setPage] = useState(initialData.meta.page)
  const queryClient = useQueryClient()
  const limit = initialData.meta.limit

  // Hydration fix
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const {
    search,
    setSearch,
    debouncedSearch,
    status,
    setStatus,
    priority,
    setPriority,
    category,
    setCategory,
    sort,
    setSort,
    clearFilters
  } = useTaskFilters()

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status, priority, category, sort])

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['tasks', page, limit, debouncedSearch, status, priority, category, sort],
    queryFn: () =>
      fetchTasks({
        page,
        limit,
        search: debouncedSearch,
        status: status === 'ALL' ? undefined : status,
        priority: priority === 'ALL' ? undefined : priority,
        category: category === 'ALL' ? undefined : category,
        sort
      }),
    placeholderData: keepPreviousData,
    initialData: page === 1 ? initialData : undefined
  })

  const tasks = data?.data ?? []
  const meta = data?.meta ?? initialData.meta

  const handleTaskCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] })
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
          <div className="h-[300px] border rounded-lg bg-muted/10 animate-pulse" />
        </div>
        <div className="md:col-span-2 space-y-4">
          <TaskList tasks={initialData.data} onRefresh={() => {}} />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-8"
    >
      <div className="md:col-span-1 space-y-6">
        <Tabs defaultValue="ai" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">{t('manualTab')}</TabsTrigger>
            <TabsTrigger value="ai">{t('aiTab')}</TabsTrigger>
          </TabsList>
          <TabsContent value="manual">
            <CreateTaskForm onTaskCreated={handleTaskCreated} />
          </TabsContent>
          <TabsContent value="ai">
            <AiTaskGenerator onTaskCreated={handleTaskCreated} />
          </TabsContent>
        </Tabs>
      </div>

      <div className="md:col-span-2 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <Input
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64"
          />
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder={t('statusPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('allStatus')}</SelectItem>
                <SelectItem value="PENDING">{tEnums('Status.PENDING')}</SelectItem>
                <SelectItem value="DONE">{tEnums('Status.DONE')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder={t('priorityPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('allPriorities')}</SelectItem>
                {Object.values(TaskPriority).map((p) => (
                  <SelectItem key={p} value={p}>
                    {tEnums(`Priority.${p}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder={t('categoryPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('allCategories')}</SelectItem>
                {Object.values(TaskCategory).map((c) => (
                  <SelectItem key={c} value={c}>
                    {tEnums(`Category.${c}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder={t('sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t('newest')}</SelectItem>
                <SelectItem value="oldest">{t('oldest')}</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" size="icon" onClick={clearFilters} title={t('clearFilters')}>
              <span className="sr-only">{t('clearFilters')}</span>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {t('yourTasks')} ({meta.total})
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="text-primary hover:underline gap-1"
            disabled={isFetching}
          >
            {isFetching && <Loader2 className="w-3 h-3 animate-spin" />}
            {t('refresh')}
          </Button>
        </div>

        <div className={isFetching ? 'opacity-50 transition-opacity' : 'transition-opacity'}>
          <TaskList tasks={tasks} onRefresh={() => queryClient.invalidateQueries({ queryKey: ['tasks'] })} />
        </div>

        <div className="flex items-center justify-between text-sm py-4">
          <div className="text-muted-foreground">
            {t('page')} {meta.page} {t('of')} {meta.totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={isFetching || !meta.hasPreviousPage}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              {t('prev')}
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={isFetching || !meta.hasNextPage}>
              {t('next')}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
