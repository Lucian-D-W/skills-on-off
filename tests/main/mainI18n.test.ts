import { describe, expect, test } from 'vitest'
import { getMainProcessMessage, resolveMainLocale } from '../../src/main/mainI18n'

describe('mainI18n', () => {
  test('normalizes tray locales to the supported buckets', () => {
    expect(resolveMainLocale('zh-TW')).toBe('zh-TW')
    expect(resolveMainLocale('zh-HK')).toBe('zh-TW')
    expect(resolveMainLocale('zh-CN')).toBe('zh-CN')
    expect(resolveMainLocale('en-US')).toBe('en')
  })

  test('returns localized tray labels', () => {
    expect(getMainProcessMessage('trayShowMainWindow', 'zh-CN')).toBe('显示主窗口')
    expect(getMainProcessMessage('trayQuit', 'en-US')).toBe('Quit')
  })
})
