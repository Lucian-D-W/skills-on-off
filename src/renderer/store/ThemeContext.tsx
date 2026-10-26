import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { APP_THEMES, coerceThemeId, getNextThemeId, type AppThemeDefinition, type ThemeId } from './themeRegistry'

interface ThemeCtx {
  theme: ThemeId
  themes: readonly AppThemeDefinition[]
  setTheme: (theme: ThemeId) => void
  toggle: () => void
}

const Ctx = createContext<ThemeCtx>({
  theme: 'morandi-calm',
  themes: APP_THEMES,
  setTheme: () => {},
  toggle: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeId>(() => {
    return coerceThemeId(localStorage.getItem('sm-theme'))
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('sm-theme', theme)
  }, [theme])

  const toggle = () => {
    setTheme((currentTheme) => getNextThemeId(currentTheme))
  }

  return <Ctx.Provider value={{ theme, themes: APP_THEMES, setTheme, toggle }}>{children}</Ctx.Provider>
}

export const useTheme = () => useContext(Ctx)
