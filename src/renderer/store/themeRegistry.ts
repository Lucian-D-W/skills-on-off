export type ThemeId =
  | 'morandi-calm'
  | 'earth-clay'
  | 'dark-neon'
  | 'fashion-minimal'
  | 'summer-dopamine'
  | 'retro-famicom'

export interface AppThemeDefinition {
  id: ThemeId
  label: string
  previewBg: string
  previewAccent: string
  previewAccent2: string
}

export const APP_THEMES: readonly AppThemeDefinition[] = [
  {
    id: 'morandi-calm',
    label: '莫蘭迪 Calm',
    previewBg: '#EFEBE4',
    previewAccent: '#8D8679',
    previewAccent2: '#B4C4B0',
  },
  {
    id: 'earth-clay',
    label: 'Earth Clay',
    previewBg: '#EFE2D3',
    previewAccent: '#8B5E3C',
    previewAccent2: '#C9A46A',
  },
  {
    id: 'dark-neon',
    label: 'Dark Neon',
    previewBg: '#0C1220',
    previewAccent: '#38BDF8',
    previewAccent2: '#C084FC',
  },
  {
    id: 'fashion-minimal',
    label: 'Fashion Minimal',
    previewBg: '#F3F3F3',
    previewAccent: '#000000',
    previewAccent2: '#B0B0B0',
  },
  {
    id: 'summer-dopamine',
    label: 'Summer Dopamine',
    previewBg: '#FFF5EE',
    previewAccent: '#FF69B4',
    previewAccent2: '#00FFFF',
  },
  {
    id: 'retro-famicom',
    label: '復古紅白機',
    previewBg: '#F7EFE3',
    previewAccent: '#9E2F2F',
    previewAccent2: '#F5EEDF',
  },
] as const

const THEME_IDS = new Set<ThemeId>(APP_THEMES.map((theme) => theme.id))
const FALLBACK_THEME: ThemeId = 'morandi-calm'

export function coerceThemeId(raw: string | null | undefined): ThemeId {
  if (raw === 'light') return 'morandi-calm'
  if (raw === 'dark') return 'dark-neon'
  if (!raw) return FALLBACK_THEME
  return THEME_IDS.has(raw as ThemeId) ? (raw as ThemeId) : FALLBACK_THEME
}

export function getNextThemeId(current: ThemeId): ThemeId {
  const currentIndex = APP_THEMES.findIndex((theme) => theme.id === current)
  if (currentIndex === -1) return FALLBACK_THEME
  const nextIndex = (currentIndex + 1) % APP_THEMES.length
  return APP_THEMES[nextIndex].id
}
