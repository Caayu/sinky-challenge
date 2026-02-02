'use client'

import { motion, AnimatePresence } from 'framer-motion'

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

import { useTranslations } from 'next-intl'

export function AiTaskGenerator({ onTaskCreated }: { onTaskCreated: () => void }) {
  const t = useTranslations('Ai')
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
      toast.success(t('success'))
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t('error'))
    }
  })

  // Simulate progress when loading
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPending) {
      setProgress(10)
      interval = setInterval(() => {
        setProgress((prev) => {
          // Asymptotic approach to 95%
          if (prev >= 95) return prev
          const remaining = 95 - prev
          const jump = Math.max(0.5, remaining * 0.1) // 10% of remaining distance or min 0.5
          return prev + jump
        })
      }, 500)
    } else {
      if (progress !== 100) setProgress(0)
    }
    return () => clearInterval(interval)
  }, [isPending])

  const handleGenerate = () => {
    if (!prompt || !apiKey) return
    mutate()
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="apiKey">{t('apiKeyLabel')}</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px]">
                <p>{t('tooltip1')}</p>
                <p className="mt-2">
                  {t('tooltip2')} (<strong>gemini-flash-latest</strong>)
                </p>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline mt-2 block"
                >
                  {t('tooltipLink')}
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
          placeholder={t('apiKeyPlaceholder')}
        />
        <p className="text-xs text-muted-foreground">{t('helperText')}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="prompt">{t('promptLabel')}</Label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t('promptPlaceholder')}
          rows={4}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="subtasks" checked={isSubtasks} onCheckedChange={(c) => setIsSubtasks(!!c)} />
        <Label htmlFor="subtasks">{t('subtasksLabel')}</Label>
      </div>

      <AnimatePresence>
        {isPending && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-1 overflow-hidden"
          >
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              {progress >= 90 ? t('finalizing') : t('thinking')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button onClick={handleGenerate} className="w-full" disabled={isPending || !prompt || !apiKey}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('generating')}
            </>
          ) : (
            t('magicButton')
          )}
        </Button>
      </motion.div>
    </motion.div>
  )
}
