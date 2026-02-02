'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
import { priorityColors, categoryColors } from '@/lib/constants'
import { UpdateTaskInput } from '@repo/shared'

// Note: Ensure consistent Date format handling
// Note: Ensure consistent Date format handling
const formatDate = (date: string | Date) => new Date(date).toLocaleDateString()
const formatTime = (date: string | Date) =>
  new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export default function TaskPage() {
  const router = useRouter()
  // useParams handles generic params in Client Component
  const params = useParams()
  const id = params?.id as string
  const queryClient = useQueryClient()

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

  // Fixed: typed update call
  const { mutate: doUpdate, isPending: isUpdating } = useMutation({
    mutationFn: (data: UpdateTaskInput) => updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task', id] })
      toast.success('Task updated successfully')
      setIsEditing(false)
    },
    onError: (error) => {
      console.error(error)
      toast.error('Failed to update task')
    }
  })

  const { toggleComplete, deleteTask } = useTaskActions()
  // Add redirect logic for delete here, since hook is generic
  const handleDelete = () => {
    deleteTask(id, {
      onSuccess: () => router.replace('/')
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-destructive">Failed to load task</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2 shrink-0">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <div className="flex gap-2">
          {!isEditing && (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Task?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
          {isEditing && (
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Edit Mode */}
      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit Task</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskForm
              initialData={task}
              onSubmit={(data) => doUpdate(data)}
              isPending={isUpdating}
              submitLabel="Save Changes"
            />
          </CardContent>
        </Card>
      ) : (
        /* View Mode */
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-start justify-between">
            <div className="space-y-2">
              <h1 className={`text-3xl font-bold ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </h1>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Created {new Date(task.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <Button
              variant={task.isCompleted ? 'secondary' : 'default'}
              className="gap-2 min-w-[140px]"
              onClick={() => toggleComplete(task)}
            >
              {task.isCompleted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> Completed
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4" /> Mark Complete
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                {task.description ? (
                  <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{task.description}</p>
                ) : (
                  <p className="italic text-muted-foreground/50">No description provided.</p>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                    Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold mb-1 flex items-center gap-2">
                      <BriefcaseIcon category={task.category} /> Category
                    </h3>
                    <Badge
                      variant="secondary"
                      className={`${task.category ? categoryColors[task.category] : ''} border-0`}
                    >
                      {task.category || 'None'}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold mb-1 flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3" /> Priority
                    </h3>
                    <Badge
                      variant="secondary"
                      className={`${task.priority ? priorityColors[task.priority] : ''} border-0`}
                    >
                      {task.priority || 'None'}
                    </Badge>
                  </div>

                  {task.suggestedDeadline && (
                    <div>
                      <h3 className="text-xs font-semibold mb-1 flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> Deadline
                      </h3>
                      <p className="text-sm font-medium">
                        {formatDate(task.suggestedDeadline)}
                        <span className="block text-xs text-muted-foreground font-normal">
                          {formatTime(task.suggestedDeadline)}
                        </span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function BriefcaseIcon({ category }: { category?: string }) {
  if (!category) return <Tag className="w-3 h-3" />
  // Could swap icons based on category if desired
  return <Tag className="w-3 h-3" />
}
