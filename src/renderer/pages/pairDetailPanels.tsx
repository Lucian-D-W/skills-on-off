import { useState } from 'react'
import type { InstallRecord, ProjectLinkRecord, ProjectSyncReport, SourceRecord, TargetRecord } from '../../shared/importTypes'
import type { Pair, SkillItem, SkillTargetPromotionStatus } from '../../shared/types'
import Btn from '../components/Btn'
import Toggle from '../components/Toggle'
import { useI18n } from '../store/I18nContext'
import type { MessageKey } from '../store/i18nMessages'
import { typography } from '../styles/typography'
import { uiMetrics } from '../styles/uiMetrics'
import { TagFieldEditor } from './pairDetailEditors'
import {
  copyModeLabel,
  formatEpochLabel,
  healthStateLabel,
  installModeLabel,
  managedEntriesPreview,
  managementStateLabel,
  parseManagedEntriesJson,
  parseTags,
  shortCommit,
  sourceRootKindLabel,
  updateStateLabel,
  type DetailForm,
} from './pairDetailModel'
import { InfoRow, SectionTitle, StatusPill } from './pairDetailPrimitives'
import { detailCardStyle, detailTextareaStyle } from './pairDetailStyles'

export function SkillDetailPanel({
  skill,
  pair,
  projectLink,
  linkedSource,
  installRecord,
  targets,
  projectSync,
  projectSyncBusy,
  toggling,
  onToggle,
  onSave,
  onOpenLinkGithub,
  onOpenTargetSettings,
  onCheckProjectSync,
  onUpdateProjectSync,
  onRepairProjectSync,
  onRemoveManagement,
  removeManagementBusy,
  promotionStatus,
  promotionBusy,
  onPromoteToMainRepo,
  isRealGstackLink,
}: {
  skill: SkillItem
  pair: Pair
  projectLink: ProjectLinkRecord | null
  linkedSource: SourceRecord | null
  installRecord: InstallRecord | null
  targets: TargetRecord[]
  projectSync: ProjectSyncReport | null
  projectSyncBusy: 'check' | 'update' | 'repair' | null
  toggling: boolean
  onToggle: () => void
  onSave: (form: DetailForm) => void
  onOpenLinkGithub: () => void
  onOpenTargetSettings: () => void
  onCheckProjectSync: (projectTag?: string) => void
  onUpdateProjectSync: (projectTag?: string) => void
  onRepairProjectSync: (projectTag?: string) => void
  onRemoveManagement: (() => void) | null
  removeManagementBusy: boolean
  promotionStatus: SkillTargetPromotionStatus | null
  promotionBusy: boolean
  onPromoteToMainRepo: () => void
  isRealGstackLink: boolean
}) {
  const { t, locale } = useI18n()
  const skillDetailHint = t('skillDetailHint')
  const [form, setForm] = useState<DetailForm>({
    note: skill.meta?.note ?? '',
    projectTags: skill.meta?.projectTags ?? '',
    funcTags: skill.meta?.funcTags ?? '',
    customTags: skill.meta?.customTags ?? '',
  })

  const allTags = [
    ...parseTags(form.projectTags),
    ...parseTags(form.funcTags),
    ...parseTags(form.customTags),
  ]
  const managedEntries = installRecord ? parseManagedEntriesJson(installRecord.managedEntriesJson) : []
  const lastTargetPromotedAt = promotionStatus?.lastTargetPromotedAt ?? skill.meta?.lastTargetPromotedAt ?? 0
  const targetMainRepoStatus = promotionStatus
    ? promotionStatus.unsupportedReason
      ? t('targetPromotionUnsupported')
      : !promotionStatus.targetExists
        ? t('targetMissingForPromotion')
        : promotionStatus.targetDiffersFromSource
          ? t('targetDiffersFromMainRepo')
          : t('targetMatchesMainRepo')
    : t('notRunYet')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 920 }}>
      <section style={detailCardStyle}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: uiMetrics.pageTitleSize, lineHeight: 1.08, fontWeight: typography.weight.pageTitle, fontFamily: typography.family.ui }}>{skill.name}</h2>
              {skill.orphan && <StatusPill color="var(--red)" text={t('sourceMissingTargetExists')} />}
              {!skill.orphan && (
                <StatusPill color={skill.enabled ? 'var(--green)' : 'var(--text3)'} text={skill.enabled ? t('active') : t('inactive')} />
              )}
            </div>
            {skillDetailHint.trim().length > 0 && (
              <p style={{ marginTop: 10, fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>
                {skillDetailHint}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {(skill.orphan || promotionStatus?.targetDiffersFromSource || promotionBusy) && (
              <Btn small variant={skill.orphan ? 'primary' : 'ghost'} onClick={onPromoteToMainRepo} disabled={promotionBusy || !promotionStatus?.canPromote}>
                {promotionBusy ? t('updatingToMainRepo') : skill.orphan ? t('collectToSource') : t('updateToMainRepo')}
              </Btn>
            )}
            <Toggle checked={skill.enabled} onChange={onToggle} disabled={toggling || skill.orphan} />
          </div>
        </div>
      </section>

      <section style={detailCardStyle}>
        <SectionTitle title={t('noteTitle')} subtitle={t('noteSubtitle')} />
        <textarea
          value={form.note}
          onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
          placeholder={t('notePlaceholder')}
          rows={4}
          style={detailTextareaStyle}
        />
      </section>

      <section style={detailCardStyle}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12 }}>{t('tagsTitle')}</div>
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
        <SectionTitle title={t('pathAndStatusTitle')} subtitle={t('pathAndStatusSubtitle')} />
        <InfoRow label={t('sourceRepo')} value={pair.sourcePath} monospace />
        <InfoRow label={t('targetDirectory')} value={pair.targetPath} monospace />
        <InfoRow label={t('skillStatus')} value={pairStateText(skill, t)} muted />
        <InfoRow label={t('targetMainRepoStatus')} value={targetMainRepoStatus} muted={!promotionStatus || !!promotionStatus.unsupportedReason} />
        <InfoRow label={t('lastUpdatedToMainRepo')} value={formatEpochLabel(lastTargetPromotedAt, locale, t('neverUpdatedToMainRepo'))} muted={!lastTargetPromotedAt} />
        <InfoRow label={t('tagCount')} value={`${allTags.length}`} />
      </section>

      <details style={detailCardStyle}>
        <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
          {t('installLedgerTitle')}
          <span style={{ marginLeft: 12, fontSize: 12, color: 'var(--text3)', fontWeight: 400 }}>
            {installRecord ? `${installRecord.projectTag || skill.name} · ${copyModeLabel(installRecord.copyMode, t)}` : t('sourceNotRecorded')}
          </span>
        </summary>
        <div style={{ marginTop: 12 }}>
        <InfoRow label={t('ledgerStatus')} value={installRecord ? t('ledgerCreated') : t('ledgerMissing')} muted={!installRecord} />
        {installRecord ? (
          <>
            <InfoRow label={t('projectTagLabel')} value={`#${installRecord.projectTag}`} muted={!installRecord.projectTag} />
            <InfoRow label={t('managementStatus')} value={managementStateLabel(installRecord.managementState, t)} muted={installRecord.managementState !== 'managed'} />
            <InfoRow label={t('installMode')} value={installModeLabel(installRecord.installMode, t)} />
            <InfoRow label={t('copyMode')} value={copyModeLabel(installRecord.copyMode, t)} />
            <InfoRow label={t('sourceShape')} value={sourceRootKindLabel(installRecord.sourceRootKind, t)} />
            <InfoRow label={t('sourceRelativePath')} value={installRecord.sourceRelativePath} monospace />
            <InfoRow label={t('finalInstallName')} value={installRecord.installedAs} monospace />
            <InfoRow
              label={t('rootWrap')}
              value={installRecord.isRootSkillWrapped ? t('wrappedYes') : t('wrappedNo')}
              muted={!installRecord.isRootSkillWrapped}
            />
            <InfoRow label={t('installReason')} value={installRecord.installReason} />
            {managedEntries.length > 0 && (
              <>
                <InfoRow label={t('customManagedCount')} value={`${managedEntries.length}`} />
                <InfoRow label={t('customManagedPreview')} value={managedEntriesPreview(managedEntries, t)} muted />
              </>
            )}
          </>
        ) : (
          <InfoRow
            label={t('hint')}
            value={t('noImportRecordHint')}
            muted
          />
        )}
        </div>
      </details>

      <section style={detailCardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{t('projectSourceAndTarget')}</div>
            <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text2)', overflowWrap: 'anywhere' }}>
              {projectLink ? (
                <>
                  {linkedSource ? `${linkedSource.owner}/${linkedSource.repo}` : projectLink.projectTag}
                  <span style={{ marginLeft: 10, color: 'var(--text3)' }}>
                    {projectSync ? updateStateLabel(projectSync.updateState, t) : t('linked')}
                  </span>
                </>
              ) : t('unlinked')}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {projectLink ? (
              <>
                <Btn small variant="ghost" onClick={() => onCheckProjectSync(projectLink.projectTag)} disabled={projectSyncBusy !== null}>
                  {projectSyncBusy === 'check' ? t('checking') : t('checkUpdates')}
                </Btn>
                {(projectSync?.updateState === 'update-available' || projectSync?.updateState === 'not-synced' || projectSyncBusy === 'update') && (
                  <Btn small variant="primary" onClick={() => onUpdateProjectSync(projectLink.projectTag)} disabled={projectSyncBusy !== null}>
                    {projectSyncBusy === 'update' ? t('updating') : t('updateAndSync')}
                  </Btn>
                )}
              </>
            ) : <Btn small variant="ghost" onClick={onOpenLinkGithub}>{t('linkGithubRepo')}</Btn>}
            <details style={{ position: 'relative' }} onClick={(event) => {
              if ((event.target as HTMLElement).closest('button')) event.currentTarget.removeAttribute('open')
            }}>
              <summary style={{ cursor: 'pointer', listStyle: 'none', padding: '6px 8px', fontSize: 12 }}>{t('moreActions')} ⋯</summary>
              <div style={{ position: 'absolute', right: 0, top: '100%', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 6, minWidth: 190, padding: 8, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--surface)', boxShadow: 'var(--shadow)' }}>
                <Btn small variant="ghost" onClick={onOpenTargetSettings}>{t('targetSettings')}</Btn>
                {projectLink && <Btn small variant="ghost" onClick={onOpenLinkGithub}>{t('relinkGithub')}</Btn>}
                {projectLink && projectSync?.healthState === 'repair-needed' && (
                  <Btn small variant="ghost" onClick={() => onRepairProjectSync(projectLink.projectTag)} disabled={projectSyncBusy !== null}>
                    {projectSyncBusy === 'repair' ? t('repairing') : t('repairSync')}
                  </Btn>
                )}
              </div>
            </details>
          </div>
        </div>
        {projectSync?.error && <div role="alert" style={{ marginTop: 10, fontSize: 12, color: 'var(--red)' }}>{projectSync.error}</div>}
        <details style={{ marginTop: 14 }}>
          <summary style={{ cursor: 'pointer', fontSize: 11, color: 'var(--text3)' }}>{t('technicalDetails')}</summary>
          <div style={{ marginTop: 8 }}>
            {linkedSource?.canonicalUrl && <InfoRow label={t('canonicalUrl')} value={linkedSource.canonicalUrl} monospace />}
            {projectSync && (
              <>
                <InfoRow label={t('syncHealth')} value={healthStateLabel(projectSync.healthState, t)} />
                {!!projectSync.checkedAt && <InfoRow label={t('lastChecked')} value={formatEpochLabel(projectSync.checkedAt, locale, '')} />}
                {!!projectSync.syncedAt && <InfoRow label={t('lastSynced')} value={formatEpochLabel(projectSync.syncedAt, locale, '')} />}
                {projectSync.localCommitSha && <InfoRow label={t('localVersion')} value={shortCommit(projectSync.localCommitSha, '')} monospace />}
                {projectSync.remoteCommitSha && <InfoRow label={t('remoteVersion')} value={shortCommit(projectSync.remoteCommitSha, '')} monospace />}
              </>
            )}
            {targets[0] && <InfoRow label={t('primaryTarget')} value={targets[0].rootPath} monospace />}
            {isRealGstackLink && <InfoRow label={t('realValidation')} value={t('gstackValidationHint')} />}
          </div>
        </details>
      </section>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        {installRecord?.managementState === 'managed' && onRemoveManagement && (
          <Btn variant="danger" onClick={onRemoveManagement} disabled={removeManagementBusy}>
            {removeManagementBusy ? t('removing') : t('removeManagement')}
          </Btn>
        )}
        <Btn
          variant="ghost"
          onClick={() =>
            setForm({
              note: skill.meta?.note ?? '',
              projectTags: skill.meta?.projectTags ?? '',
              funcTags: skill.meta?.funcTags ?? '',
              customTags: skill.meta?.customTags ?? '',
            })
          }
        >
          {t('restore')}
        </Btn>
        <Btn variant="primary" onClick={() => onSave(form)}>
          {t('saveChanges')}
        </Btn>
      </div>
    </div>
  )
}

function pairStateText(skill: SkillItem, t: (key: MessageKey) => string): string {
  if (skill.orphan) return t('abnormalState')
  return skill.enabled ? t('syncedToTarget') : t('notSyncedToTarget')
}
