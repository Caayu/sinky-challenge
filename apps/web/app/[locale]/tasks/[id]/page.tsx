import { getTask } from '@/lib/api'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import TaskPage from './client-page'

type Props = {
  params: Promise<{ id: string; locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params
  const t = await getTranslations({ locale, namespace: 'Tasks' })

  try {
    const task = await getTask(id)

    return {
      title: task.title
    }
  } catch {
    return {
      title: t('details')
    }
  }
}

export default async function Page({ params }: Props) {
  const { id } = await params
  return <TaskPage id={id} />
}
