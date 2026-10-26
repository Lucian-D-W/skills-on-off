import fs from 'fs/promises'
import path from 'path'
import type { Pair } from '../shared/types'
import type { GithubImportMode, InstallRecord, PairProjectionMode, ProjectLinkRecord } from '../shared/importTypes'
import { collectManagedEntryNames, stringifyManagedEntryNames } from './contentProjection'
import { buildDefaultProjectTag, importGithubArchive, resolveGithubImportPreview } from './githubSource'
import {
  type InstallRecordInput,
  listInstallRecordsByPairIdAndTag,
  listManagedInstallRecordsByPairIdAndTag,
  replaceInstallRecords,
} from './installRecordRepository'
import { archiveRemovedManagedSkills } from './managementRemovalService'
import {
  getProjectLinkByPairId,
  getProjectLinkByPairIdAndTag,
  listProjectLinksByPairId,
  upsertProjectLink,
} from './projectLinkRepository'
import { getSkillMeta, saveSkillMeta } from './skillMetaRepository'
import { upsertSourceByCanonicalUrl } from './sourceRepository'
import { replaceTargetProjectionsForProjectTag } from './targetProjectionRepository'
import { nowEpoch } from './time'
import { listPairTargets } from './targetRegistry'

export function getProjectLink(pairId: number): ProjectLinkRecord | null {
  return getProjectLinkByPairId(pairId)
}

export function listProjectLinks(pairId: number): ProjectLinkRecord[] {
  return listProjectLinksByPairId(pairId)
}

export function getProjectLinkForTag(pairId: number, projectTag: string): ProjectLinkRecord | null {
  return getProjectLinkByPairIdAndTag(pairId, projectTag)
}

async function hasSkillManifest(dirPath: string): Promise<boolean> {
  return fs
    .stat(path.join(dirPath, 'SKILL.md'))
    .then((stat) => stat.isFile())
    .catch(() => false)
}

async function listDirectEntryNames(dirPath: string): Promise<string[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true })
  return entries.map((entry) => entry.name).sort((a, b) => a.localeCompare(b))
}

export async function analyzeImportedSkills(
  importedSourcePath: string,
  repoName: string,
  importMode: GithubImportMode = 'skills-import'
): Promise<InstallRecordInput[]> {
  if (importMode !== 'skills-import') {
    const managedEntries = importMode === 'directory-copy'
      ? await listDirectEntryNames(importedSourcePath)
      : collectManagedEntryNames(importedSourcePath, importMode)
    if (importMode === 'agent-files-copy' && managedEntries.length === 0) {
      throw new Error('找不到常見 Agent 文件，請改用其他模式')
    }
    return [
      {
        skillName: repoName,
        sourceRelativePath: '.',
        installedAs: repoName,
        installMode: 'content-repo',
        installReason:
          importMode === 'agent-files-copy'
            ? 'repo root imported as managed common agent files'
            : importMode === 'directory-copy'
              ? 'selected folder imported intact as one managed directory'
              : 'repo root imported as managed direct child entries',
        sourceRootKind: 'content-root',
        copyMode: importMode,
        containerDirName: repoName,
        managedEntriesJson: stringifyManagedEntryNames(managedEntries),
        isRootSkillWrapped: false,
        metadataJson: JSON.stringify({
          repoName,
          detectedAtRoot: true,
          copyMode: importMode,
          importMode,
        }),
      },
    ]
  }

  const rootHasSkill = await hasSkillManifest(importedSourcePath)
  if (rootHasSkill) {
    const managedEntries = await listDirectEntryNames(importedSourcePath)
    return [
      {
        skillName: repoName,
        sourceRelativePath: '.',
        installedAs: repoName,
        installMode: 'single-root-skill',
        installReason: 'repo root contains SKILL.md; wrapped as standalone skill directory',
        sourceRootKind: 'root-skill',
        copyMode: 'directory-copy',
        containerDirName: repoName,
        managedEntriesJson: stringifyManagedEntryNames(managedEntries),
        isRootSkillWrapped: true,
        metadataJson: JSON.stringify({
          repoName,
          detectedAtRoot: true,
          copyMode: 'directory-copy',
          importMode,
        }),
      },
    ]
  }

  const records: InstallRecordInput[] = []
  const installedNames = new Set<string>()
  async function discoverSkills(directory: string): Promise<void> {
    const entries = await fs.readdir(directory, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name === '.git' || entry.name === 'node_modules') continue
      const sourceEntryPath = path.join(directory, entry.name)
      if (!(await hasSkillManifest(sourceEntryPath))) {
        await discoverSkills(sourceEntryPath)
        continue
      }
      const normalizedName = entry.name.toLowerCase()
      if (installedNames.has(normalizedName)) {
        throw new Error(`找到多個同名 Skill：${entry.name}，請選擇更具體的 GitHub 子目錄後再導入`)
      }
      installedNames.add(normalizedName)
      const managedEntries = await listDirectEntryNames(sourceEntryPath)
      records.push({
        skillName: entry.name,
        sourceRelativePath: path.relative(importedSourcePath, sourceEntryPath).split(path.sep).join('/'),
        installedAs: entry.name,
        installMode: 'multi-skill-repo',
        installReason: 'directory contains SKILL.md; imported as an independent complete skill',
        sourceRootKind: 'nested-skills',
        copyMode: 'directory-copy',
        containerDirName: entry.name,
        managedEntriesJson: stringifyManagedEntryNames(managedEntries),
        isRootSkillWrapped: false,
        metadataJson: JSON.stringify({ repoName, detectedAtRoot: false, copyMode: 'directory-copy', importMode }),
      })
    }
  }
  await discoverSkills(importedSourcePath)
  if (records.length === 0) {
    throw new Error('找不到 SKILL.md，請確認倉庫地址，或改用「整個資料夾」導入')
  }

  return records.sort((a, b) => a.installedAs.localeCompare(b.installedAs))
}

export function resolveRecordedImportMode(records: Array<Pick<InstallRecord, 'copyMode' | 'metadataJson'>>): GithubImportMode {
  const record = records[0]
  if (!record) return 'skills-import'
  try {
    const mode = JSON.parse(record.metadataJson).importMode
    if (mode === 'skills-import' || mode === 'directory-copy' || mode === 'directory-contents-copy' || mode === 'agent-files-copy') {
      return mode
    }
  } catch {
    // Older records may not contain import-mode metadata.
  }
  return record.copyMode === 'directory-copy' ? 'skills-import' : record.copyMode
}

function upsertSourceAndProjectLink(
  pair: Pair,
  preview: Awaited<ReturnType<typeof resolveGithubImportPreview>>,
  projectTag: string
): ProjectLinkRecord {
  const source = upsertSourceByCanonicalUrl({
    kind: 'github-archive',
    owner: preview.owner,
    repo: preview.repo,
    branch: preview.branch,
    subpath: preview.subpath,
    canonicalUrl: preview.canonicalUrl,
    archiveUrl: preview.archiveUrl,
    sourcePath: pair.sourcePath,
    resolvedCommitSha: '',
    etag: '',
    metadataJson: JSON.stringify({ linkedFromPairId: pair.id }),
    lastFetchedAt: 0,
  })

  return upsertProjectLink({
    pairId: pair.id,
    sourceId: source.id,
    sourceKind: source.kind,
    projectTag,
    status: 'linked',
  })
}

export async function linkPairToGithub(pair: Pair, githubUrl: string, projectTag = ''): Promise<ProjectLinkRecord> {
  const preview = await resolveGithubImportPreview(githubUrl)
  return upsertSourceAndProjectLink(pair, preview, projectTag || buildDefaultProjectTag(preview.repo))
}

export async function linkProjectGroupToGithub(
  pair: Pair,
  projectTag: string,
  githubUrl: string,
  skillNames: string[]
): Promise<ProjectLinkRecord> {
  const preview = await resolveGithubImportPreview(githubUrl)
  const normalizedTag = projectTag.trim() || buildDefaultProjectTag(preview.repo)
  const link = upsertSourceAndProjectLink(pair, preview, normalizedTag)
  if (skillNames.length > 0) {
    applyGroupTagToSkills(pair, skillNames, normalizedTag)
  }
  return link
}

export function resolvePairGroupTagField(projectionMode: PairProjectionMode): 'projectTags' | 'customTags' {
  return projectionMode === 'directory-contents-copy' ? 'customTags' : 'projectTags'
}

export function applyGroupTagToSkills(pair: Pair, skillNames: string[], groupTag: string) {
  if (!groupTag.trim()) return

  const groupField = resolvePairGroupTagField(pair.projectionMode)
  for (const skillName of skillNames) {
    const meta = getSkillMeta(pair.id, skillName)
    const nextProjectTags =
      groupField === 'projectTags'
        ? [...new Set((meta?.projectTags ?? '').split(/\s+/).filter(Boolean).concat(groupTag))].join(' ')
        : meta?.projectTags ?? ''
    const nextCustomTags =
      groupField === 'customTags'
        ? [...new Set((meta?.customTags ?? '').split(/\s+/).filter(Boolean).concat(groupTag))].join(' ')
        : meta?.customTags ?? ''
    saveSkillMeta(
      pair.id,
      skillName,
      meta?.note ?? '',
      nextProjectTags,
      meta?.funcTags ?? '',
      nextCustomTags
    )
  }
}

export function applyProjectTagToSkills(pairId: number, skillNames: string[], projectTag: string) {
  if (!projectTag.trim()) return

  for (const skillName of skillNames) {
    const meta = getSkillMeta(pairId, skillName)
    const existingTags = new Set((meta?.projectTags ?? '').split(/\s+/).filter(Boolean))
    existingTags.add(projectTag)
    saveSkillMeta(
      pairId,
      skillName,
      meta?.note ?? '',
      [...existingTags].join(' '),
      meta?.funcTags ?? '',
      meta?.customTags ?? ''
    )
  }
}

function persistImportedProjectionLedger(pair: Pair, projectTag: string, records: InstallRecordInput[]) {
  const projectedAt = nowEpoch()
  const projections = records.map((record) => ({
    skillName: record.skillName,
    sourceRelativePath: record.sourceRelativePath,
    targetRelativePath: record.copyMode === 'directory-copy' ? record.installedAs : '',
    state: 'inactive' as const,
    lastProjectedAt: projectedAt,
    lastSourceVersion: '',
    metadataJson: JSON.stringify({
      projectTag,
      installMode: record.installMode,
      sourceRootKind: record.sourceRootKind,
      copyMode: record.copyMode,
      containerDirName: record.containerDirName,
      managedEntries: JSON.parse(record.managedEntriesJson),
    }),
  }))

  for (const target of listPairTargets(pair)) {
    replaceTargetProjectionsForProjectTag(target.id, projectTag, projections)
  }
}

export async function copyImportedSourceToPair(
  importedSourcePath: string,
  pairSourcePath: string,
  repoName: string,
  importMode: GithubImportMode = 'skills-import'
): Promise<{ skillNames: string[]; records: InstallRecordInput[] }> {
  const records = await analyzeImportedSkills(importedSourcePath, repoName, importMode)
  await fs.mkdir(pairSourcePath, { recursive: true })

  for (const record of records) {
    const sourceEntryPath =
      record.sourceRelativePath === '.'
        ? importedSourcePath
        : path.join(importedSourcePath, record.sourceRelativePath)
    const destEntryPath = path.join(pairSourcePath, record.containerDirName)
    await fs.rm(destEntryPath, { recursive: true, force: true })
    if (importMode === 'agent-files-copy') {
      await fs.mkdir(destEntryPath, { recursive: true })
      for (const entry of JSON.parse(record.managedEntriesJson) as string[]) {
        await fs.copyFile(path.join(sourceEntryPath, entry), path.join(destEntryPath, entry))
      }
    } else {
      await fs.cp(sourceEntryPath, destEntryPath, { recursive: true, force: true })
    }
  }

  return {
    skillNames: records.map((record) => record.installedAs),
    records,
  }
}

export async function importProjectIntoPair(pair: Pair, githubUrl: string, importMode: GithubImportMode = 'skills-import') {
  const imported = await importGithubArchive(githubUrl)
  const projectTag = buildDefaultProjectTag(imported.repo)
  const copied = await copyImportedSourceToPair(imported.sourcePath, pair.sourcePath, imported.repo, importMode)
  const link = await linkProjectGroupToGithub(pair, projectTag, githubUrl, copied.skillNames)
  replaceInstallRecords(pair.id, link.sourceId, projectTag, copied.records)
  await archiveRemovedManagedSkills(pair.sourcePath, listInstallRecordsByPairIdAndTag(pair.id, projectTag))
  const managedRecords = listManagedInstallRecordsByPairIdAndTag(pair.id, projectTag)
  persistImportedProjectionLedger(
    pair,
    projectTag,
    managedRecords.map((record) => ({
      skillName: record.skillName,
      sourceRelativePath: record.sourceRelativePath,
      installedAs: record.installedAs,
      installMode: record.installMode,
      installReason: record.installReason,
      sourceRootKind: record.sourceRootKind,
      copyMode: record.copyMode,
      containerDirName: record.containerDirName,
      managedEntriesJson: record.managedEntriesJson,
      isRootSkillWrapped: !!record.isRootSkillWrapped,
      metadataJson: record.metadataJson,
    }))
  )

  return {
    projectTag,
    importedSkillNames: copied.skillNames,
    link,
  }
}
