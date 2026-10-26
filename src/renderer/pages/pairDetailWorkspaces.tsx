import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { InstallRecord, ProjectLinkRecord, ProjectSyncReport, SourceRecord, TargetRecord } from '../../shared/importTypes'
import type { Pair, SkillItem, SkillTargetPromotionStatus } from '../../shared/types'
import Btn from '../components/Btn'
import Modal from '../components/Modal'
import Toggle from '../components/Toggle'
import { useI18n } from '../store/I18nContext'
import { getDesyncableGroupSkills, getSyncableGroupSkills } from './pairDetailGroupSync'
import { GroupDetailWorkspace } from './pairDetailGroupWorkspace'
import {
  groupState,
  tagFieldLabel,
  type BatchAction,
  type DetailForm,
  type TagField,
} from './pairDetailModel'
import { TagChip } from './pairDetailPrimitives'
import { searchInputStyle } from './pairDetailStyles'
import { UncategorizedTable } from './pairDetailUncategorizedTable'
import { resolveManagedProjectTagForSkills } from './groupRename'

export function CategoryTabWorkspace({
  pair,
  field,
  search,
  onSearch,
  visibleCount,
  totalCount,
  groupedEntries,
  uncategorizedSkills,
  selectedNames,
  toggling,
  selectedSkills,
  onToggleSkill,
  onToggleSelected,
  onClearSelection,
  onBatchApply,
  onApplyAllBatch,
  onInlineSave,
  onSaveDetail,
  projectLinks,
  sources,
  targets,
  installRecords,
  projectSync,
  projectSyncBusy,
  onOpenProjectImport,
  onOpenGroupLink,
  onOpenLinkGithub,
  onOpenTargetSettings,
  onCheckProjectSync,
  onUpdateProjectSync,
  onRepairProjectSync,
  onRemoveManagedSkill,
  onRemoveManagedGroup,
  onRenameGroupTag,
  activePromotionStatusBySkill,
  activePromotionBusyNames,
  onEnsurePromotionStatus,
  onPromoteSkillToMainRepo,
  removalBusyKeys,
  onSyncGroup,
}: {
  pair: Pair
  field: TagField
  search: string
  onSearch: (value: string) => void
  visibleCount: number
  totalCount: number
  groupedEntries: Array<[string, SkillItem[]]>
  uncategorizedSkills: SkillItem[]
  selectedNames: Set<string>
  toggling: Set<string>
  selectedSkills: SkillItem[]
  onToggleSkill: (skill: SkillItem) => Promise<void>
  onToggleSelected: (name: string) => void
  onClearSelection: () => void
  onBatchApply: (action: BatchAction, form: string) => void
  onApplyAllBatch: (action: BatchAction, form: Pick<DetailForm, TagField>) => void
  onInlineSave: (skill: SkillItem, value: string) => void
  onSaveDetail: (skillName: string, form: DetailForm) => void
  projectLinks: ProjectLinkRecord[]
  sources: SourceRecord[]
  targets: TargetRecord[]
  installRecords: InstallRecord[]
  projectSync: ProjectSyncReport | null
  projectSyncBusy: 'check' | 'update' | 'repair' | null
  onOpenProjectImport: () => void
  onOpenGroupLink: (groupName: string, projectTag: string, skills: SkillItem[]) => void
  onOpenLinkGithub: () => void
  onOpenTargetSettings: () => void
  onCheckProjectSync: (projectTag?: string) => void
  onUpdateProjectSync: (projectTag?: string) => void
  onRepairProjectSync: (projectTag?: string) => void
  onRemoveManagedSkill: (skill: SkillItem, installRecord: InstallRecord | null) => Promise<boolean>
  onRemoveManagedGroup: (projectTag: string, skillCount: number) => Promise<boolean>
  onRenameGroupTag: (field: TagField, oldTag: string, groupSkills: SkillItem[], rawInput: string) => Promise<string | null>
  activePromotionStatusBySkill: Record<string, SkillTargetPromotionStatus>
  activePromotionBusyNames: Set<string>
  onEnsurePromotionStatus: (skillName: string) => void
  onPromoteSkillToMainRepo: (skill: SkillItem) => void
  removalBusyKeys: Set<string>
  onSyncGroup: (groupName: string, skills: SkillItem[], nextChecked: boolean) => void
}) {
  const { t } = useI18n()
  const fieldLabel = tagFieldLabel(field, t)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const selectedGroupSkills = groupedEntries.find(([groupName]) => groupName === selectedGroup)?.[1] ?? []
  const installRecordLookup = new Map(installRecords.map((record) => [record.skillName, record]))
  const supportsManagedProjectLink =
    field === 'projectTags' || (field === 'customTags' && pair.projectionMode === 'directory-contents-copy')
  const selectedGroupManagedProjectTag =
    selectedGroup && supportsManagedProjectLink
      ? resolveManagedProjectTagForSkills(selectedGroupSkills, installRecordLookup)
      : null
  const effectiveGroupProjectTag =
    selectedGroup && supportsManagedProjectLink ? selectedGroupManagedProjectTag ?? selectedGroup : null
  const selectedGroupProjectLink = effectiveGroupProjectTag
    ? projectLinks.find((link) => link.projectTag === effectiveGroupProjectTag) ?? null
    : null
  const selectedGroupManagedInstallRecords = installRecords.filter(
    (record) =>
      (!!effectiveGroupProjectTag && record.projectTag === effectiveGroupProjectTag) &&
      record.managementState === 'managed'
  )
  const selectedGroupInstallRecordMap = new Map(
    installRecords
      .filter((record) => !effectiveGroupProjectTag || record.projectTag === effectiveGroupProjectTag)
      .map((record) => [record.skillName, record])
  )
  const selectedGroupLinkedSource = selectedGroupProjectLink
    ? sources.find((source) => source.id === selectedGroupProjectLink.sourceId) ?? null
    : null

  useEffect(() => {
    if (selectedGroup && !groupedEntries.some(([groupName]) => groupName === selectedGroup)) {
      setSelectedGroup(null)
    }
  }, [groupedEntries, selectedGroup])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t('searchSkillsNotesTags')}
            style={{ ...searchInputStyle, maxWidth: 420 }}
          />
          {(field === 'projectTags' || (field === 'customTags' && pair.projectionMode === 'directory-contents-copy')) && (
            <Btn small variant="ghost" onClick={onOpenProjectImport}>
              {t('importProject')}
            </Btn>
          )}
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text3)' }}>
            {visibleCount} / {totalCount}
          </span>
        </div>
        <CategoryBatchBar
          field={field}
          skills={selectedSkills}
          onApply={onBatchApply}
          onClearSelection={onClearSelection}
        />
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {groupedEntries.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700 }}>{t('categoryGroups', { category: fieldLabel })}</h3>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>{t('countGroups', { count: groupedEntries.length })}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
              {groupedEntries.map(([groupName, skills]) => (
                <CategoryGroupCard
                  key={`${field}-${groupName}`}
                  groupName={groupName}
                  skills={skills}
                  onOpenGroup={() => setSelectedGroup(groupName)}
                  onSyncGroup={(nextChecked) => onSyncGroup(groupName, skills, nextChecked)}
                  syncing={skills.some((skill) => toggling.has(skill.name))}
                />
              ))}
            </div>
          </section>
        )}

        <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700 }}>{t('uncategorized')}</h3>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>{t('skillCount', { count: uncategorizedSkills.length })}</span>
          </div>
          <UncategorizedTable
            field={field}
            skills={uncategorizedSkills}
            selectedNames={selectedNames}
            onToggleSelected={onToggleSelected}
            onInlineSave={onInlineSave}
          />
        </section>
      </div>

      {selectedGroup && (
        <Modal title={t('groupDetails', { groupName: selectedGroup })} onClose={() => setSelectedGroup(null)} width={1380}>
          <GroupDetailWorkspace
            pair={pair}
            groupName={selectedGroup}
            skills={selectedGroupSkills}
            selectedNames={selectedNames}
            toggling={toggling}
            onToggleSkill={onToggleSkill}
            onToggleSelected={onToggleSelected}
            onClearSelection={onClearSelection}
            onApplyBatch={onApplyAllBatch}
            onSaveDetail={onSaveDetail}
            projectLink={selectedGroupProjectLink}
            linkedSource={selectedGroupLinkedSource}
            installRecordMap={selectedGroupInstallRecordMap}
            targets={targets}
            onOpenLinkGithub={() => onOpenGroupLink(selectedGroup, effectiveGroupProjectTag ?? selectedGroup, selectedGroupSkills)}
            onOpenTargetSettings={onOpenTargetSettings}
            projectSync={projectSync}
            projectSyncBusy={projectSyncBusy}
            onCheckProjectSync={() => onCheckProjectSync(effectiveGroupProjectTag ?? undefined)}
            onUpdateProjectSync={() => onUpdateProjectSync(effectiveGroupProjectTag ?? undefined)}
            onRepairProjectSync={() => onRepairProjectSync(effectiveGroupProjectTag ?? undefined)}
            onRemoveManagedSkill={onRemoveManagedSkill}
            onRemoveManagedGroup={
              effectiveGroupProjectTag
                ? async () => {
                    const removed = await onRemoveManagedGroup(effectiveGroupProjectTag, selectedGroupManagedInstallRecords.length)
                    if (removed) setSelectedGroup(null)
                  }
                : null
            }
            removeManagedGroupDisabled={
              !effectiveGroupProjectTag ||
              !selectedGroupProjectLink ||
              selectedGroupManagedInstallRecords.length === 0 ||
              removalBusyKeys.has(`group:${effectiveGroupProjectTag}`)
            }
            onRenameGroup={async (rawInput) => {
              const renamedTo = await onRenameGroupTag(field, selectedGroup, selectedGroupSkills, rawInput)
              if (renamedTo) setSelectedGroup(renamedTo)
              return renamedTo
            }}
            activePromotionStatusBySkill={activePromotionStatusBySkill}
            activePromotionBusyNames={activePromotionBusyNames}
            onEnsurePromotionStatus={onEnsurePromotionStatus}
            onPromoteSkillToMainRepo={onPromoteSkillToMainRepo}
            removalBusyKeys={removalBusyKeys}
            isRealGstackLink={effectiveGroupProjectTag === 'gstack'}
          />
        </Modal>
      )}
    </div>
  )
}

function CategoryBatchBar({
  field,
  skills,
  onApply,
  onClearSelection,
}: {
  field: TagField
  skills: SkillItem[]
  onApply: (action: BatchAction, form: string) => void
  onClearSelection: () => void
}) {
  const { t } = useI18n()
  const [value, setValue] = useState('')
  const fieldLabel = tagFieldLabel(field, t)

  return (
    <div style={categoryBatchBarStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 700 }}>{fieldLabel}</span>
        <span style={{ fontSize: 11, color: 'var(--text3)' }}>
          {skills.length > 0 ? t('selectedSkillCount', { count: skills.length }) : t('selectSkillsForBatch')}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t('enterCategoryWithSpaces', { category: fieldLabel })}
          style={{ ...searchInputStyle, minWidth: 320, flex: 1 }}
        />
        <Btn variant="primary" onClick={() => onApply('append', value)} disabled={!skills.length}>{t('append')}</Btn>
        <Btn variant="ghost" onClick={() => onApply('replace', value)} disabled={!skills.length}>{t('replace')}</Btn>
        <Btn variant="danger" onClick={() => onApply('remove', value)} disabled={!skills.length}>{t('remove')}</Btn>
        <Btn variant="ghost" onClick={onClearSelection} disabled={!skills.length}>{t('clearSelection')}</Btn>
      </div>
    </div>
  )
}

function CategoryGroupCard({
  groupName,
  skills,
  onOpenGroup,
  onSyncGroup,
  syncing,
}: {
  groupName: string
  skills: SkillItem[]
  onOpenGroup: () => void
  onSyncGroup: (nextChecked: boolean) => void
  syncing: boolean
}) {
  const { t } = useI18n()
  const state = groupState(skills)
  const enabledCount = skills.filter((skill) => skill.enabled).length
  const checked = state === 'all-on'
  const actionableCount = checked
    ? getDesyncableGroupSkills(skills, new Set()).length
    : getSyncableGroupSkills(skills, new Set()).length

  return (
    <div style={groupCardStyle}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <TagChip tag={groupName} />
          <span style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0 }}>{t('skillCount', { count: skills.length })}</span>
        </div>
        <div onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0 }}>
          <Toggle checked={checked} onChange={onSyncGroup} disabled={syncing || actionableCount === 0} />
        </div>
      </div>
      <button onClick={onOpenGroup} style={groupCardOpenStyle}>
        <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.6 }}>
          {t('groupCardHint')}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingTop: 8, borderTop: '1px dashed var(--border)' }}>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>{t('openedCount', { count: enabledCount })}</span>
          <span style={{ fontSize: 11, color: state === 'all-on' ? 'var(--green)' : state === 'all-off' ? 'var(--text3)' : '#c49b39', fontWeight: 700 }}>
            {state === 'all-on' ? t('allOn') : state === 'all-off' ? t('allOff') : t('mixed')}
          </span>
        </div>
      </button>
    </div>
  )
}

const groupCardStyle: CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: 16,
  background: 'var(--surface)',
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
  boxShadow: '0 3px 12px rgba(83, 70, 59, 0.09)',
}

const groupCardOpenStyle: CSSProperties = {
  width: '100%',
  border: 'none',
  background: 'transparent',
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  textAlign: 'left',
  cursor: 'pointer',
}

const categoryBatchBarStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  padding: '16px 18px',
  border: '1px solid var(--border)',
  borderRadius: 16,
  background: 'var(--surface)',
  boxShadow: '0 3px 12px rgba(83, 70, 59, 0.09)',
}
