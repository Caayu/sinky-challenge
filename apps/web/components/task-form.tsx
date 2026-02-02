import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { TaskResponse, createTaskSchema, TaskCategory, TaskPriority } from '@repo/shared'
import { Loader2 } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

// We need to extend/refine the schema for the form because the shared schema might expect Date objects or strings differently than the form input
// actually mostly compatible. Let's see.
// The shared CreateTaskSchema likely expects strings for enums.
// For the form, deadline is a string from input type="datetime-local"

const FormSchema = createTaskSchema.extend({
  suggestedDeadline: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val))
})

type FormValues = z.infer<typeof FormSchema>

interface TaskFormProps {
  initialData?: TaskResponse
  onSubmit: (data: FormValues) => void
  isPending: boolean
  submitLabel?: string
}

import { useTranslations } from 'next-intl'

export function TaskForm({ initialData, onSubmit, isPending, submitLabel }: TaskFormProps) {
  const t = useTranslations('Tasks')
  const tEnums = useTranslations('Enums')
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: initialData?.title ?? '',
      description: initialData?.description ?? '',
      category: (initialData?.category as FormValues['category']) ?? 'WORK',
      priority: (initialData?.priority as FormValues['priority']) ?? 'MEDIUM',
      suggestedDeadline: initialData?.suggestedDeadline
        ? new Date(initialData.suggestedDeadline).toISOString().slice(0, 16)
        : ''
    }
  })

  const handleSubmit = (values: FormValues) => {
    onSubmit(values)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 p-4 border rounded-lg bg-card text-card-foreground"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('title')}</FormLabel>
              <FormControl>
                <Input placeholder={t('titlePlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('description')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('descriptionPlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('category')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('category')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(TaskCategory).map((category) => (
                      <SelectItem key={category} value={category}>
                        {tEnums(`Category.${category}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('priority')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('priority')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(TaskPriority).map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {tEnums(`Priority.${priority}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="suggestedDeadline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('deadline')}</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? t('saving') : submitLabel}
        </Button>
      </form>
    </Form>
  )
}
