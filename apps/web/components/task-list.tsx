'use client'

import { useState } from 'react'
import { TaskResponse } from '@repo/shared'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { completeTask, deleteTask, updateTask } from '@/lib/api'
import { Trash2, Calendar, Clock } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

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

import { useMutation } from '@tanstack/react-query'

export function TaskList({ tasks, onRefresh }: { tasks: TaskResponse[]; onRefresh: () => void }) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { mutate: toggleTask } = useMutation({
    mutationFn: async (task: TaskResponse) => {
      if (!task.isCompleted) {
        return completeTask(task.id)
      } else {
        return updateTask(task.id, { isCompleted: false })
      }
    },
    onSuccess: (data, variables) => {
      if (!variables.isCompleted) {
        toast.success('Task completed! 🎉')
      } else {
        toast.info('Task unmarked')
      }
      onRefresh()
    },
    onError: (error) => {
      console.error(error)
      toast.error('Failed to update task')
    }
  })

  const { mutate: confirmDelete } = useMutation({
    mutationFn: async (id: string) => deleteTask(id),
    onSuccess: () => {
      toast.error('Task deleted')
      onRefresh()
      setDeleteId(null)
    },
    onError: (error) => {
      console.error(error)
      toast.error('Failed to delete task')
    }
  })

  if (tasks.length === 0) {
    return <div className="text-center text-muted-foreground py-8">No tasks yet. Create one!</div>
  }

  return (
    <>
      <div className="space-y-3">
        {tasks.map((task) => (
          <Card key={task.id} className="overflow-hidden">
            <CardContent className="p-4 flex items-center gap-3">
              <Checkbox checked={task.isCompleted} onCheckedChange={() => toggleTask(task)} />

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
                onClick={() => setDeleteId(task.id)}
                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && confirmDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
