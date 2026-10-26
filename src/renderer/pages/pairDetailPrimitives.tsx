import { typography } from '../styles/typography'
import { uiMetrics } from '../styles/uiMetrics'

interface TagTone {
  text: string
  border: string
  background: string
}

const MORANDI_TAG_PALETTE: TagTone[] = [
  { text: '#8a5f6d', border: '#e1bdc8', background: '#f5dce4' },
  { text: '#796177', border: '#d8c3d6', background: '#eee0ef' },
  { text: '#7f6a8f', border: '#d1c7e4', background: '#e7e1f3' },
  { text: '#5e708d', border: '#c3d0e2', background: '#dbe5f0' },
  { text: '#587987', border: '#bdd7df', background: '#d9ebf0' },
  { text: '#4f7c74', border: '#bdd8d0', background: '#d9ece5' },
  { text: '#6d8160', border: '#cfdec2', background: '#e6f0dc' },
  { text: '#7d8354', border: '#dcdfbe', background: '#f0f1da' },
  { text: '#8d7852', border: '#e4d2ba', background: '#f3e7d5' },
  { text: '#956d5c', border: '#e3c9be', background: '#f3dfd7' },
  { text: '#9b646e', border: '#e5bcc5', background: '#f5d8de' },
  { text: '#7c6b66', border: '#dad0cc', background: '#eee8e5' },
  { text: '#7a6f83', border: '#d6cede', background: '#ebe6f1' },
  { text: '#6a7388', border: '#cdd4e1', background: '#e5eaf2' },
  { text: '#647a75', border: '#c7dad4', background: '#e1ece8' },
  { text: '#79866c', border: '#d4dec9', background: '#ebf1e4' },
  { text: '#88755c', border: '#e1d2c1', background: '#f2e7dc' },
  { text: '#8f6d78', border: '#dfc7cf', background: '#f0dfe5' },
  { text: '#736a92', border: '#cec8e6', background: '#e6e2f4' },
  { text: '#59748b', border: '#bfd1de', background: '#dce8f0' },
  { text: '#4d7f7e', border: '#b7d9d5', background: '#d8eeea' },
  { text: '#68845c', border: '#c9ddbf', background: '#e4efdc' },
  { text: '#837f5c', border: '#deddbe', background: '#f0efd9' },
  { text: '#95695d', border: '#e1c5bb', background: '#f2ddd7' },
  { text: '#8c617c', border: '#dfbfd0', background: '#f2d9e6' },
  { text: '#6f6880', border: '#d6cfdb', background: '#ece8ef' },
  { text: '#667488', border: '#c8d3df', background: '#e2e9f0' },
  { text: '#5b8071', border: '#bfd9cf', background: '#dbede5' },
  { text: '#74835f', border: '#d0ddc1', background: '#e8f0de' },
  { text: '#8b7957', border: '#e0d3bf', background: '#f2e8d8' },
  { text: '#916761', border: '#e1c6c1', background: '#f2ddd9' },
  { text: '#9a6476', border: '#e3bfcc', background: '#f4dbe4' },
]

const tagToneAssignments = new Map<string, TagTone>()
let nextTagToneIndex = 0

function getTagTone(tag: string): TagTone {
  const existing = tagToneAssignments.get(tag)
  if (existing) return existing

  const tone = MORANDI_TAG_PALETTE[nextTagToneIndex % MORANDI_TAG_PALETTE.length]
  nextTagToneIndex += 1
  tagToneAssignments.set(tag, tone)
  return tone
}

export function TagChip({ tag, compact }: { tag: string; compact?: boolean }) {
  const tone = getTagTone(tag)
  return (
    <span
      style={{
        color: tone.text,
        border: `1px solid ${tone.border}`,
        background: tone.background,
        padding: compact ? '1px 6px' : '2px 8px',
        borderRadius: 999,
        fontSize: compact ? 10 : 11,
        fontWeight: typography.weight.pill,
        letterSpacing: '0.03em',
        whiteSpace: 'nowrap',
        fontFamily: typography.family.ui,
      }}
    >
      #{tag}
    </span>
  )
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  const hasSubtitle = subtitle.trim().length > 0

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: uiMetrics.sectionTitleSize, fontWeight: typography.weight.sectionTitle, fontFamily: typography.family.ui }}>{title}</div>
      {hasSubtitle && (
        <div style={{ marginTop: 5, fontSize: uiMetrics.mutedFontSize, color: 'var(--text2)', lineHeight: 1.65, fontWeight: typography.weight.helper, fontFamily: typography.family.ui }}>{subtitle}</div>
      )}
    </div>
  )
}

export function StatusPill({ color, text }: { color: string; text: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: 999,
        background: color + '16',
        color,
        fontSize: 11,
        fontWeight: typography.weight.pill,
        fontFamily: typography.family.ui,
      }}
    >
      {text}
    </span>
  )
}

export function InfoRow({
  label,
  value,
  monospace,
  muted,
}: {
  label: string
  value: string
  monospace?: boolean
  muted?: boolean
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: 12, padding: '10px 0', borderTop: '1px solid var(--border)' }}>
      <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: typography.family.ui, fontWeight: typography.weight.label }}>{label}</span>
      <span
        style={{
          fontSize: uiMetrics.bodyFontSize,
          color: muted ? 'var(--text2)' : 'var(--text)',
          fontFamily: typography.family.ui,
          fontWeight: monospace ? typography.weight.path : typography.weight.body,
          wordBreak: 'break-all',
        }}
      >
        {value}
      </span>
    </div>
  )
}

export function SidebarEmpty({ text }: { text: string }) {
  return (
    <div style={{ padding: 20, border: '1px dashed var(--border2)', borderRadius: 12, color: 'var(--text3)', textAlign: 'center' }}>
      {text}
    </div>
  )
}

export function Placeholder({ text }: { text: string }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--text3)' }}>
      {text}
    </div>
  )
}

export function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div
      style={{
        margin: 20,
        padding: '12px 16px',
        border: '1px solid var(--red)',
        borderRadius: 8,
        color: 'var(--red)',
        fontSize: 12,
        background: 'rgba(192,57,43,0.06)',
      }}
    >
      ⚠ {msg}
    </div>
  )
}
