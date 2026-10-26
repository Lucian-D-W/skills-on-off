import type { PairProjectionMode } from '../../shared/importTypes'
import { translate, type LocaleId } from '../store/i18nRegistry'

export type PairDetailTab = 'all' | 'project' | 'func' | 'custom' | 'enabled'

export interface PairDetailTabItem {
  id: PairDetailTab
  label: string
  group: 'scope' | 'category'
}

export function getPairDetailTabs(projectionMode: PairProjectionMode, locale: LocaleId = 'en'): PairDetailTabItem[] {
  if (projectionMode === 'directory-contents-copy') {
    return [
      { id: 'all', label: translate(locale, 'all'), group: 'scope' },
      { id: 'enabled', label: translate(locale, 'enabled'), group: 'scope' },
      { id: 'custom', label: translate(locale, 'custom'), group: 'category' },
    ]
  }

  return [
    { id: 'all', label: translate(locale, 'all'), group: 'scope' },
    { id: 'enabled', label: translate(locale, 'enabled'), group: 'scope' },
    { id: 'project', label: translate(locale, 'project'), group: 'category' },
    { id: 'func', label: translate(locale, 'function'), group: 'category' },
    { id: 'custom', label: translate(locale, 'custom'), group: 'category' },
  ]
}
