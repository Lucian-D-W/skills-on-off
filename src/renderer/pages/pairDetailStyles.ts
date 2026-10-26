import type { CSSProperties } from 'react'
import { typography } from '../styles/typography'
import { uiMetrics } from '../styles/uiMetrics'

export const detailCardStyle: CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: 18,
  background: 'var(--surface)',
  padding: uiMetrics.cardPadding,
  boxShadow: '0 4px 14px rgba(83, 70, 59, 0.10)',
}

export const detailTextareaStyle: CSSProperties = {
  width: '100%',
  minHeight: 120,
  padding: '12px 14px',
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  color: 'var(--text)',
  fontSize: uiMetrics.bodyFontSize,
  fontFamily: typography.family.ui,
  fontWeight: typography.weight.body,
  lineHeight: 1.7,
  resize: 'vertical',
}

export const compactTagTextareaStyle: CSSProperties = {
  width: '100%',
  minHeight: 34,
  height: 38,
  padding: '8px 12px',
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  color: 'var(--text)',
  fontSize: uiMetrics.bodyFontSize,
  fontFamily: typography.family.ui,
  fontWeight: typography.weight.body,
  lineHeight: 1.4,
  resize: 'none',
  overflow: 'hidden',
}

export const fieldLabelStyle: CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: typography.weight.label,
  color: 'var(--text)',
  fontFamily: typography.family.ui,
}

export const selectedSkillChipStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '7px 12px',
  borderRadius: 999,
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  fontSize: uiMetrics.chipFontSize,
  fontWeight: typography.weight.pill,
  fontFamily: typography.family.ui,
}

export const inlineTagInputStyle: CSSProperties = {
  width: '100%',
  minHeight: 28,
  height: 28,
  padding: '4px 8px',
  background: 'transparent',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--text2)',
  fontSize: 12,
  fontFamily: typography.family.ui,
  fontWeight: typography.weight.body,
  lineHeight: 1.3,
}

export const searchInputStyle: CSSProperties = {
  width: '100%',
  minHeight: uiMetrics.controlHeight + 4,
  padding: '10px 12px',
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  color: 'var(--text)',
  fontSize: uiMetrics.bodyFontSize,
  fontFamily: typography.family.ui,
  fontWeight: typography.weight.body,
}

export const selectionBannerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  padding: '10px 12px',
  borderRadius: 12,
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  fontSize: uiMetrics.mutedFontSize,
  color: 'var(--text2)',
  fontFamily: typography.family.ui,
  fontWeight: typography.weight.label,
}
