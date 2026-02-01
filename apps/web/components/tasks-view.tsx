'use client'

import { useState } from 'react'
import { fetchTasks } from '@/lib/api'
import { TaskResponse } from '@repo/shared'
import { TaskList } from '@/components/task-list'
import { CreateTaskForm } from '@/components/create-task-form'
import { AiTaskGenerator } from '@/components/ai-task-generator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'

export function TasksView({ initialTasks }: { initialTasks: TaskResponse[] }) {
  const [tasks, setTasks] = useState<TaskResponse[]>(initialTasks)
  const [loading, setLoading] = useState(false)

  const loadTasks = async () => {
    try {
      // Small indicator if needed, but for now we just refresh silently or use local loading if needed
      // Actually let's use loading state for manual refresh button feedback
      setLoading(true)
      const data = await fetchTasks()
      setTasks(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    } catch (error) {
      console.error(error)
      alert('Failed to refresh tasks')
    } finally {
      setLoading(false)
    }
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
            <CreateTaskForm onTaskCreated={loadTasks} />
          </TabsContent>
          <TabsContent value="ai">
            <AiTaskGenerator onTaskCreated={loadTasks} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Column: Task List */}
      <div className="md:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Tasks ({tasks.length})</h2>
          <button
            onClick={() => loadTasks()}
            className="text-sm text-primary hover:underline flex items-center gap-1"
            disabled={loading}
          >
            {loading && <Loader2 className="w-3 h-3 animate-spin" />}
            Refresh
          </button>
        </div>

        <TaskList tasks={tasks} onRefresh={loadTasks} />
      </div>
    </div>
  )
}
