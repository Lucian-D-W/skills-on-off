import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { GithubImportMode, GithubImportPreview, PairProjectionMode } from '../../shared/importTypes'
import Btn from './Btn'
import { api } from '../api'
import { showToast } from './Toast'
import { useI18n } from '../store/I18nContext'

interface Props {
  mode: 'import' | 'project-import' | 'link'
  initialName?: string
  onClose: () => void
  onImported?: (importMode: GithubImportMode, projectionMode: PairProjectionMode) => Promise<void> | void
  onImportedToPair?: (url: string, importMode: GithubImportMode) => Promise<void> | void
  onLinked?: (url: string) => Promise<void> | void
}

export default function GithubImportModal({
  mode,
  initialName = '',
  onClose,
  onImported,
  onImportedToPair,
  onLinked,
}: Props) {
  const { t } = useI18n()
  const [url, setUrl] = useState('')
  const [name, setName] = useState(initialName)
  const [targetPath, setTargetPath] = useState('')
  const [importMode, setImportMode] = useState<GithubImportMode>(() => getDefaultImportMode(mode))
  const [projectionMode, setProjectionMode] = useState<PairProjectionMode>('directory-copy')
  const [preview, setPreview] = useState<GithubImportPreview | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!name && preview) setName(preview.suggestedName)
  }, [name, preview])

  useEffect(() => {
    setImportMode(getDefaultImportMode(mode))
  }, [mode])

  function importModeHelp(importModeValue: GithubImportMode): string {
    switch (importModeValue) {
      case 'skills-import':
        return t('skillsWhitelistHelp')
      case 'directory-copy':
        return t('wholeFolderHelp')
      case 'directory-contents-copy':
        return t('folderContentsHelp')
      case 'agent-files-copy':
        return t('agentFilesHelp')
      default:
        return importModeValue
    }
  }

  async function pickTarget() {
    const path = await api.pickFolder()
    if (path) setTargetPath(path)
  }

  async function loadPreview() {
    if (!url.trim()) {
      showToast(t('enterGithubUrlFirst'), 'error')
      return
    }
    setLoadingPreview(true)
    try {
      const result = await api.previewGithubImport(url.trim())
      setPreview(result)
      if (!name.trim()) setName(result.suggestedName)
    } catch (error) {
      showToast((error as Error).message, 'error')
    } finally {
      setLoadingPreview(false)
    }
  }

  async function submit() {
    if (!preview) {
      showToast(t('previewGithubRepoFirst'), 'error')
      return
    }

    setSubmitting(true)
    try {
      if (mode === 'import') {
        if (!name.trim() || !targetPath.trim()) {
          showToast(t('fillNameAndTargetFolder'), 'error')
          return
        }
        await api.importGithubProject(name.trim(), preview.canonicalUrl, targetPath.trim(), importMode, projectionMode)
        showToast(t('githubImportCompleted'), 'success')
        await onImported?.(importMode, projectionMode)
      } else if (mode === 'project-import') {
        await onImportedToPair?.(preview.canonicalUrl, importMode)
        showToast(t('importedToCurrentProject'), 'success')
      } else {
        await onLinked?.(preview.canonicalUrl)
        showToast(t('linkedGithubRepo'), 'success')
      }
      onClose()
    } catch (error) {
      showToast(t('operationFailed', { message: (error as Error).message }), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={labelStyle}>{t('githubRepoUrl')}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t('githubUrlPlaceholder')}
            style={{ ...inputStyle, flex: 1 }}
          />
          <Btn variant="ghost" onClick={() => void loadPreview()} disabled={loadingPreview}>
            {loadingPreview ? t('previewing') : t('preview')}
          </Btn>
        </div>
      </div>

      {mode === 'import' && (
        <>
          <div>
            <div style={labelStyle}>{t('projectName')}</div>
            <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder={t('projectNamePlaceholder')} />
          </div>
          <div>
            <div style={labelStyle}>{t('targetFolder')}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={targetPath} onChange={(e) => setTargetPath(e.target.value)} style={{ ...inputStyle, flex: 1 }} placeholder="C:\\Users\\6\\.codex\\skills" />
              <Btn variant="ghost" onClick={() => void pickTarget()}>{t('browse')}</Btn>
            </div>
          </div>
        </>
      )}

      {mode !== 'link' && (
        <div>
          <div style={labelStyle}>{t('importType')}</div>
          <select
            value={importMode}
            onChange={(e) => setImportMode(e.target.value as GithubImportMode)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="skills-import">{t('skillsWhitelistOption')}</option>
            <option value="directory-copy">{t('wholeFolderOption')}</option>
            <option value="directory-contents-copy">{t('folderContentsOption')}</option>
            <option value="agent-files-copy">{t('agentFilesOption')}</option>
          </select>
          <div style={helperStyle}>{importModeHelp(importMode)}</div>
        </div>
      )}

      {mode === 'import' && (
        <div>
          <div style={labelStyle}>{t('projectionRule')}</div>
          <select
            value={projectionMode}
            onChange={(e) => setProjectionMode(e.target.value as PairProjectionMode)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="directory-copy">{t('wholeSkillFolderProjection')}</option>
            <option value="directory-contents-copy">{t('skillContentsProjection')}</option>
          </select>
          <div style={helperStyle}>
            {projectionMode === 'directory-copy'
              ? t('projectionRuleHelpDirectory')
              : t('projectionRuleHelpContents')}
          </div>
        </div>
      )}

      {preview && (
        <div style={previewCardStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px 12px', fontSize: 12 }}>
            <span style={mutedStyle}>{t('repo')}</span>
            <span>{preview.owner}/{preview.repo}</span>
            <span style={mutedStyle}>{t('branch')}</span>
            <span>{preview.branch}</span>
            <span style={mutedStyle}>{t('subpath')}</span>
            <span>{preview.subpath || t('repoRoot')}</span>
            <span style={mutedStyle}>{t('suggestedTag')}</span>
            <span>#{preview.defaultProjectTag}</span>
            <span style={mutedStyle}>{t('canonical')}</span>
            <span style={monoStyle}>{preview.canonicalUrl}</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Btn variant="ghost" onClick={onClose}>{t('cancel')}</Btn>
        <Btn variant="primary" onClick={() => void submit()} disabled={submitting || loadingPreview}>
          {submitting
            ? t('processing')
            : mode === 'import'
              ? t('startImport')
              : mode === 'project-import'
                ? t('importToCurrentProject')
                : t('confirmLink')}
        </Btn>
      </div>
    </div>
  )
}

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text2)',
  marginBottom: 6,
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

const previewCardStyle: CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: 10,
  background: 'var(--bg2)',
  padding: 12,
}

const mutedStyle: CSSProperties = {
  color: 'var(--text3)',
}

const monoStyle: CSSProperties = {
  fontFamily: 'IBM Plex Mono, monospace',
  wordBreak: 'break-all',
}

function getDefaultImportMode(mode: Props['mode']): GithubImportMode {
  return 'skills-import'
}

const helperStyle: CSSProperties = {
  marginTop: 6,
  fontSize: 11,
  lineHeight: 1.5,
  color: 'var(--text3)',
}
