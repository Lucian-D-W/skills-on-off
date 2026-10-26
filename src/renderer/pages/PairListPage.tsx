import { useState, useEffect, useCallback } from 'react'
import type { Pair } from '../../shared/types'
import type { PairProjectionMode } from '../../shared/importTypes'
import { api } from '../api'
import Btn from '../components/Btn'
import LanguagePicker from '../components/LanguagePicker'
import Modal from '../components/Modal'
import GithubImportModal from '../components/GithubImportModal'
import ThemePicker from '../components/ThemePicker'
import { showToast } from '../components/Toast'
import { useI18n } from '../store/I18nContext'
import { typography } from '../styles/typography'
import { uiMetrics } from '../styles/uiMetrics'

interface Props { onSelect: (pair: Pair) => void }
interface FormState {
  name: string
  sourcePath: string
  targetPath: string
  projectionMode: PairProjectionMode
}
const emptyForm: FormState = {
  name: '',
  sourcePath: '',
  targetPath: '',
  projectionMode: 'directory-copy',
}

export default function PairListPage({ onSelect }: Props) {
  const { t } = useI18n()
  const [pairs, setPairs] = useState<Pair[]>([])
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editId, setEditId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    try {
      setPairs(await api.listPairs())
    } catch (error) {
      showToast(t('loadPairsFailed', { message: (error as Error).message }), 'error')
      setPairs([])
    }
  }, [t])
  useEffect(() => { load() }, [load])

  function openCreate() { setForm(emptyForm); setEditId(null); setModal('create') }
  function openEdit(p: Pair) {
    setForm({ name: p.name, sourcePath: p.sourcePath, targetPath: p.targetPath, projectionMode: p.projectionMode })
    setEditId(p.id); setModal('edit')
  }
  async function pickFolder(f: 'sourcePath' | 'targetPath') {
    const p = await api.pickFolder()
    if (p) setForm((prev) => ({ ...prev, [f]: p }))
  }
  async function handleSubmit() {
    const { name, sourcePath, targetPath, projectionMode } = form
    if (!name.trim() || !sourcePath.trim() || !targetPath.trim()) {
      showToast(t('fillAllFields'), 'error'); return
    }
    setSubmitting(true)
    try {
      if (modal === 'create') {
        await api.createPair(name.trim(), sourcePath.trim(), targetPath.trim(), projectionMode)
        showToast(t('pairCreated'), 'success')
      } else if (editId !== null) {
        await api.updatePair(editId, name.trim(), sourcePath.trim(), targetPath.trim(), projectionMode)
        showToast(t('pairUpdated'), 'success')
      }
      setModal(null); await load()
    } catch (e: unknown) {
      showToast(t('operationFailed', { message: (e as Error).message }), 'error')
    } finally { setSubmitting(false) }
  }
  async function handleDelete(p: Pair) {
    if (!confirm(t('deletePairConfirm', { name: p.name }))) return
    await api.deletePair(p.id)
    showToast(t('deleted'), 'success'); await load()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* ── header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px', height: 60,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        boxShadow: '0 1px 0 var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* logo mark */}
          <div style={{
            width: 30, height: 30, borderRadius: 10,
            background: 'var(--accent)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: 'var(--accent-contrast)', fontSize: 15, fontWeight: typography.weight.appTitle, fontFamily: typography.family.ui }}>S</span>
          </div>
          <span style={{ fontWeight: typography.weight.appTitle, fontSize: 16, letterSpacing: '0.01em', fontFamily: typography.family.ui }}>
            skills on-off
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LanguagePicker />
          <ThemePicker />
          <Btn small variant="ghost" onClick={() => setImportOpen(true)}>{t('githubImport')}</Btn>
          <Btn small variant="primary" onClick={openCreate}>{t('newPair')}</Btn>
        </div>
      </div>

      {/* ── body ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
        {pairs.length === 0 ? (
          <Empty onNew={openCreate} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 980 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr 2fr auto',
              gap: '0 12px',
              padding: '6px 18px 10px',
              fontSize: 11, fontWeight: typography.weight.label,
              letterSpacing: '0.04em',
              color: 'var(--text2)',
              fontFamily: typography.family.ui,
            }}>
              <span>{t('pairName')}</span>
              <span>{t('sourcePath')}</span>
              <span>{t('targetPath')}</span>
              <span />
            </div>
            {pairs.map((p) => <PairRow key={p.id} pair={p} onOpen={() => onSelect(p)} onEdit={() => openEdit(p)} onDelete={() => handleDelete(p)} />)}
          </div>
        )}
      </div>

      {modal && (
        <Modal title={modal === 'create' ? t('createPair') : t('editPair')} onClose={() => setModal(null)}>
          <PairForm form={form} onChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))}
            onPickSource={() => pickFolder('sourcePath')}
            onPickTarget={() => pickFolder('targetPath')}
            onSubmit={handleSubmit} onCancel={() => setModal(null)} submitting={submitting} />
        </Modal>
      )}

      {importOpen && (
        <Modal title={t('githubImport')} onClose={() => setImportOpen(false)} width={720}>
          <GithubImportModal
            mode="import"
            onClose={() => setImportOpen(false)}
            onImported={async () => {
              await load()
            }}
          />
        </Modal>
      )}
    </div>
  )
}

/* ── PairRow ── */
function PairRow({ pair, onOpen, onEdit, onDelete }: {
  pair: Pair; onOpen: () => void; onEdit: () => void; onDelete: () => void
}) {
  const { t } = useI18n()
  const [hov, setHov] = useState(false)
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr 2fr auto',
        gap: '0 12px',
        alignItems: 'center',
        padding: `${uiMetrics.listRowPaddingY}px ${uiMetrics.listRowPaddingX}px`,
        background: hov ? 'var(--bg2)' : 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        cursor: 'pointer',
        transition: 'background 0.15s, box-shadow 0.15s, border-color 0.15s',
        boxShadow: hov ? '0 4px 14px rgba(83, 70, 59, 0.10)' : 'var(--shadow)',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onOpen}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'var(--bg3)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 17, flexShrink: 0,
        }}>🤖</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ fontWeight: typography.weight.listItemTitle, fontSize: uiMetrics.listTitleSize, fontFamily: typography.family.ui }}>{pair.name}</span>
          <span style={{
            fontSize: uiMetrics.pillFontSize,
            padding: '4px 8px',
            borderRadius: 999,
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            color: 'var(--text2)',
            whiteSpace: 'nowrap',
            fontWeight: typography.weight.pill,
            fontFamily: typography.family.ui,
          }}>
            {pair.projectionMode === 'directory-copy' ? t('wholeSkill') : t('skillContents')}
          </span>
        </div>
      </div>
      <span style={{
        fontSize: 12, color: 'var(--text2)',
        fontFamily: typography.family.ui,
        fontWeight: typography.weight.path,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{pair.sourcePath}</span>
      <span style={{
        fontSize: 12, color: 'var(--text2)',
        fontFamily: typography.family.ui,
        fontWeight: typography.weight.path,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{pair.targetPath}</span>
      <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
        <Btn small variant="ghost" onClick={onEdit}>{t('edit')}</Btn>
        <Btn small variant="danger" onClick={onDelete}>{t('delete')}</Btn>
      </div>
    </div>
  )
}

/* ── Empty ── */
function Empty({ onNew }: { onNew: () => void }) {
  const { t } = useI18n()
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: 300, gap: 14,
      color: 'var(--text3)',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        border: '2px dashed var(--border2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28,
      }}>📂</div>
      <div style={{ fontSize: 16, fontWeight: typography.weight.cardTitle, color: 'var(--text)', fontFamily: typography.family.ui }}>{t('noPairs')}</div>
      <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: typography.weight.body, fontFamily: typography.family.ui }}>{t('pairEmptyHint')}</div>
      <Btn variant="primary" onClick={onNew}>{t('createFirstPair')}</Btn>
    </div>
  )
}

/* ── PairForm ── */
function PairForm({ form, onChange, onPickSource, onPickTarget, onSubmit, onCancel, submitting }: {
  form: FormState
  onChange: (k: keyof FormState, v: string) => void
  onPickSource: () => void
  onPickTarget: () => void
  onSubmit: () => void
  onCancel: () => void
  submitting: boolean
}) {
  const { t } = useI18n()
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: 12, fontWeight: typography.weight.label,
    color: 'var(--text2)', marginBottom: 6,
    fontFamily: typography.family.ui,
  }
  const inp: React.CSSProperties = {
    width: '100%', minHeight: uiMetrics.controlHeight + 4, padding: '10px 12px',
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 10, color: 'var(--text)',
    fontSize: 13, fontFamily: typography.family.ui, fontWeight: typography.weight.body,
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <span style={lbl}>{t('pairName')}</span>
        <input style={inp} value={form.name} autoFocus
          onChange={(e) => onChange('name', e.target.value)} placeholder="Claude Code" />
      </div>
      <div>
        <span style={lbl}>{t('projectionRule')}</span>
        <select
          style={{ ...inp, cursor: 'pointer' }}
          value={form.projectionMode}
          onChange={(e) => onChange('projectionMode', e.target.value)}
        >
          <option value="directory-copy">{t('wholeSkillFolderProjection')}</option>
          <option value="directory-contents-copy">{t('skillContentsProjection')}</option>
        </select>
      </div>
      <div>
        <span style={lbl}>{t('sourcePathLabel')}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <input style={{ ...inp, flex: 1 }} value={form.sourcePath}
            onChange={(e) => onChange('sourcePath', e.target.value)} placeholder="C:\path\to\skills-repo" />
          <Btn small variant="ghost" onClick={onPickSource}>{t('browse')}</Btn>
        </div>
      </div>
      <div>
        <span style={lbl}>{t('targetPathLabel')}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <input style={{ ...inp, flex: 1 }} value={form.targetPath}
            onChange={(e) => onChange('targetPath', e.target.value)} placeholder="C:\path\to\agent-skills" />
          <Btn small variant="ghost" onClick={onPickTarget}>{t('browse')}</Btn>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
        <Btn variant="ghost" onClick={onCancel}>{t('cancel')}</Btn>
        <Btn variant="primary" onClick={onSubmit} disabled={submitting}>
          {submitting ? t('processing') : t('confirm')}
        </Btn>
      </div>
    </div>
  )
}
