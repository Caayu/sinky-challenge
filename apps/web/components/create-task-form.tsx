'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { createTask } from '@/lib/api'
import { toast } from 'sonner'

import { useMutation } from '@tanstack/react-query'

export function CreateTaskForm({ onTaskCreated }: { onTaskCreated: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string | undefined>('WORK')
  const [priority, setPriority] = useState<string | undefined>('MEDIUM')
  const [deadline, setDeadline] = useState('')

  const { mutate, isPending } = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      setTitle('')
      setDescription('')
      setCategory('WORK')
      setPriority('MEDIUM')
      setDeadline('')
      onTaskCreated()
      toast.success('Task created successfully')
    },
    onError: (error) => {
      console.error(error)
      toast.error('Failed to create task')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return

    mutate({
      title,
      description,
      category,
      priority,
      suggestedDeadline: deadline || null
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-card text-card-foreground">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Finish report"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional details..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WORK">Work</SelectItem>
              <SelectItem value="PERSONAL">Personal</SelectItem>
              <SelectItem value="SHOPPING">Shopping</SelectItem>
              <SelectItem value="HEALTH">Health</SelectItem>
              <SelectItem value="FINANCE">Finance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deadline">Deadline</Label>
        <Input id="deadline" type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Task'}
      </Button>
    </form>
  )
}
