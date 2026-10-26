import { CSSProperties } from 'react'
import { useI18n } from '../store/I18nContext'

interface Props {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}

export default function Toggle({ checked, onChange, disabled }: Props) {
  const { t } = useI18n()
  return (
    <span
      onClick={() => !disabled && onChange(!checked)}
      title={checked ? t('toggleOff') : t('toggleOn')}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        width: 46,
        height: 24,
        borderRadius: 12,
        border: '1.5px solid ' + (checked ? 'var(--accent)' : 'var(--border2)'),
        background: checked ? 'var(--accent)' : 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.3 : 1,
        flexShrink: 0,
        transition: 'all 0.18s',
        position: 'relative',
      } as CSSProperties}
    >
      <span style={{
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: checked ? 'var(--accent-contrast)' : 'var(--border2)',
        left: checked ? 25 : 4,
        transition: 'left 0.18s, background 0.18s',
      }} />
    </span>
  )
}
