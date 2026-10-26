import { useEffect, useState } from 'react'
import type { InstallRecord, ProjectLinkRecord, ProjectSyncReport, SourceRecord, TargetRecord } from '../../shared/importTypes'
import type { Pair, SkillItem, SkillTargetPromotionStatus } from '../../shared/types'
import Btn from '../components/Btn'
import Modal from '../components/Modal'
import { useI18n } from '../store/I18nContext'
import { BatchEditor } from './pairDetailEditors'
import { SidebarToolbar, SkillListItem } from './pairDetailListComponents'
import type { BatchAction, DetailForm, TagField } from './pairDetailModel'
import { SkillDetailPanel } from './pairDetailPanels'
import { Placeholder, SidebarEmpty, TagChip } from './pairDetailPrimitives'
import { searchInputStyle } from './pairDetailStyles'

export function GroupDetailWorkspace({
  pair,
  groupName,
  skills,
  selectedNames,
  toggling,
  onToggleSkill,
  onToggleSelected,
  onClearSelection,
  onApplyBatch,
  onSaveDetail,
  projectLink,
  linkedSource,
  installRecordMap,
  targets,
  onOpenLinkGithub,
  onOpenTargetSettings,
  projectSync,
  projectSyncBusy,
  onCheckProjectSync,
  onUpdateProjectSync,
  onRepairProjectSync,
  onRemoveManagedSkill,
  onRemoveManagedGroup,
  onRenameGroup,
  activePromotionStatusBySkill,
  activePromotionBusyNames,
  onEnsurePromotionStatus,
  onPromoteSkillToMainRepo,
  removeManagedGroupDisabled,
  removalBusyKeys,
  isRealGstackLink,
}: {
  pair: Pair
  groupName: string
  skills: SkillItem[]
  selectedNames: Set<string>
  toggling: Set<string>
  onToggleSkill: (skill: SkillItem) => Promise<void>
  onToggleSelected: (name: string) => void
  onClearSelection: () => void
  onApplyBatch: (action: BatchAction, form: Pick<DetailForm, TagField>) => void
  onSaveDetail: (skillName: string, form: DetailForm) => void
  projectLink: ProjectLinkRecord | null
  linkedSource: SourceRecord | null
  installRecordMap: Map<string, InstallRecord>
  targets: TargetRecord[]
  onOpenLinkGithub: () => void
  onOpenTargetSettings: () => void
  projectSync: ProjectSyncReport | null
  projectSyncBusy: 'check' | 'update' | 'repair' | null
  onCheckProjectSync: (projectTag?: string) => void
  onUpdateProjectSync: (projectTag?: string) => void
  onRepairProjectSync: (projectTag?: string) => void
  onRemoveManagedSkill: (skill: SkillItem, installRecord: InstallRecord | null) => Promise<boolean>
  onRemoveManagedGroup: (() => Promise<void>) | null
  onRenameGroup: (rawInput: string) => Promise<string | null>
  activePromotionStatusBySkill: Record<string, SkillTargetPromotionStatus>
  activePromotionBusyNames: Set<string>
  onEnsurePromotionStatus: (skillName: string) => void
  onPromoteSkillToMainRepo: (skill: SkillItem) => void
  removeManagedGroupDisabled: boolean
  removalBusyKeys: Set<string>
  isRealGstackLink: boolean
}) {
  const { t } = useI18n()
  const [search, setSearch] = useState('')
  const [filterEnabled, setFilterEnabled] = useState<boolean | null>(null)
  const [activeSkillName, setActiveSkillName] = useState<string | null>(skills[0]?.name ?? null)
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameValue, setRenameValue] = useState(groupName)

  const searchedSkills = skills.filter((skill) => {
    if (!search.trim()) return true
    const query = search.toLowerCase()
    const haystack = [
      skill.name,
      skill.meta?.note ?? '',
      skill.meta?.projectTags ?? '',
      skill.meta?.funcTags ?? '',
      skill.meta?.customTags ?? '',
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(query)
  })

  const visibleSkills =
    filterEnabled === null ? searchedSkills : searchedSkills.filter((skill) => skill.enabled === filterEnabled)
  const visibleNames = new Set(visibleSkills.map((skill) => skill.name))
  const selectedGroupSkills = skills.filter((skill) => selectedNames.has(skill.name))
  const activeSkill = skills.find((skill) => skill.name === activeSkillName) ?? null

  useEffect(() => {
    if (!visibleSkills.length) {
      setActiveSkillName(null)
      return
    }
    if (!activeSkillName || !visibleNames.has(activeSkillName)) {
      setActiveSkillName(visibleSkills[0].name)
    }
  }, [activeSkillName, visibleNames, visibleSkills])

  useEffect(() => {
    setRenameValue(groupName)
  }, [groupName])

  useEffect(() => {
    if (!activeSkill?.name) return
    onEnsurePromotionStatus(activeSkill.name)
  }, [activeSkill?.name, onEnsurePromotionStatus])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '74vh', minHeight: 560 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <TagChip tag={groupName} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Btn small variant="ghost" onClick={() => setRenameOpen(true)}>
            {t('renameGroup')}
          </Btn>
          {projectLink && onRemoveManagedGroup && (
            <Btn small variant="danger" onClick={() => void onRemoveManagedGroup()} disabled={removeManagedGroupDisabled}>
              {t('wholeGroupRemoveManagement')}
            </Btn>
          )}
          <Btn small variant="ghost" onClick={onOpenLinkGithub}>
            {projectLink ? t('relinkGithub') : t('linkGithubRepo')}
          </Btn>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>{t('skillCount', { count: skills.length })}</span>
        </div>
      </div>
      {renameOpen && (
        <Modal title={t('renameGroupTitle')} onClose={() => setRenameOpen(false)} width={460}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
              placeholder={t('renameGroupPlaceholder')}
              style={searchInputStyle}
              autoFocus
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Btn small variant="ghost" onClick={() => setRenameOpen(false)}>
                {t('cancel')}
              </Btn>
              <Btn
                small
                variant="primary"
                onClick={() => {
                  void onRenameGroup(renameValue).then((renamedTo) => {
                    if (renamedTo) setRenameOpen(false)
                  })
                }}
              >
                {t('confirmRenameGroup')}
              </Btn>
            </div>
          </div>
        </Modal>
      )}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          overflow: 'hidden',
          border: '1px solid var(--border)',
          borderRadius: 16,
          background: 'var(--surface)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <aside
          style={{
            width: 'clamp(320px, 30vw, 460px)',
            minWidth: 300,
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--surface)',
          }}
        >
          <SidebarToolbar
            search={search}
            onSearch={setSearch}
            tab="all"
            filterEnabled={filterEnabled}
            onFilter={setFilterEnabled}
            visibleCount={visibleSkills.length}
            totalCount={skills.length}
            selectedCount={selectedGroupSkills.length}
            onClearSelection={onClearSelection}
          />

          <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
            {visibleSkills.length === 0 ? (
              <SidebarEmpty text={t('noMatchingSkillsInGroup')} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {visibleSkills.map((skill) => (
                  <SkillListItem
                    key={`${groupName}-${skill.name}`}
                    skill={skill}
                    active={activeSkillName === skill.name}
                    selected={selectedNames.has(skill.name)}
                    toggling={toggling.has(skill.name)}
                    onOpen={() => setActiveSkillName(skill.name)}
                    onToggle={() => void onToggleSkill(skill)}
                    onSelect={() => onToggleSelected(skill.name)}
                  />
                ))}
              </div>
            )}
          </div>
        </aside>

        <main style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {selectedGroupSkills.length > 0 ? (
            <BatchEditor skills={selectedGroupSkills} onApply={onApplyBatch} onClearSelection={onClearSelection} />
          ) : activeSkill ? (
            <SkillDetailPanel
              key={`${groupName}-${activeSkill.name}`}
              skill={activeSkill}
              pair={pair}
              projectLink={projectLink}
              linkedSource={linkedSource}
              installRecord={installRecordMap.get(activeSkill.name) ?? null}
              targets={targets}
              projectSync={projectSync}
              projectSyncBusy={projectSyncBusy}
              toggling={toggling.has(activeSkill.name)}
              onToggle={() => void onToggleSkill(activeSkill)}
              onSave={(form) => onSaveDetail(activeSkill.name, form)}
              onOpenLinkGithub={onOpenLinkGithub}
              onOpenTargetSettings={onOpenTargetSettings}
              onCheckProjectSync={onCheckProjectSync}
              onUpdateProjectSync={onUpdateProjectSync}
              onRepairProjectSync={onRepairProjectSync}
              onRemoveManagement={() =>
                void onRemoveManagedSkill(activeSkill, installRecordMap.get(activeSkill.name) ?? null)
              }
              removeManagementBusy={
                (() => {
                  const activeInstallRecord = installRecordMap.get(activeSkill.name)
                  return activeInstallRecord
                    ? removalBusyKeys.has(`skill:${activeInstallRecord.projectTag}:${activeSkill.name}`)
                    : false
                })()
              }
              promotionStatus={activePromotionStatusBySkill[activeSkill.name] ?? null}
              promotionBusy={activePromotionBusyNames.has(activeSkill.name)}
              onPromoteToMainRepo={() => onPromoteSkillToMainRepo(activeSkill)}
              isRealGstackLink={isRealGstackLink}
            />
          ) : (
            <Placeholder text={t('selectSkillFirst')} />
          )}
        </main>
      </div>
    </div>
  )
}
