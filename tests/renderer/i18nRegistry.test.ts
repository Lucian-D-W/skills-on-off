import { describe, expect, test } from 'vitest'
import { coerceLocale, LOCALE_OPTIONS, translate } from '../../src/renderer/store/i18nRegistry'

describe('i18nRegistry', () => {
  test('supports traditional chinese, simplified chinese, and english', () => {
    expect(LOCALE_OPTIONS.map((item) => item.id)).toEqual(['zh-TW', 'zh-CN', 'en'])
  })

  test('falls back to traditional chinese for unknown locale values', () => {
    expect(coerceLocale('ja')).toBe('zh-TW')
    expect(coerceLocale(null)).toBe('zh-TW')
  })

  test('translates shared menu labels across locales', () => {
    expect(translate('zh-TW', 'githubImport')).toBe('GitHub 導入')
    expect(translate('zh-CN', 'githubImport')).toBe('GitHub 导入')
    expect(translate('en', 'githubImport')).toBe('GitHub Import')
  })

  test('omits dev-only helper copy in the detail interface across locales', () => {
    for (const locale of LOCALE_OPTIONS.map((item) => item.id)) {
      expect(translate(locale, 'skillDetailHint')).toBe('')
      expect(translate(locale, 'noteSubtitle')).toBe('')
      expect(translate(locale, 'pathAndStatusSubtitle')).toBe('')
    }
  })

  test('provides descriptive import option labels across locales', () => {
    expect(translate('zh-TW', 'skillsWhitelistOption')).toContain('適合多 skill 倉庫')
    expect(translate('zh-TW', 'wholeFolderOption')).toContain('原樣帶入')
    expect(translate('zh-CN', 'folderContentsOption')).toContain('不保留外层文件夹')
    expect(translate('en', 'agentFilesOption')).toContain('AGENTS.md')
  })

  test('provides rename-group labels across locales', () => {
    expect(translate('zh-TW', 'renameGroup')).toBe('重命名分組')
    expect(translate('zh-CN', 'confirmRenameGroup')).toBe('确认重命名')
    expect(translate('en', 'renameGroupInvalidMultiple')).toContain('spaces')
  })
})
