import { ReactNode } from 'react'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
  width?: number
}

export default function Modal({ title, onClose, children, width = 500 }: Props) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(2px)',
      }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        width,
        maxWidth: '92vw',
        maxHeight: '88vh',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.01em' }}>{title}</span>
          <button onClick={onClose} style={{
            color: 'var(--text3)', fontSize: 20, lineHeight: 1,
            width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 6,
          }}>×</button>
        </div>
        <div style={{ padding: '20px', overflow: 'auto' }}>{children}</div>
      </div>
    </div>
  )
}
