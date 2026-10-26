import { describe, expect, test } from 'vitest'
import { APP_THEMES, coerceThemeId, getNextThemeId } from '../../src/renderer/store/themeRegistry'

describe('themeRegistry', () => {
  test('exposes the six operation UI themes in the intended picker order', () => {
    expect(APP_THEMES.map((theme) => theme.id)).toEqual([
      'morandi-calm',
      'earth-clay',
      'dark-neon',
      'fashion-minimal',
      'summer-dopamine',
      'retro-famicom',
    ])
  })

  test('cycles from the last theme back to the first theme', () => {
    expect(getNextThemeId('retro-famicom')).toBe('morandi-calm')
    expect(getNextThemeId('earth-clay')).toBe('dark-neon')
  })

  test('maps legacy light and dark storage values to compatible new themes', () => {
    expect(coerceThemeId('light')).toBe('morandi-calm')
    expect(coerceThemeId('dark')).toBe('dark-neon')
  })

  test('stores preview swatches that reflect each theme background as well as accent', () => {
    const darkNeon = APP_THEMES.find((theme) => theme.id === 'dark-neon')
    expect(darkNeon).toMatchObject({
      previewBg: '#0C1220',
      previewAccent: '#38BDF8',
      previewAccent2: '#C084FC',
    })
  })

  test('falls back to morandi calm when the stored value is unknown', () => {
    expect(coerceThemeId('something-else')).toBe('morandi-calm')
    expect(coerceThemeId(null)).toBe('morandi-calm')
  })
})
