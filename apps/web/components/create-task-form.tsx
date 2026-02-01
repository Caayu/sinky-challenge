'use client'

import { useMutation } from '@tanstack/react-query'
import { createTask } from '@/lib/api'
import { toast } from 'sonner'
import { TaskForm } from '@/components/task-form'

export function CreateTaskForm({ onTaskCreated }: { onTaskCreated: () => void }) {
  const { mutate, isPending } = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      onTaskCreated()
      toast.success('Task created successfully')
    },
    onError: (error) => {
      console.error(error)
      toast.error('Failed to create task')
    }
  })

  return <TaskForm onSubmit={(data) => mutate(data)} isPending={isPending} submitLabel="Create Task" />
}
