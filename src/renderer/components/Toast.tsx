import { useEffect, useState, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'info'
export interface ToastMsg { id: number; text: string; type: ToastType }

let _set: ((fn: (p: ToastMsg[]) => ToastMsg[]) => void) | null = null
let _n = 0

export function showToast(text: string, type: ToastType = 'info') {
  if (!_set) return
  const id = ++_n
  _set((p) => [...p, { id, text, type }])
  setTimeout(() => _set?.((p) => p.filter((t) => t.id !== id)), 2800)
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMsg[]>([])
  const stable = useCallback(setToasts, [])
  useEffect(() => { _set = stable; return () => { _set = null } }, [stable])

  const icon: Record<ToastType, string> = { success: '✓', error: '✕', info: '·' }
  const clr: Record<ToastType, string> = {
    success: 'var(--green)',
    error: 'var(--red)',
    info: 'var(--text2)',
  }

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      display: 'flex', flexDirection: 'column', gap: 8,
      zIndex: 9999, pointerEvents: 'none',
    }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '9px 14px',
          boxShadow: 'var(--shadow)',
          fontSize: 12,
          color: 'var(--text)',
          animation: 'toastIn 0.18s ease',
          minWidth: 200,
        }}>
          <span style={{ color: clr[t.type], fontWeight: 700, fontSize: 14 }}>{icon[t.type]}</span>
          {t.text}
        </div>
      ))}
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}
