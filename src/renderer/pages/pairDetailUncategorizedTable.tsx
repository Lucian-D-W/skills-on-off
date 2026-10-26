import type { CSSProperties } from 'react'
import type { SkillItem } from '../../shared/types'
import { useI18n } from '../store/I18nContext'
import { InlineTagInput } from './pairDetailEditors'
import { tagFieldLabel, type TagField } from './pairDetailModel'
import { SidebarEmpty } from './pairDetailPrimitives'

export function UncategorizedTable({
  field,
  skills,
  selectedNames,
  onToggleSelected,
  onInlineSave,
}: {
  field: TagField
  skills: SkillItem[]
  selectedNames: Set<string>
  onToggleSelected: (name: string) => void
  onInlineSave: (skill: SkillItem, value: string) => void
}) {
  const { t } = useI18n()
  const fieldLabel = tagFieldLabel(field, t)
  if (!skills.length) {
    return <SidebarEmpty text={t('noUncategorizedSkills')} />
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0, border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', background: 'var(--surface)', boxShadow: 'var(--shadow)' }}>
      {skills.map((skill) => (
        <div key={`uncat-${skill.name}`} style={uncategorizedGridItemStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '18px minmax(110px, 0.9fr) minmax(0, 1.1fr)', gap: 8, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={selectedNames.has(skill.name)}
              onChange={() => onToggleSelected(skill.name)}
              style={{ width: 13, height: 13 }}
            />
            <span style={{ fontWeight: 700, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {skill.name}
            </span>
            <InlineTagInput
              value={skill.meta?.[field] ?? ''}
              placeholder={t('enterCategory', { category: fieldLabel })}
              onCommit={(value) => onInlineSave(skill, value)}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

const uncategorizedGridItemStyle: CSSProperties = {
  padding: '8px 10px',
  borderRight: '1px solid var(--border)',
  borderBottom: '1px solid var(--border)',
  minHeight: 36,
}
