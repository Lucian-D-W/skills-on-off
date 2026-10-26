import { messages, type LocaleId, type MessageKey } from './i18nMessages'

export type { LocaleId } from './i18nMessages'

export interface LocaleOption {
  id: LocaleId
  label: string
}

export const LOCALE_OPTIONS: readonly LocaleOption[] = [
  { id: 'zh-TW', label: '繁體中文' },
  { id: 'zh-CN', label: '简体中文' },
  { id: 'en', label: 'English' },
] as const

const LOCALE_SET = new Set<LocaleId>(LOCALE_OPTIONS.map((item) => item.id))

export function coerceLocale(raw: string | null | undefined): LocaleId {
  if (!raw) return 'zh-TW'
  return LOCALE_SET.has(raw as LocaleId) ? (raw as LocaleId) : 'zh-TW'
}

export function translate(locale: LocaleId, key: MessageKey, vars?: Record<string, string | number>): string {
  const template = messages[locale][key] ?? messages['zh-TW'][key]
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? ''))
}
