import { getRequestConfig } from 'next-intl/server'

// Can be imported from a shared config
const locales = ['en', 'pt', 'es']

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  // Ensure that a valid locale is used
  if (!locale || !locales.includes(locale)) {
    locale = 'en'
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  }
})
