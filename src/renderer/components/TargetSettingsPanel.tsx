import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { TargetRecord } from '../../shared/importTypes'
import Btn from './Btn'
import { useI18n } from '../store/I18nContext'

interface Props {
  target: TargetRecord | null
  onSave: (next: Pick<TargetRecord, 'kind' | 'rootPath' | 'layoutVersion' | 'agentName' | 'metadataJson'>) => Promise<void> | void
}

export default function TargetSettingsPanel({ target, onSave }: Props) {
  const { t } = useI18n()
  const [form, setForm] = useState({
    kind: target?.kind ?? 'codex',
    rootPath: target?.rootPath ?? '',
    layoutVersion: target?.layoutVersion ?? '1',
    agentName: target?.agentName ?? 'codex',
    metadataJson: target?.metadataJson ?? '{}',
  })

  useEffect(() => {
    setForm({
      kind: target?.kind ?? 'codex',
      rootPath: target?.rootPath ?? '',
      layoutVersion: target?.layoutVersion ?? '1',
      agentName: target?.agentName ?? 'codex',
      metadataJson: target?.metadataJson ?? '{}',
    })
  }, [target])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
        <Field label={t('targetKind')}>
          <select
            value={form.kind}
            onChange={(e) => setForm((prev) => ({ ...prev, kind: e.target.value as TargetRecord['kind'] }))}
            style={inputStyle}
          >
            <option value="codex">codex</option>
            <option value="custom-directory">custom-directory</option>
          </select>
        </Field>
        <Field label={t('agentName')}>
          <input value={form.agentName} onChange={(e) => setForm((prev) => ({ ...prev, agentName: e.target.value }))} style={inputStyle} />
        </Field>
      </div>
      <Field label={t('rootPath')}>
        <input value={form.rootPath} readOnly style={{ ...inputStyle, opacity: 0.72 }} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 12 }}>
        <Field label={t('layoutVersion')}>
          <input value={form.layoutVersion} onChange={(e) => setForm((prev) => ({ ...prev, layoutVersion: e.target.value }))} style={inputStyle} />
        </Field>
        <Field label={t('metadataJson')}>
          <input value={form.metadataJson} onChange={(e) => setForm((prev) => ({ ...prev, metadataJson: e.target.value }))} style={inputStyle} />
        </Field>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Btn variant="primary" onClick={() => void onSave(form)}>{t('saveTarget')}</Btn>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  )
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  color: 'var(--text)',
  fontSize: 12,
  fontFamily: 'IBM Plex Mono, monospace',
}
