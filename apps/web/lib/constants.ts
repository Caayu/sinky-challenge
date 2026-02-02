import { TaskCategory, TaskPriority } from '@repo/shared'

export const priorityColors: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300',
  [TaskPriority.MEDIUM]: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300',
  [TaskPriority.HIGH]: 'bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300',
  [TaskPriority.CRITICAL]: 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300'
}

export const categoryColors: Record<TaskCategory, string> = {
  [TaskCategory.WORK]: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  [TaskCategory.PERSONAL]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  [TaskCategory.SHOPPING]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  [TaskCategory.HEALTH]: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  [TaskCategory.FINANCE]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
}
