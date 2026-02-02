import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

import { useTranslations } from 'next-intl'

export function TaskList({ tasks, onRefresh }: { tasks: TaskResponse[]; onRefresh: () => void }) {
  const t = useTranslations('Tasks')
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
        toast.success(t('completeSuccess'))
      } else {
        toast.info(t('unmarkSuccess'))
      }
      onRefresh()
    },
    onError: () => {
      toast.error(t('updateError'))
    }
  })

  const { mutate: confirmDelete } = useMutation({
    mutationFn: async (id: string) => deleteTask(id),
    onSuccess: () => {
      toast.error(t('deleteSuccess'))
      onRefresh()
      setDeleteId(null)
    },
    onError: () => {
      toast.error(t('deleteError'))
    }
  })

  if (tasks.length === 0) {
    return <div className="text-center text-muted-foreground py-8">{t('emptyState')}</div>
  }

  return (
    <>
      <motion.div
        className="space-y-3"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.05 } }
        }}
      >
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={setDeleteId} />
          ))}
        </AnimatePresence>
      </motion.div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('deleteConfirmDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && confirmDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
