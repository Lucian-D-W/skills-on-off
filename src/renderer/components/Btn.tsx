import { CSSProperties, ReactNode, MouseEvent } from 'react'
import { uiMetrics } from '../styles/uiMetrics'
import { typography } from '../styles/typography'

type Variant = 'primary' | 'danger' | 'ghost' | 'subtle'

interface Props {
  variant?: Variant
  children: ReactNode
  onClick?: (e: MouseEvent) => void
  disabled?: boolean
  style?: CSSProperties
  small?: boolean
}

export default function Btn({ variant = 'ghost', children, onClick, disabled, style, small }: Props) {
  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    border: '1px solid',
    borderRadius: 10,
    fontFamily: typography.family.ui,
    fontWeight: typography.weight.button,
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
    transition: 'opacity 0.15s, background 0.15s, box-shadow 0.15s',
    padding: small ? '6px 12px' : '8px 16px',
    minHeight: small ? uiMetrics.controlHeight : uiMetrics.controlHeight + 4,
    fontSize: small ? 12 : 13,
    opacity: disabled ? 0.38 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
  }

  const variants: Record<Variant, CSSProperties> = {
    primary: {
      background: 'var(--accent)',
      color: 'var(--accent-contrast)',
      borderColor: 'var(--accent)',
    },
    danger: {
      background: 'transparent',
      color: 'var(--red)',
      borderColor: 'var(--red)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text2)',
      borderColor: 'var(--border2)',
    },
    subtle: {
      background: 'var(--bg3)',
      color: 'var(--text2)',
      borderColor: 'var(--border)',
    },
  }

  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  )
}
