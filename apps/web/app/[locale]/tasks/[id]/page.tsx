'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useRouter } from '@/i18n/routing'
import { useTranslations, useFormatter } from 'next-intl'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTask, updateTask } from '@/lib/api'
import { useTaskActions } from '@/hooks/use-task-actions'
import { TaskForm } from '@/components/task-form'
import {
  Loader2,
  ArrowLeft,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Tag,
  AlertTriangle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { priorityColors } from '@/lib/constants'
import { UpdateTaskInput } from '@repo/shared'

// Note: Ensure consistent Date format handling
// Note: Ensure consistent Date format handling

export default function TaskPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const queryClient = useQueryClient()
  const t = useTranslations('Tasks')
  const tEnums = useTranslations('Enums')
  const format = useFormatter()

  const [isEditing, setIsEditing] = useState(false)

  const {
    data: task,
    isLoading,
    error
  } = useQuery({
    queryKey: ['task', id],
    queryFn: () => getTask(id),
    enabled: !!id
  })

  const { mutate: doUpdate, isPending: isUpdating } = useMutation({
    mutationFn: (data: UpdateTaskInput) => updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task', id] })
      toast.success(t('updateSuccess'))
      setIsEditing(false)
    },
    onError: () => {
      toast.error(t('updateError'))
    }
  })

  const { toggleComplete, deleteTask } = useTaskActions()
  const handleDelete = () => {
    deleteTask(id, {
      onSuccess: () => router.replace('/')
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-destructive font-medium">{t('failedLoad')}</p>
        <Button onClick={() => router.back()}>{t('goBack')}</Button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="container max-w-5xl mx-auto py-8 lg:py-12 space-y-8"
    >
      {/* Navigation & Actions Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="group text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors group-hover:bg-muted/50">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">{t('back')}</span>
          </div>
        </Button>

        <div className="flex gap-2">
          <AnimatePresence mode="wait">
            {!isEditing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex gap-2"
              >
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="shadow-sm">
                  <Pencil className="w-3.5 h-3.5 mr-2" /> {t('edit')}
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('deleteTaskMethod')}</AlertDialogTitle>
                      <AlertDialogDescription>{t('deleteTaskDescription')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete()}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {t('delete')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </motion.div>
            )}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                  {t('cancel')}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="edit-mode"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-primary/20 shadow-xl bg-card/50 backdrop-blur-sm">
              <CardHeader className="border-b bg-muted/20 pb-6">
                <CardTitle className="text-2xl text-primary font-bold">{t('edit')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-8 px-6 lg:px-8">
                <TaskForm
                  initialData={task}
                  onSubmit={(data) => doUpdate(data)}
                  isPending={isUpdating}
                  submitLabel={t('saveChanges')}
                />
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="view-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-10"
          >
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card to-muted/50 border shadow-sm p-6 lg:p-8">
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge
                    variant={task.isCompleted ? 'default' : 'secondary'}
                    className={`text-sm px-3 py-1 rounded-full ${task.isCompleted ? 'bg-green-600 hover:bg-green-700 shadow-green-200 dark:shadow-green-900 shadow-sm' : 'bg-secondary text-secondary-foreground'}`}
                  >
                    {task.isCompleted ? t('completed') : tEnums('Status.PENDING')}
                  </Badge>
                  {task.priority && (
                    <Badge
                      variant="outline"
                      className={`${priorityColors[task.priority]} border bg-background/50 backdrop-blur-md`}
                    >
                      {tEnums(`Priority.${task.priority}`)}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-col lg:flex-row gap-6 lg:items-end justify-between">
                  <div className="space-y-4 max-w-3xl">
                    <h1
                      className={`text-3xl lg:text-4xl font-bold tracking-tight leading-tight ${task.isCompleted ? 'text-muted-foreground line-through decoration-muted-foreground/30' : 'text-foreground'}`}
                    >
                      {task.title}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        {t('created')} {format.dateTime(new Date(task.createdAt), { dateStyle: 'medium' })}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className={`
                            relative overflow-hidden rounded-xl px-8 h-12 text-base font-semibold shadow-md transition-all duration-300 shrink-0
                            ${
                              task.isCompleted
                                ? 'bg-background text-foreground border hover:bg-accent hover:text-accent-foreground'
                                : 'bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5'
                            }
                        `}
                    onClick={() => toggleComplete(task)}
                  >
                    {task.isCompleted ? (
                      <>
                        <Circle className="w-5 h-5 mr-2" /> {t('markUncomplete')}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-2" /> {t('markComplete')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Main Content: Description */}
              <div className="lg:col-span-8 space-y-6">
                <Card className="h-full border-none shadow-lg bg-card/80 backdrop-blur-sm ring-1 ring-border/50">
                  <CardHeader className="border-b border-border/50 pb-4 bg-muted/10">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <div className="p-1.5 bg-primary/10 rounded-md">
                        <Pencil className="w-4 h-4 text-primary" />
                      </div>
                      {t('description')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-8 pb-8 px-6 md:px-8">
                    {task.description ? (
                      <div className="prose prose-stone dark:prose-invert max-w-none text-base leading-relaxed whitespace-pre-wrap text-foreground/90">
                        {task.description}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/40 gap-3 border-2 border-dashed rounded-xl">
                        <Pencil className="w-10 h-10 opacity-20" />
                        <p className="font-medium">{t('noDescription')}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar: Details */}
              <div className="lg:col-span-4 space-y-6">
                <div className="sticky top-8">
                  <Card className="overflow-hidden border-none shadow-lg bg-card/80 backdrop-blur-sm ring-1 ring-border/50">
                    <CardHeader className="border-b border-border/50 pb-4 bg-muted/10">
                      <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-md">
                          <Tag className="w-3.5 h-3.5 text-primary" />
                        </div>
                        {t('details')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-border/50">
                        <div className="p-5 flex items-center justify-between group hover:bg-muted/5 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                              <BriefcaseIcon category={task.category} className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-muted-foreground uppercase">
                                {t('category')}
                              </span>
                              <span className="text-sm font-medium capitalize text-foreground">
                                {task.category ? tEnums(`Category.${task.category}`) : '—'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 flex items-center justify-between group hover:bg-muted/5 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-muted-foreground uppercase">
                                {t('priority')}
                              </span>
                              <span className="text-sm font-medium capitalize text-foreground">
                                {task.priority ? tEnums(`Priority.${task.priority}`) : '—'}
                              </span>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={`${task.priority ? priorityColors[task.priority] : ''} border bg-transparent font-bold`}
                          >
                            {task.priority ? task.priority : ''}
                          </Badge>
                        </div>

                        {task.suggestedDeadline && (
                          <div className="p-5 flex items-center justify-between group hover:bg-muted/5 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                                <Calendar className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-muted-foreground uppercase">
                                  {t('deadline')}
                                </span>
                                <span className="text-sm font-medium capitalize text-foreground">
                                  {format.dateTime(new Date(task.suggestedDeadline), { dateStyle: 'medium' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function BriefcaseIcon({ className }: { category?: string; className?: string }) {
  const defaultClass = className || 'w-4 h-4'
  // Here I can add logic for different icons if I want, like:
  // if (category === 'WORK') return <Briefcase className={defaultClass} />
  // But for now Tag is fine or specific icons.
  return <Tag className={defaultClass} />
}
