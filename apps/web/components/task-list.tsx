'use client'

import { TaskResponse } from '@repo/shared'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { completeTask, deleteTask, updateTask } from '@/lib/api' // Assuming updateTask is needed for undoing? Backend support?
// Backend 'complete' is one-way? "TaskAlreadyCompletedError".
// Check backend Task entity: `complete()` sets isCompleted=true. No `uncomplete`.
// I will implement complete only for now. If user clicks checked box, maybe nothing or show generic update?
// Actually updateTask allows setting isCompleted. I'll use updateTask for toggling if strictly needed, but `completeTask` is semantic.
// Let's use `updateTask` for toggling isCompleted to false (undo), and `completeTask` for true.
import { Trash2, Calendar, Clock } from 'lucide-react'

// Helper for priority colors
const priorityColors: Record<string, string> = {
  LOW: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  MEDIUM: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  HIGH: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  CRITICAL: 'bg-red-100 text-red-800 hover:bg-red-100'
}

const categoryColors: Record<string, string> = {
  WORK: 'bg-slate-100 text-slate-800',
  PERSONAL: 'bg-green-100 text-green-800',
  SHOPPING: 'bg-purple-100 text-purple-800',
  HEALTH: 'bg-pink-100 text-pink-800',
  FINANCE: 'bg-emerald-100 text-emerald-800'
}

export function TaskList({ tasks, onRefresh }: { tasks: TaskResponse[]; onRefresh: () => void }) {
  const handleToggle = async (task: TaskResponse) => {
    try {
      if (!task.isCompleted) {
        await completeTask(task.id)
      } else {
        // Toggle back to not completed
        await updateTask(task.id, { isCompleted: false })
      }
      onRefresh()
    } catch (e) {
      console.error(e)
      alert('Failed to update task')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return
    try {
      await deleteTask(id)
      onRefresh()
    } catch (e) {
      console.error(e)
      alert('Failed to delete task')
    }
  }

  if (tasks.length === 0) {
    return <div className="text-center text-muted-foreground py-8">No tasks yet. Create one!</div>
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Card key={task.id} className="overflow-hidden">
          <CardContent className="p-4 flex items-center gap-3">
            <Checkbox checked={task.isCompleted} onCheckedChange={() => handleToggle(task)} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`font-medium truncate ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}
                >
                  {task.title}
                </span>
                {task.priority && (
                  <Badge variant="outline" className={`text-xs border-0 ${priorityColors[task.priority] || ''}`}>
                    {task.priority}
                  </Badge>
                )}
                {task.category && (
                  <Badge variant="outline" className={`text-xs border-0 ${categoryColors[task.category] || ''}`}>
                    {task.category}
                  </Badge>
                )}
              </div>

              {task.description && <p className="text-sm text-muted-foreground mt-1 truncate">{task.description}</p>}

              {task.suggestedDeadline && (
                <div className="flex items-center text-xs text-muted-foreground mt-2 gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(task.suggestedDeadline).toLocaleDateString()}
                  <Clock className="w-3 h-3 ml-2" />
                  {new Date(task.suggestedDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(task.id)}
              className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
