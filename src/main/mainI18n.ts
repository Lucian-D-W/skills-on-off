type MainLocale = 'zh-TW' | 'zh-CN' | 'en'
type MainMessageKey = 'trayShowMainWindow' | 'trayQuit'

const MAIN_MESSAGES: Record<MainLocale, Record<MainMessageKey, string>> = {
  'zh-TW': {
    trayShowMainWindow: '顯示主視窗',
    trayQuit: '退出',
  },
  'zh-CN': {
    trayShowMainWindow: '显示主窗口',
    trayQuit: '退出',
  },
  en: {
    trayShowMainWindow: 'Show Main Window',
    trayQuit: 'Quit',
  },
}

export function resolveMainLocale(locale: string): MainLocale {
  const normalized = locale.trim().toLowerCase()
  if (normalized.startsWith('zh-tw') || normalized.startsWith('zh-hk') || normalized.startsWith('zh-mo')) {
    return 'zh-TW'
  }
  if (normalized.startsWith('zh')) {
    return 'zh-CN'
  }
  return 'en'
}

export function getMainProcessMessage(key: MainMessageKey, locale: string): string {
  return MAIN_MESSAGES[resolveMainLocale(locale)][key]
}
