'use client'

import { useMutation } from '@tanstack/react-query'
import { createTask } from '@/lib/api'
import { toast } from 'sonner'
import { TaskForm } from '@/components/task-form'

import { useTranslations } from 'next-intl'

export function CreateTaskForm({ onTaskCreated }: { onTaskCreated: () => void }) {
  const t = useTranslations('Tasks')
  const { mutate, isPending } = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      onTaskCreated()
      toast.success(t('createSuccess'))
    },
    onError: () => {
      toast.error(t('createError'))
    }
  })

  return <TaskForm onSubmit={(data) => mutate(data)} isPending={isPending} submitLabel={t('createButton')} />
}
