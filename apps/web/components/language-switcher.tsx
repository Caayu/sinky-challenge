'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

const locales = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' }
]

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleLocaleChange = (newLocale: string) => {
    // Replace the locale in the pathname
    // e.g., /en/tasks -> /pt/tasks
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/'
    router.replace(`/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`)
  }

  const currentFlag = locales.find((l) => l.code === locale)?.flag || '🇺🇸'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-xl">
          {currentFlag}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => handleLocaleChange(l.code)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span>{l.flag}</span>
            <span>{l.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
