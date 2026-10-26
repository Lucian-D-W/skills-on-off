import Btn from '../components/Btn'
import Toggle from '../components/Toggle'
import { useI18n } from '../store/I18nContext'
import { typography } from '../styles/typography'
import type { SkillItem } from '../../shared/types'
import { countTags, tagsPreview } from './pairDetailModel'
import { TagChip } from './pairDetailPrimitives'
import { searchInputStyle, selectionBannerStyle } from './pairDetailStyles'
import type { PairDetailTab as Tab } from './pairDetailTabs'

export function SidebarToolbar({
  search,
  onSearch,
  tab,
  filterEnabled,
  onFilter,
  visibleCount,
  totalCount,
  selectedCount,
  onClearSelection,
}: {
  search: string
  onSearch: (value: string) => void
  tab: Tab
  filterEnabled: boolean | null
  onFilter: (value: boolean | null) => void
  visibleCount: number
  totalCount: number
  selectedCount: number
  onClearSelection: () => void
}) {
  const { t } = useI18n()
  const filterOptions: { label: string; value: boolean | null }[] = [
    { label: t('all'), value: null },
    { label: t('opened'), value: true },
    { label: t('closed'), value: false },
  ]

  return (
    <div style={{ padding: 14, borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder={t('searchSkillsNotesTags')}
        style={searchInputStyle}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {tab === 'all' ? (
          <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
            {filterOptions.map((option) => (
              <button
                key={String(option.value)}
                onClick={() => onFilter(option.value)}
                style={{
                  padding: '6px 10px',
                  fontSize: 11,
                  fontWeight: 600,
                  background: filterEnabled === option.value ? 'var(--accent)' : 'var(--surface)',
                  color: filterEnabled === option.value ? 'var(--accent-contrast)' : 'var(--text2)',
                  borderRight: option.value === false ? 'none' : '1px solid var(--border)',
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : (
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>
            {tab === 'enabled' ? t('showEnabledOnly') : t('browseByTags')}
          </span>
        )}

        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text3)' }}>
          {visibleCount} / {totalCount}
        </span>
      </div>

      {selectedCount > 0 && (
        <div style={selectionBannerStyle}>
          <span>{t('selectedCount', { count: selectedCount })}</span>
          <Btn small variant="ghost" onClick={onClearSelection}>
            {t('clear')}
          </Btn>
        </div>
      )}
    </div>
  )
}

export function SkillListItem({
  skill,
  active,
  selected,
  toggling,
  onOpen,
  onToggle,
  onSelect,
  compact,
}: {
  skill: SkillItem
  active: boolean
  selected: boolean
  toggling: boolean
  onOpen: () => void
  onToggle: () => void
  onSelect: () => void
  compact?: boolean
}) {
  const { t } = useI18n()
  const preview = tagsPreview(skill)

  return (
    <div
      onClick={onOpen}
      style={{
        border: '1px solid ' + (active ? 'var(--text)' : selected ? 'var(--border2)' : 'transparent'),
        borderBottomColor: active ? 'var(--text)' : selected ? 'var(--border2)' : 'var(--border)',
        background: active ? 'var(--bg2)' : 'var(--surface)',
        borderRadius: compact ? 8 : 0,
        padding: compact ? '7px 8px' : '6px 10px',
        cursor: 'pointer',
        boxShadow: active ? 'var(--shadow)' : 'none',
        minHeight: compact ? 44 : 40,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => {
            e.stopPropagation()
            onSelect()
          }}
          onClick={(e) => e.stopPropagation()}
          style={{ width: 13, height: 13, marginTop: 0, flexShrink: 0 }}
        />

        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontWeight: typography.weight.listItemTitle,
              fontSize: 14,
              color: skill.orphan ? 'var(--red)' : 'var(--text)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flexShrink: 1,
            }}
          >
            {skill.name}
          </span>
          {skill.orphan && (
            <span style={{ fontSize: 10, color: 'var(--red)', fontWeight: 700, flexShrink: 0 }}>{t('abnormal')}</span>
          )}
          {preview.length > 0 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                minWidth: 0,
                flex: 1,
                overflow: 'hidden',
              }}
            >
              {preview.map((tag) => <TagChip key={`${skill.name}-${tag}`} tag={tag} compact />)}
            </div>
          ) : (
            <span
              style={{
                fontSize: 11,
                color: 'var(--text3)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flex: 1,
              }}
            >
              {t('untagged')}
            </span>
          )}
          <span style={{ fontSize: 11, color: 'var(--text2)', flexShrink: 0, fontFamily: typography.family.ui, fontWeight: typography.weight.helper }}>{countTags(skill)} tags</span>
        </div>

        <div onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0 }}>
          <Toggle checked={skill.enabled} onChange={onToggle} disabled={toggling || skill.orphan} />
        </div>
      </div>
    </div>
  )
}
