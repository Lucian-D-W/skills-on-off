import { useState, useEffect, useCallback } from 'react'
import type { Pair, SkillItem, SkillTargetPromotionStatus } from '../../shared/types'
import type { GithubImportMode, InstallRecord, ProjectLinkRecord, ProjectSyncReport, SourceRecord, TargetRecord } from '../../shared/importTypes'
import { api } from '../api'
import { showToast } from '../components/Toast'
import { useI18n } from '../store/I18nContext'
import {
  TAB_FIELD_MAP,
  buildGroups,
  mergeTags,
  normTags,
  removeTags,
  updateStateLabel,
  type BatchAction,
  type DetailForm,
  type TagField,
} from './pairDetailModel'
import {
  normalizeSingleGroupTagInput,
  replaceGroupTagValue,
} from './groupRename'
import { getDesyncableGroupSkills, getSyncableGroupSkills } from './pairDetailGroupSync'
import { getPairDetailTabs, type PairDetailTab as Tab } from './pairDetailTabs'

export function usePairDetailController(pair: Pair) {
  const { locale, t } = useI18n()
  const [skills, setSkills] = useState<SkillItem[]>([])
  const [projectLinks, setProjectLinks] = useState<ProjectLinkRecord[]>([])
  const [sources, setSources] = useState<SourceRecord[]>([])
  const [targets, setTargets] = useState<TargetRecord[]>([])
  const [installRecords, setInstallRecords] = useState<InstallRecord[]>([])
  const [projectSync, setProjectSync] = useState<ProjectSyncReport | null>(null)
  const [projectSyncBusy, setProjectSyncBusy] = useState<'check' | 'update' | 'repair' | null>(null)
  const [loading, setLoading] = useState(true)
  const [scanErr, setScanErr] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('all')
  const [search, setSearch] = useState('')
  const [filterEnabled, setFilterEnabled] = useState<boolean | null>(null)
  const [toggling, setToggling] = useState<Set<string>>(new Set())
  const [activeSkillName, setActiveSkillName] = useState<string | null>(null)
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set())
  const [linkGithubOpen, setLinkGithubOpen] = useState(false)
  const [projectImportOpen, setProjectImportOpen] = useState(false)
  const isCustomProjectionPair = pair.projectionMode === 'directory-contents-copy'
  const [groupLinkContext, setGroupLinkContext] = useState<{ groupName: string; projectTag: string; skillNames: string[] } | null>(null)
  const [targetSettingsOpen, setTargetSettingsOpen] = useState(false)
  const [removalBusyKeys, setRemovalBusyKeys] = useState<Set<string>>(new Set())
  const [promotionStatuses, setPromotionStatuses] = useState<Record<string, SkillTargetPromotionStatus>>({})
  const [promotionBusyKeys, setPromotionBusyKeys] = useState<Set<string>>(new Set())

  const scan = useCallback(async () => {
    try {
      const result = await api.scanSkills(pair.id, pair.sourcePath, pair.targetPath)
      if (result.error) {
        setScanErr(result.error)
        setSkills([])
      } else {
        setScanErr(null)
        setSkills(result.skills)
      }
    } catch (e: unknown) {
      setScanErr((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [pair])

  useEffect(() => {
    setLoading(true)
    void scan()
  }, [scan])

  const refreshProjectMeta = useCallback(async () => {
    const [nextLinks, nextSources, nextTargets, nextInstallRecords] = await Promise.all([
      api.listProjectLinks(pair.id),
      api.listSources(),
      api.listTargets(pair.id),
      api.listInstallRecords(pair.id),
    ])
    setProjectLinks(nextLinks)
    setSources(nextSources)
    setTargets(nextTargets)
    setInstallRecords(nextInstallRecords)
  }, [pair.id])

  useEffect(() => {
    void refreshProjectMeta()
  }, [refreshProjectMeta])

  useEffect(() => {
    if (isCustomProjectionPair && (tab === 'project' || tab === 'func')) {
      setTab('custom')
    }
  }, [isCustomProjectionPair, tab])

  const uncategorizedLabel = t('uncategorized')
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

  let visibleSkills = searchedSkills
  if (tab === 'all' && filterEnabled !== null) {
    visibleSkills = visibleSkills.filter((skill) => skill.enabled === filterEnabled)
  }
  if (tab === 'enabled') {
    visibleSkills = visibleSkills.filter((skill) => skill.enabled)
  }

  const groups = buildGroups(visibleSkills, tab, uncategorizedLabel)
  const visibleNames = new Set(visibleSkills.map((skill) => skill.name))
  const activeSkill = skills.find((skill) => skill.name === activeSkillName) ?? null
  const selectedSkills = skills.filter((skill) => selectedNames.has(skill.name))
  const batchMode = selectedSkills.length > 0
  const categoryField = tab === 'project' || tab === 'func' || tab === 'custom' ? TAB_FIELD_MAP[tab] : null
  const categorizedGroups = categoryField
    ? [...groups.entries()].filter(([groupName]) => groupName !== uncategorizedLabel)
    : []
  const uncategorizedSkills = categoryField ? groups.get(uncategorizedLabel) ?? [] : []
  const projectLink = projectLinks[0] ?? null
  const linkedSource = projectLink ? sources.find((source) => source.id === projectLink.sourceId) ?? null : null
  const installRecordMap = new Map(installRecords.map((record) => [record.skillName, record]))
  const isRealGstackLink =
    projectLink?.projectTag === 'gstack' || linkedSource?.canonicalUrl?.includes('/garrytan/gstack/') || false

  useEffect(() => {
    setSelectedNames((prev) => {
      const next = new Set<string>()
      for (const name of prev) {
        if (skills.some((skill) => skill.name === name)) next.add(name)
      }
      return next
    })
  }, [skills])

  useEffect(() => {
    if (!visibleSkills.length) {
      setActiveSkillName(null)
      return
    }
    if (!activeSkillName || !visibleNames.has(activeSkillName)) {
      setActiveSkillName(visibleSkills[0].name)
    }
  }, [activeSkillName, visibleNames, visibleSkills])

  const runProjectSyncAction = useCallback(
    async (action: 'status' | 'check' | 'update' | 'repair', projectTagOverride?: string) => {
      const effectiveProjectTag = projectTagOverride ?? projectLink?.projectTag
      if (!effectiveProjectTag) return

      if (action !== 'status') {
        setProjectSyncBusy(action)
      }

      try {
        const report =
          action === 'status'
            ? await api.getProjectSyncStatus(pair.id, effectiveProjectTag)
            : action === 'check'
              ? await api.checkProjectSync(pair.id, effectiveProjectTag)
              : action === 'update'
                ? await api.updateProjectSync(pair.id, effectiveProjectTag)
                : await api.repairProjectSync(pair.id, effectiveProjectTag)

        setProjectSync(report)

        if (action === 'update' || action === 'repair') {
          await Promise.all([scan(), refreshProjectMeta()])
        }

        if (action === 'check') {
          showToast(`${t('updateStatus')}：${updateStateLabel(report.updateState, t)}`, 'success')
        }

        if (action === 'update') {
          showToast(
            report.healthState === 'healthy' ? t('updateAndSync') : t('targetNeedsRepair'),
            report.healthState === 'healthy' ? 'success' : 'info'
          )
        }

        if (action === 'repair') {
          showToast(
            report.healthState === 'healthy' ? t('repairSync') : t('syncStatusError'),
            report.healthState === 'healthy' ? 'success' : 'info'
          )
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        showToast(message, 'error')
      } finally {
        if (action !== 'status') {
          setProjectSyncBusy(null)
        }
      }
    },
    [pair.id, projectLink, refreshProjectMeta, scan]
  )

  useEffect(() => {
    if (!projectLink) {
      setProjectSync(null)
      return
    }

    void runProjectSyncAction('status', projectLink.projectTag)
  }, [projectLink?.id, projectLink?.projectTag, runProjectSyncAction])

  const refreshSkillPromotionStatus = useCallback(
    async (skillName: string) => {
      const status = await api.getSkillTargetPromotionStatus(pair.id, skillName)
      setPromotionStatuses((prev) => ({ ...prev, [skillName]: status }))
      return status
    },
    [pair.id]
  )

  useEffect(() => {
    if (!activeSkill) return
    void refreshSkillPromotionStatus(activeSkill.name).catch(() => {
      setPromotionStatuses((prev) => ({
        ...prev,
        [activeSkill.name]: {
          canPromote: false,
          targetExists: false,
          targetDiffersFromSource: false,
          lastTargetPromotedAt: activeSkill.meta?.lastTargetPromotedAt ?? 0,
          unsupportedReason: '',
        },
      }))
    })
  }, [activeSkill?.name, activeSkill?.meta?.lastTargetPromotedAt, refreshSkillPromotionStatus])

  async function toggleSkill(skill: SkillItem) {
    if (toggling.has(skill.name)) return

    setToggling((prev) => new Set([...prev, skill.name]))
    try {
      const promotionStatus = await refreshSkillPromotionStatus(skill.name)
      if (!skill.enabled && promotionStatus.targetExists && promotionStatus.targetDiffersFromSource) {
        const shouldContinue = window.confirm(t('updateToMainRepoOverwriteWarning'))
        if (!shouldContinue) return
      }

      if (skill.enabled) {
        const result = await api.disableSkill(pair.id, pair.targetPath, skill.name)
        if (!result.ok) {
          showToast(result.error ?? t('closeFailed'), 'error')
          return
        }
      } else {
        const result = await api.enableSkill(pair.id, pair.sourcePath, pair.targetPath, skill.name)
        if (!result.ok) {
          showToast(result.error ?? t('openFailed'), 'error')
          return
        }
      }
    } finally {
      setToggling((prev) => {
        const next = new Set(prev)
        next.delete(skill.name)
        return next
      })
      await scan()
      await refreshSkillPromotionStatus(skill.name).catch(() => undefined)
    }
  }

  async function promoteTargetToMainRepo(skill: SkillItem) {
    if (promotionBusyKeys.has(skill.name)) return

    setPromotionBusyKeys((prev) => new Set([...prev, skill.name]))
    try {
      const status = await api.promoteSkillTargetToSource(pair.id, skill.name)
      setPromotionStatuses((prev) => ({ ...prev, [skill.name]: status }))
      await scan()
      showToast(t('updateToMainRepoCompleted'), 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      showToast(message, 'error')
    } finally {
      setPromotionBusyKeys((prev) => {
        const next = new Set(prev)
        next.delete(skill.name)
        return next
      })
    }
  }

  async function saveMetaPatch(
    skill: SkillItem,
    patch: Partial<{ note: string; projectTags: string; funcTags: string; customTags: string }>
  ) {
    const meta = skill.meta
    await api.saveMeta(
      pair.id,
      skill.name,
      patch.note ?? meta?.note ?? '',
      patch.projectTags ?? meta?.projectTags ?? '',
      patch.funcTags ?? meta?.funcTags ?? '',
      patch.customTags ?? meta?.customTags ?? ''
    )
  }

  async function saveDetail(skillName: string, form: DetailForm) {
    const skill = skills.find((item) => item.name === skillName)
    if (!skill) return

    await saveMetaPatch(skill, {
      note: form.note.trim(),
      projectTags: normTags(form.projectTags),
      funcTags: normTags(form.funcTags),
      customTags: normTags(form.customTags),
    })
    await scan()
    showToast(t('saved'), 'success')
  }

  async function setGroupSkillsEnabled(groupName: string, groupSkills: SkillItem[], nextChecked: boolean) {
    const actionableSkills = nextChecked
      ? getSyncableGroupSkills(groupSkills, toggling)
      : getDesyncableGroupSkills(groupSkills, toggling)

    if (!actionableSkills.length) {
      showToast(nextChecked ? t('groupNothingToSync') : t('groupNothingToRemove'), 'info')
      return
    }

    const names = actionableSkills.map((skill) => skill.name)
    setToggling((prev) => new Set([...prev, ...names]))

    let processedCount = 0
    const failed: { name: string; error: string }[] = []

    try {
      for (const skill of actionableSkills) {
        const result = nextChecked
          ? await api.enableSkill(pair.id, pair.sourcePath, pair.targetPath, skill.name)
          : await api.disableSkill(pair.id, pair.targetPath, skill.name)

        if (result.ok) processedCount += 1
        else failed.push({ name: skill.name, error: result.error ?? t('syncFailed') })
      }
    } finally {
      setToggling((prev) => {
        const next = new Set(prev)
        names.forEach((name) => next.delete(name))
        return next
      })
      await scan()
    }

    if (failed.length === 0) {
      showToast(
        nextChecked
          ? t('groupSyncedToTarget', { groupName, count: processedCount })
          : t('groupRemovedFromTarget', { groupName, count: processedCount }),
        'success'
      )
      return
    }

    if (processedCount === 0) {
      showToast(failed[0]?.error ?? t('syncFailed'), 'error')
      return
    }

    showToast(
      nextChecked
        ? t('batchPartialSync', { done: processedCount, failed: failed.length })
        : t('batchPartialRemove', { done: processedCount, failed: failed.length }),
      'info'
    )
  }

  async function applyBatchTags(action: BatchAction, form: Pick<DetailForm, TagField>) {
    if (!selectedSkills.length) return

    const hasInput = Object.values(form).some((value) => value.trim().length > 0)
    if (!hasInput && action !== 'replace') {
      showToast(t('enterTagsFirst'), 'error')
      return
    }

    for (const skill of selectedSkills) {
      const current = skill.meta
      const next: Record<TagField, string> = {
        projectTags: current?.projectTags ?? '',
        funcTags: current?.funcTags ?? '',
        customTags: current?.customTags ?? '',
      }

      ;(['projectTags', 'funcTags', 'customTags'] as TagField[]).forEach((field) => {
        if (action !== 'replace' && !form[field].trim()) return

        if (action === 'append') next[field] = mergeTags(next[field], form[field])
        if (action === 'replace') next[field] = normTags(form[field])
        if (action === 'remove') next[field] = removeTags(next[field], form[field])
      })

      await saveMetaPatch(skill, next)
    }

    await scan()
    showToast(t('batchTagApplied', { count: selectedSkills.length }), 'success')
  }

  async function renameGroupTagAction(
    field: TagField,
    oldTag: string,
    groupSkills: SkillItem[],
    rawInput: string
  ): Promise<string | null> {
    const normalized = normalizeSingleGroupTagInput(rawInput)
    if (normalized.error === 'empty') {
      showToast(t('renameGroupInvalidEmpty'), 'error')
      return null
    }
    if (normalized.error === 'multiple') {
      showToast(t('renameGroupInvalidMultiple'), 'error')
      return null
    }

    const nextTag = normalized.value
    if (!nextTag) {
      showToast(t('renameGroupInvalidEmpty'), 'error')
      return null
    }

    for (const skill of groupSkills) {
      const currentValue = skill.meta?.[field] ?? ''
      const nextValue = replaceGroupTagValue(currentValue, oldTag, nextTag)
      if (nextValue === currentValue) continue
      await saveMetaPatch(skill, {
        [field]: nextValue,
      } as Partial<{ note: string; projectTags: string; funcTags: string; customTags: string }>)
    }

    await scan()
    showToast(t('groupRenamedSuccess', { oldTag, newTag: nextTag }), 'success')
    return nextTag
  }

  async function removeManagedSkillAction(skill: SkillItem, installRecord: InstallRecord | null): Promise<boolean> {
    if (!installRecord || installRecord.managementState !== 'managed') return false

    const confirmed = window.confirm(
      t('removeSkillManagementConfirm')
    )
    if (!confirmed) return false

    const busyKey = `skill:${installRecord.projectTag}:${skill.name}`
    setRemovalBusyKeys((prev) => new Set(prev).add(busyKey))

    try {
      await api.removeManagedSkill(pair.id, installRecord.projectTag, skill.name)
      await Promise.all([scan(), refreshProjectMeta()])
      await runProjectSyncAction('status', installRecord.projectTag)
      showToast(t('removedSkillManagement'), 'success')
      return true
    } catch (error) {
      showToast(error instanceof Error ? error.message : String(error), 'error')
      return false
    } finally {
      setRemovalBusyKeys((prev) => {
        const next = new Set(prev)
        next.delete(busyKey)
        return next
      })
    }
  }

  async function removeManagedGroupAction(projectTag: string, skillCount: number): Promise<boolean> {
    const confirmed = window.confirm(
      t('removeGroupManagementConfirm', { projectTag, count: skillCount })
    )
    if (!confirmed) return false

    const busyKey = `group:${projectTag}`
    setRemovalBusyKeys((prev) => new Set(prev).add(busyKey))

    try {
      await api.removeManagedGroup(pair.id, projectTag)
      await Promise.all([scan(), refreshProjectMeta()])
      await runProjectSyncAction('status', projectTag)
      showToast(t('removedGroupManagement'), 'success')
      return true
    } catch (error) {
      showToast(error instanceof Error ? error.message : String(error), 'error')
      return false
    } finally {
      setRemovalBusyKeys((prev) => {
        const next = new Set(prev)
        next.delete(busyKey)
        return next
      })
    }
  }

  function toggleSelected(skillName: string) {
    setSelectedNames((prev) => {
      const next = new Set(prev)
      if (next.has(skillName)) next.delete(skillName)
      else next.add(skillName)
      return next
    })
  }

  function clearSelection() {
    setSelectedNames(new Set())
  }

  async function linkProjectToGithub(url: string) {
    await api.linkProjectToGithub(
      pair.id,
      projectLink?.projectTag ?? pair.name,
      url,
      skills.filter((skill) => !skill.orphan).map((skill) => skill.name)
    )
    await Promise.all([refreshProjectMeta(), scan()])
  }

  async function importGithubProjectToPair(url: string, copyMode: GithubImportMode) {
    await api.importGithubProjectToPair(pair.id, url, copyMode)
    await Promise.all([refreshProjectMeta(), scan()])
  }

  async function linkGroupToGithub(url: string) {
    if (!groupLinkContext) return
    await api.linkProjectToGithub(
      pair.id,
      groupLinkContext.projectTag,
      url,
      groupLinkContext.skillNames
    )
    await Promise.all([refreshProjectMeta(), scan()])
  }

  async function saveTargetSettings(next: Pick<TargetRecord, 'kind' | 'rootPath' | 'layoutVersion' | 'agentName' | 'metadataJson'>) {
    await api.upsertTarget(
      pair.id,
      next.kind,
      targets[0]?.rootPath ?? pair.targetPath,
      next.layoutVersion,
      next.agentName,
      next.metadataJson
    )
    await refreshProjectMeta()
    showToast(t('targetSettingsUpdated'), 'success')
    setTargetSettingsOpen(false)
  }

  async function saveInlineCategoryValue(skill: SkillItem, field: TagField, value: string) {
    await saveMetaPatch(skill, { [field]: normTags(value) })
    await scan()
  }

  const tabs = getPairDetailTabs(pair.projectionMode, locale)

  return {
    t,
    skills,
    projectLinks,
    sources,
    targets,
    installRecords,
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
  }
}
