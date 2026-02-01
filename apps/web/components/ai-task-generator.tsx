'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { enhanceTask, generateSubtasks } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function AiTaskGenerator({ onTaskCreated }: { onTaskCreated: () => void }) {
  const [prompt, setPrompt] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [isSubtasks, setIsSubtasks] = useState(false)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  // Simulate progress when loading
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (loading) {
      setProgress(10)
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev
          return prev + Math.random() * 10
        })
      }, 500)
    } else {
      setProgress(0)
    }
    return () => clearInterval(interval)
  }, [loading])

  const handleGenerate = async () => {
    if (!prompt) return

    setLoading(true)
    try {
      if (isSubtasks) {
        await generateSubtasks(prompt)
      } else {
        await enhanceTask(prompt)
      }

      setProgress(100)
      setPrompt('')
      onTaskCreated()
      toast.success('Generated successfully! 🤖')
    } catch (error) {
      console.error(error)
      toast.error('Failed to generate task(s)')
    } finally {
      // Small delay to show 100%
      setTimeout(() => setLoading(false), 500)
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card text-card-foreground">
      <div className="space-y-2">
        <Label htmlFor="apiKey">Gemini API Key (Optional)</Label>
        <Input
          id="apiKey"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Leave empty to use server configuration"
        />
        <p className="text-xs text-muted-foreground">
          If provided, this key will override the server&apos;s default key (Not implemented on backend yet).
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="prompt">What do you want to achieve?</Label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ex: Plan a birthday party for next Saturday..."
          rows={4}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="subtasks" checked={isSubtasks} onCheckedChange={(c) => setIsSubtasks(!!c)} />
        <Label htmlFor="subtasks">Break down into subtasks</Label>
      </div>

      {loading && (
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">
            {progress >= 90 ? 'Finalizing...' : 'AI is thinking...'}
          </p>
        </div>
      )}

      <Button onClick={handleGenerate} className="w-full" disabled={loading || !prompt}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          'Magic Generate ✨'
        )}
      </Button>
    </div>
  )
}
