import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { LOCALE_OPTIONS, coerceLocale, translate, type LocaleId, type LocaleOption } from './i18nRegistry'

interface I18nCtx {
  locale: LocaleId
  locales: readonly LocaleOption[]
  setLocale: (locale: LocaleId) => void
  t: (key: Parameters<typeof translate>[1], vars?: Record<string, string | number>) => string
}

const Ctx = createContext<I18nCtx>({
  locale: 'zh-TW',
  locales: LOCALE_OPTIONS,
  setLocale: () => {},
  t: (key) => String(key),
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<LocaleId>(() => coerceLocale(localStorage.getItem('sm-locale')))

  useEffect(() => {
    localStorage.setItem('sm-locale', locale)
    document.documentElement.setAttribute('lang', locale)
  }, [locale])

  function t(key: Parameters<typeof translate>[1], vars?: Record<string, string | number>) {
    return translate(locale, key, vars)
  }

  return <Ctx.Provider value={{ locale, locales: LOCALE_OPTIONS, setLocale, t }}>{children}</Ctx.Provider>
}

export const useI18n = () => useContext(Ctx)
