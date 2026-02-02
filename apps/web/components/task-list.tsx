import { useState } from 'react'
import { TaskResponse } from '@repo/shared'
import { completeTask, deleteTask, updateTask } from '@/lib/api'
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
import { useMutation } from '@tanstack/react-query'
import { TaskCard } from './task-card'

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
        {tasks.map((task, index) => (
          <TaskCard key={task.id} task={task} index={index} onToggle={toggleTask} onDelete={setDeleteId} />
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
