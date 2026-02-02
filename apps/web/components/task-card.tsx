'use client'

import { motion } from 'framer-motion'

import { Link } from '@/i18n/routing'
import { TaskResponse } from '@repo/shared'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, Calendar, Clock } from 'lucide-react'
import { priorityColors, categoryColors } from '@/lib/constants'

interface TaskCardProps {
  task: TaskResponse
  index?: number
  onToggle: (task: TaskResponse) => void
  onDelete: (id: string) => void
}

export function TaskCard({ task, index, onToggle, onDelete }: TaskCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
      className="group"
    >
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/50">
        <CardContent className="p-4 flex items-center gap-3">
          <Checkbox checked={task.isCompleted} onCheckedChange={() => onToggle(task)} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/tasks/${task.id}`} className="hover:underline">
                <span
                  className={`font-medium truncate ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}
                >
                  {task.title}
                </span>
              </Link>
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
            onClick={() => onDelete(task.id)}
            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
