import { useEffect, useState } from 'react'
import type { SkillItem } from '../../shared/types'
import Btn from '../components/Btn'
import { useI18n } from '../store/I18nContext'
import { typography } from '../styles/typography'
import { uiMetrics } from '../styles/uiMetrics'
import { normTags, parseTags, type BatchAction, type DetailForm, type TagField } from './pairDetailModel'
import { TagChip } from './pairDetailPrimitives'
import {
  compactTagTextareaStyle,
  detailCardStyle,
  fieldLabelStyle,
  inlineTagInputStyle,
  selectedSkillChipStyle,
} from './pairDetailStyles'

export function BatchEditor({
  skills,
  onApply,
  onClearSelection,
}: {
  skills: SkillItem[]
  onApply: (action: BatchAction, form: Pick<DetailForm, TagField>) => void
  onClearSelection: () => void
}) {
  const { t } = useI18n()
  const [form, setForm] = useState<Pick<DetailForm, TagField>>({
    projectTags: '',
    funcTags: '',
    customTags: '',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 920 }}>
      <section style={detailCardStyle}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: uiMetrics.pageTitleSize, lineHeight: 1.08, fontWeight: typography.weight.pageTitle, fontFamily: typography.family.ui }}>{t('batchTagEditing')}</h2>
            <p style={{ marginTop: 10, fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>
              {t('batchTagEditingHint', { count: skills.length })}
            </p>
          </div>
          <Btn variant="ghost" onClick={onClearSelection}>
            {t('clearSelection')}
          </Btn>
        </div>
      </section>

      <section style={detailCardStyle}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12 }}>{t('batchTags')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
          <TagFieldEditor
            label={t('projectTags')}
            value={form.projectTags}
            placeholder={t('projectTagsPlaceholder')}
            onChange={(value) => setForm((prev) => ({ ...prev, projectTags: value }))}
          />
          <TagFieldEditor
            label={t('functionTags')}
            value={form.funcTags}
            placeholder={t('functionTagsPlaceholder')}
            onChange={(value) => setForm((prev) => ({ ...prev, funcTags: value }))}
          />
          <TagFieldEditor
            label={t('customTags')}
            value={form.customTags}
            placeholder={t('customTagsPlaceholder')}
            onChange={(value) => setForm((prev) => ({ ...prev, customTags: value }))}
          />
        </div>
      </section>

      <section style={detailCardStyle}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12 }}>{t('applyMode')}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Btn variant="primary" onClick={() => onApply('append', form)}>{t('appendToSelected')}</Btn>
          <Btn variant="ghost" onClick={() => onApply('replace', form)}>{t('replaceSelected')}</Btn>
          <Btn variant="danger" onClick={() => onApply('remove', form)}>{t('removeFromSelected')}</Btn>
        </div>
      </section>

      <section style={detailCardStyle}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12 }}>{t('selectedSkills')}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {skills.map((skill) => (
            <span key={skill.name} style={selectedSkillChipStyle}>
              {skill.name}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}

export function TagFieldEditor({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
}) {
  const tags = parseTags(value)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={fieldLabelStyle}>{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={1}
        style={compactTagTextareaStyle}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {tags.length > 0 ? tags.map((tag) => <TagChip key={`${label}-${tag}`} tag={tag} />) : (
          <span style={{ fontSize: 11, color: 'var(--text3)' }}> </span>
        )}
      </div>
    </div>
  )
}

export function InlineTagInput({
  value,
  placeholder,
  onCommit,
}: {
  value: string
  placeholder: string
  onCommit: (value: string) => void
}) {
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    setDraft(value)
  }, [value])

  function commit() {
    const normalized = normTags(draft)
    if (normalized !== value) onCommit(normalized)
  }

  return (
    <input
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          ;(e.currentTarget as HTMLInputElement).blur()
        }
      }}
      placeholder={placeholder}
      style={inlineTagInputStyle}
    />
  )
}
