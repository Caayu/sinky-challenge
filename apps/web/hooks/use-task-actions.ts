import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateTask, completeTask, deleteTask } from '@/lib/api'
import { toast } from 'sonner'
import { type TaskResponse } from '@repo/shared'

export function useTaskActions() {
  const queryClient = useQueryClient()

  // Toggle completion status
  const { mutate: toggleComplete } = useMutation({
    mutationFn: async (task: TaskResponse) => {
      if (task.isCompleted) {
        return updateTask(task.id, { isCompleted: false })
      } else {
        return completeTask(task.id)
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] })
      toast.success(data.isCompleted ? 'Task completed! 🎉' : 'Task marked as pending')
    },
    onError: () => toast.error('Failed to toggle status')
  })

  // Delete Task
  const { mutate: doDelete } = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task deleted')
    },
    onError: () => toast.error('Failed to delete task')
  })

  return {
    toggleComplete,
    deleteTask: doDelete
  }
}
