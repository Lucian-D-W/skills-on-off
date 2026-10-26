import type { CSSProperties } from 'react'
import type { Pair } from '../../shared/types'
import Btn from '../components/Btn'
import Modal from '../components/Modal'
import GithubImportModal from '../components/GithubImportModal'
import LanguagePicker from '../components/LanguagePicker'
import TargetSettingsPanel from '../components/TargetSettingsPanel'
import ThemePicker from '../components/ThemePicker'
import { typography } from '../styles/typography'
import { BatchEditor } from './pairDetailEditors'
import { SidebarToolbar, SkillListItem } from './pairDetailListComponents'
import { SkillDetailPanel } from './pairDetailPanels'
import {
  ErrorBanner,
  Placeholder,
  SidebarEmpty,
} from './pairDetailPrimitives'
import { CategoryTabWorkspace } from './pairDetailWorkspaces'
import { usePairDetailController } from './usePairDetailController'

interface Props {
  pair: Pair
  onBack: () => void
}

export default function PairDetailPage({ pair, onBack }: Props) {
  const {
    t,
    skills,
    targets,
    projectSync,
    projectSyncBusy,
    loading,
    scanErr,
    tab,
    setTab,
    search,
    setSearch,
    filterEnabled,
    setFilterEnabled,
    toggling,
    activeSkillName,
    setActiveSkillName,
    selectedNames,
    linkGithubOpen,
    setLinkGithubOpen,
    projectImportOpen,
    setProjectImportOpen,
    groupLinkContext,
    setGroupLinkContext,
    targetSettingsOpen,
    setTargetSettingsOpen,
    removalBusyKeys,
    promotionStatuses,
    promotionBusyKeys,
    visibleSkills,
    activeSkill,
    selectedSkills,
    batchMode,
    categoryField,
    categorizedGroups,
    uncategorizedSkills,
    projectLinks,
    sources,
    installRecords,
    projectLink,
    linkedSource,
    installRecordMap,
    isRealGstackLink,
    tabs,
    scan,
    runProjectSyncAction,
    refreshSkillPromotionStatus,
    toggleSkill,
    promoteTargetToMainRepo,
    saveDetail,
    setGroupSkillsEnabled,
    applyBatchTags,
    renameGroupTagAction,
    removeManagedSkillAction,
    removeManagedGroupAction,
    toggleSelected,
    clearSelection,
    linkProjectToGithub,
    importGithubProjectToPair,
    linkGroupToGithub,
    saveTargetSettings,
    saveInlineCategoryValue,
  } = usePairDetailController(pair)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 22px',
          height: 60,
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
          flexShrink: 0,
          boxShadow: '0 1px 0 var(--border)',
        }}
      >
        <button onClick={onBack} style={iconButtonStyle}>
          ←
        </button>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ fontSize: 16, fontWeight: typography.weight.appTitle, fontFamily: typography.family.ui }}>{pair.name}</div>
          <div style={pathLineStyle}>
            {pair.sourcePath} → {pair.targetPath}
          </div>
        </div>
        <LanguagePicker />
        <Btn small variant="ghost" onClick={() => void scan()}>
          {t('rescan')}
        </Btn>
        <details style={{ position: 'relative' }} onClick={(event) => {
          if ((event.target as HTMLElement).closest('button')) event.currentTarget.removeAttribute('open')
        }}>
          <summary style={{ cursor: 'pointer', listStyle: 'none', padding: '8px 10px', fontSize: 12, color: 'var(--text2)' }}>
            {t('moreActions')} ⋯
          </summary>
          <div style={{ position: 'absolute', right: 0, top: '100%', zIndex: 30, padding: 8, minWidth: 160, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--surface)', boxShadow: 'var(--shadow)' }}>
            <Btn small variant="ghost" onClick={() => setTargetSettingsOpen(true)}>{t('targetSettings')}</Btn>
          </div>
        </details>
        <ThemePicker />
      </div>

      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
          flexShrink: 0,
          paddingLeft: 20,
        }}
      >
        {(['scope', 'category'] as const).map((group) => (
          <div key={group} role="group" style={{ display: 'flex', position: 'relative' }}>
          {group === 'category' && (
            <span aria-hidden="true" style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 1, height: 12, background: 'var(--border)', pointerEvents: 'none' }} />
          )}
          {tabs.filter((item) => item.group === group).map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            style={{
              padding: '13px 18px',
              fontSize: 12,
              fontWeight: typography.weight.label,
              letterSpacing: '0.02em',
              color: tab === item.id ? 'var(--accent)' : 'var(--text2)',
              borderBottom: tab === item.id ? '2px solid var(--accent)' : '2px solid transparent',
              background: 'none',
              fontFamily: typography.family.ui,
            }}
          >
            {item.label}
          </button>
          ))}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {loading ? (
          <Placeholder text={t('processing')} />
        ) : scanErr ? (
          <ErrorBanner msg={scanErr} />
        ) : categoryField ? (
          <main style={{ flex: 1, overflow: 'auto', padding: 20 }}>
            <CategoryTabWorkspace
              pair={pair}
              field={categoryField}
              search={search}
              onSearch={setSearch}
              visibleCount={visibleSkills.length}
              totalCount={skills.length}
              groupedEntries={categorizedGroups}
              uncategorizedSkills={uncategorizedSkills}
              selectedNames={selectedNames}
              toggling={toggling}
              selectedSkills={selectedSkills}
              onToggleSkill={toggleSkill}
              onToggleSelected={toggleSelected}
              onClearSelection={clearSelection}
              onBatchApply={(action, form) => {
                void applyBatchTags(action, {
                  projectTags: categoryField === 'projectTags' ? form : '',
                  funcTags: categoryField === 'funcTags' ? form : '',
                  customTags: categoryField === 'customTags' ? form : '',
                })
              }}
              onApplyAllBatch={(action, form) => {
                void applyBatchTags(action, form)
              }}
              onInlineSave={(skill, value) => {
                void saveInlineCategoryValue(skill, categoryField, value)
              }}
              onSaveDetail={(skillName, form) => {
                void saveDetail(skillName, form)
              }}
              projectLinks={projectLinks}
              sources={sources}
              targets={targets}
              installRecords={installRecords}
              projectSync={projectSync}
              projectSyncBusy={projectSyncBusy}
              onOpenProjectImport={() => setProjectImportOpen(true)}
              onOpenGroupLink={(groupName, projectTag, groupSkills) =>
                setGroupLinkContext({
                  groupName,
                  projectTag,
                  skillNames: groupSkills.map((skill) => skill.name),
                })
              }
              onOpenLinkGithub={() => setLinkGithubOpen(true)}
              onOpenTargetSettings={() => setTargetSettingsOpen(true)}
              onCheckProjectSync={(projectTag) => {
                void runProjectSyncAction('check', projectTag)
              }}
              onUpdateProjectSync={(projectTag) => {
                void runProjectSyncAction('update', projectTag)
              }}
              onRepairProjectSync={(projectTag) => {
                void runProjectSyncAction('repair', projectTag)
              }}
              onRemoveManagedSkill={removeManagedSkillAction}
              onRemoveManagedGroup={removeManagedGroupAction}
              onRenameGroupTag={renameGroupTagAction}
              activePromotionStatusBySkill={promotionStatuses}
              activePromotionBusyNames={promotionBusyKeys}
              onEnsurePromotionStatus={(skillName) => {
                void refreshSkillPromotionStatus(skillName)
              }}
              onPromoteSkillToMainRepo={(skill) => {
                void promoteTargetToMainRepo(skill)
              }}
              removalBusyKeys={removalBusyKeys}
              onSyncGroup={(groupName, groupSkills, nextChecked) => {
                void setGroupSkillsEnabled(groupName, groupSkills, nextChecked)
              }}
            />
          </main>
        ) : (
          <>
            <aside
              style={{
                width: 'clamp(300px, 28vw, 460px)',
                minWidth: 280,
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--surface)',
              }}
            >
              <SidebarToolbar
                search={search}
                onSearch={setSearch}
                tab={tab}
                filterEnabled={filterEnabled}
                onFilter={setFilterEnabled}
                visibleCount={visibleSkills.length}
                totalCount={skills.length}
                selectedCount={selectedSkills.length}
                onClearSelection={clearSelection}
              />

              <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
                {visibleSkills.length === 0 ? (
                  <SidebarEmpty text={t('noMatchingSkills')} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {visibleSkills.map((skill) => (
                      <SkillListItem
                        key={skill.name}
                        skill={skill}
                        active={activeSkillName === skill.name}
                        selected={selectedNames.has(skill.name)}
                        toggling={toggling.has(skill.name)}
                        onOpen={() => setActiveSkillName(skill.name)}
                        onToggle={() => void toggleSkill(skill)}
                        onSelect={() => toggleSelected(skill.name)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </aside>

            <main style={{ flex: 1, overflow: 'auto', padding: 20 }}>
              {batchMode ? (
                <BatchEditor
                  skills={selectedSkills}
                  onApply={(action, form) => void applyBatchTags(action, form)}
                  onClearSelection={clearSelection}
                />
              ) : activeSkill ? (
                <SkillDetailPanel
                  key={activeSkill.name}
                  skill={activeSkill}
                  pair={pair}
                  projectLink={projectLink}
                  linkedSource={linkedSource}
                  installRecord={installRecordMap.get(activeSkill.name) ?? null}
                  targets={targets}
                  projectSync={projectSync}
                  projectSyncBusy={projectSyncBusy}
                  toggling={toggling.has(activeSkill.name)}
                  onToggle={() => void toggleSkill(activeSkill)}
                  onSave={(form) => void saveDetail(activeSkill.name, form)}
                  onOpenLinkGithub={() => setLinkGithubOpen(true)}
                  onOpenTargetSettings={() => setTargetSettingsOpen(true)}
                  onCheckProjectSync={(projectTag) => {
                    void runProjectSyncAction('check', projectTag)
                  }}
                  onUpdateProjectSync={(projectTag) => {
                    void runProjectSyncAction('update', projectTag)
                  }}
                  onRepairProjectSync={(projectTag) => {
                    void runProjectSyncAction('repair', projectTag)
                  }}
                  onRemoveManagement={() =>
                    void removeManagedSkillAction(activeSkill, installRecordMap.get(activeSkill.name) ?? null)
                  }
                  removeManagementBusy={
                    (() => {
                      const activeInstallRecord = installRecordMap.get(activeSkill.name)
                      return activeInstallRecord
                        ? removalBusyKeys.has(`skill:${activeInstallRecord.projectTag}:${activeSkill.name}`)
                        : false
                    })()
                  }
                  promotionStatus={promotionStatuses[activeSkill.name] ?? null}
                  promotionBusy={promotionBusyKeys.has(activeSkill.name)}
                  onPromoteToMainRepo={() => void promoteTargetToMainRepo(activeSkill)}
                  isRealGstackLink={isRealGstackLink}
                />
              ) : (
                <Placeholder text={t('selectSkillFirst')} />
              )}
            </main>
          </>
        )}
      </div>

      {linkGithubOpen && (
        <Modal title={t('linkGithubRepo')} onClose={() => setLinkGithubOpen(false)} width={720}>
          <GithubImportModal
            mode="link"
            initialName={pair.name}
            onClose={() => setLinkGithubOpen(false)}
            onLinked={linkProjectToGithub}
          />
        </Modal>
      )}

      {projectImportOpen && (
        <Modal title={t('importGithubProject')} onClose={() => setProjectImportOpen(false)} width={720}>
          <GithubImportModal
            mode="project-import"
            onClose={() => setProjectImportOpen(false)}
            onImportedToPair={importGithubProjectToPair}
          />
        </Modal>
      )}

      {groupLinkContext && (
        <Modal title={t('linkGroupGithub', { groupName: groupLinkContext.groupName })} onClose={() => setGroupLinkContext(null)} width={720}>
          <GithubImportModal
            mode="link"
            initialName={groupLinkContext.groupName}
            onClose={() => setGroupLinkContext(null)}
            onLinked={linkGroupToGithub}
          />
        </Modal>
      )}

      {targetSettingsOpen && (
        <Modal title={t('targetSettings')} onClose={() => setTargetSettingsOpen(false)} width={760}>
          <TargetSettingsPanel
            target={targets[0] ?? null}
            onSave={saveTargetSettings}
          />
        </Modal>
      )}
    </div>
  )
}

const iconButtonStyle: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--bg3)',
  border: '1px solid var(--border)',
  color: 'var(--text2)',
  fontSize: 18,
}

const pathLineStyle: CSSProperties = {
  fontSize: 12,
  color: 'var(--text2)',
  marginTop: 4,
  fontFamily: typography.family.ui,
  fontWeight: typography.weight.path,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}
