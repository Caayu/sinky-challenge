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
import { HelpCircle, Loader2 } from 'lucide-react'

import { useMutation } from '@tanstack/react-query'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function AiTaskGenerator({ onTaskCreated }: { onTaskCreated: () => void }) {
  const [prompt, setPrompt] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [isSubtasks, setIsSubtasks] = useState(false)
  const [progress, setProgress] = useState(0)

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (isSubtasks) {
        return generateSubtasks(prompt, apiKey)
      } else {
        return enhanceTask(prompt, apiKey)
      }
    },
    onSuccess: () => {
      setProgress(100)
      setPrompt('')
      onTaskCreated()
      toast.success('Generated successfully! 🤖')
    },
    onError: (error) => {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate task(s)')
    }
  })

  // Simulate progress when loading
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPending) {
      setProgress(10)
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev
          return prev + Math.random() * 10
        })
      }, 500)
    } else {
      if (progress !== 100) setProgress(0) // Reset if not success (or handle success differently)
    }
    return () => clearInterval(interval)
  }, [isPending])

  const handleGenerate = () => {
    if (!prompt || !apiKey) return
    mutate()
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card text-card-foreground">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="apiKey">Gemini API Key (Required)</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px]">
                <p>An API Key is required to access Google&apos;s AI service.</p>
                <p className="mt-2">
                  The model <strong>gemini-flash-latest</strong> has a free tier.
                </p>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline mt-2 block"
                >
                  Get your key here →
                </a>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          id="apiKey"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Paste your Gemini API Key here (starts with AIza)"
        />
        <p className="text-xs text-muted-foreground">The key is sent securely in headers and never logged.</p>
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

      {isPending && (
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">
            {progress >= 90 ? 'Finalizing...' : 'AI is thinking...'}
          </p>
        </div>
      )}

      <Button onClick={handleGenerate} className="w-full" disabled={isPending || !prompt || !apiKey}>
        {isPending ? (
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
