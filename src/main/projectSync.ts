import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'
import type { InstallRecord, PairProjectionMode, SyncHealthState, UpdateState, ProjectSyncReport } from '../shared/importTypes'
import type { SkillMeta } from '../shared/types'
import { isManagedRecordEnabled, isManagedRecordSourcePresent, enableSkill, disableSkill, usesDirectoryContainer } from './fileOps'
import { parseManagedEntryNames } from './contentProjection'

type ManagedProjectionRecord = Pick<InstallRecord, 'skillName' | 'installedAs' | 'copyMode' | 'containerDirName' | 'managedEntriesJson'> & Partial<Pick<InstallRecord, 'metadataJson'>>

interface ProjectSyncInput {
  projectTag: string
  sourcePath: string
  targetPath: string
  metas: SkillMeta[]
  managedRecords?: ManagedProjectionRecord[]
  managedSkillNamesOverride?: string[]
  localCommitSha: string
  remoteCommitSha: string
  checkedAt: number
  syncedAt: number
  projectionMode?: PairProjectionMode
  error?: string
}

interface RepairProjectTargetsInput extends ProjectSyncInput {
  activeSkillNames: string[]
}

function parseTags(raw: string): string[] {
  return raw
    .split(/\s+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
}

async function listSkillDirs(rootPath: string): Promise<string[]> {
  const entries = await fs.readdir(rootPath, { withFileTypes: true }).catch(() => [])
  const skillNames: string[] = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const manifestPath = path.join(rootPath, entry.name, 'SKILL.md')
    const isSkill = await fs
      .stat(manifestPath)
      .then((stat) => stat.isFile())
      .catch(() => false)

    if (isSkill) skillNames.push(entry.name)
  }

  return skillNames.sort((a, b) => a.localeCompare(b))
}

async function walkFiles(rootPath: string, currentPath = rootPath): Promise<string[]> {
  const entries = await fs.readdir(currentPath, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const entryPath = path.join(currentPath, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(rootPath, entryPath)))
      continue
    }
    if (entry.isFile()) {
      files.push(path.relative(rootPath, entryPath))
    }
  }

  return files.sort((a, b) => a.localeCompare(b))
}

async function hashDirectory(dirPath: string): Promise<string> {
  const hash = crypto.createHash('sha1')
  const files = await walkFiles(dirPath)

  for (const relativePath of files) {
    const filePath = path.join(dirPath, relativePath)
    const content = await fs.readFile(filePath)
    hash.update(relativePath)
    hash.update('\0')
    hash.update(content)
    hash.update('\0')
  }

  return hash.digest('hex')
}

async function hashManagedEntries(rootPath: string, entryNames: string[]): Promise<string> {
  const hash = crypto.createHash('sha1')

  for (const entryName of [...new Set(entryNames)].sort((a, b) => a.localeCompare(b))) {
    const fullPath = path.join(rootPath, entryName)
    const stat = await fs.stat(fullPath).catch(() => null)

    hash.update(entryName)
    hash.update('\0')

    if (!stat) {
      hash.update('__missing__')
      hash.update('\0')
      continue
    }

    if (stat.isDirectory()) {
      const files = await walkFiles(fullPath)
      for (const relativePath of files) {
        const content = await fs.readFile(path.join(fullPath, relativePath))
        hash.update(path.posix.join(entryName, relativePath.split(path.sep).join(path.posix.sep)))
        hash.update('\0')
        hash.update(content)
        hash.update('\0')
      }
      continue
    }

    const content = await fs.readFile(fullPath)
    hash.update(content)
    hash.update('\0')
  }

  return hash.digest('hex')
}

function makeDefaultManagedRecord(
  skillName: string
): ManagedProjectionRecord {
  return {
    skillName,
    installedAs: skillName,
    copyMode: 'directory-copy',
    containerDirName: skillName,
    managedEntriesJson: '[]',
  }
}

function deriveManagedSkillNames(
  projectTag: string,
  metas: SkillMeta[],
  sourceSkillNames: string[],
  targetSkillNames: string[],
  projectionMode: PairProjectionMode
): string[] {
  const taggedSkills = new Set(
    metas
      .filter((meta) =>
        parseTags(projectionMode === 'directory-contents-copy' ? meta.customTags : meta.projectTags).includes(projectTag)
      )
      .map((meta) => meta.skillName)
      .filter(Boolean)
  )

  if (taggedSkills.size === 0) return [...sourceSkillNames]

  const knownSkills = new Set([...sourceSkillNames, ...targetSkillNames])
  return [...taggedSkills]
    .filter((skillName) => knownSkills.has(skillName))
    .sort((a, b) => a.localeCompare(b))
}

export function resolveProjectUpdateState({
  localCommitSha,
  remoteCommitSha,
  error,
}: {
  localCommitSha: string
  remoteCommitSha: string
  error: string
}): UpdateState {
  if (error) return 'error'
  if (!localCommitSha) return 'not-synced'
  if (remoteCommitSha && localCommitSha !== remoteCommitSha) return 'update-available'
  return 'up-to-date'
}

export async function inspectProjectGroupSync(input: ProjectSyncInput): Promise<ProjectSyncReport> {
  const projectionMode = input.projectionMode ?? 'directory-copy'
  const sourceSkillDirNames = await listSkillDirs(input.sourcePath)
  const targetSkillNames = await listSkillDirs(input.targetPath)
  const fallbackManagedSkillNames = deriveManagedSkillNames(
    input.projectTag,
    input.metas,
    sourceSkillDirNames,
    targetSkillNames,
    projectionMode
  )
  const effectiveManagedRecords =
    input.managedRecords && input.managedRecords.length > 0
      ? [...input.managedRecords].sort((a, b) => a.skillName.localeCompare(b.skillName))
      : (input.managedSkillNamesOverride ?? fallbackManagedSkillNames).map((skillName) => makeDefaultManagedRecord(skillName))
  const effectiveManagedSkillNames = effectiveManagedRecords.map((record) => record.skillName)

  const sourceSkillNames = [
    ...new Set([
      ...sourceSkillDirNames,
      ...effectiveManagedRecords
        .filter((record) => isManagedRecordSourcePresent(input.sourcePath, record.skillName, record))
        .map((record) => record.skillName),
    ]),
  ].sort((a, b) => a.localeCompare(b))

  const enabledSkillNames = effectiveManagedRecords
    .filter((record) => isManagedRecordEnabled(input.targetPath, record.skillName, record, { projectionMode }))
    .map((record) => record.skillName)
  const orphanedTargetSkillNames = effectiveManagedRecords
    .filter(
      (record) =>
        isManagedRecordEnabled(input.targetPath, record.skillName, record, { projectionMode }) &&
        !isManagedRecordSourcePresent(input.sourcePath, record.skillName, record)
    )
    .map((record) => record.skillName)
  const staleSkillNames: string[] = []

  for (const record of effectiveManagedRecords) {
    if (!enabledSkillNames.includes(record.skillName)) continue
    if (!isManagedRecordSourcePresent(input.sourcePath, record.skillName, record)) continue

    if (usesDirectoryContainer(record, projectionMode)) {
      const [sourceHash, targetHash] = await Promise.all([
        hashDirectory(path.join(input.sourcePath, record.containerDirName)),
        hashDirectory(path.join(input.targetPath, record.installedAs)),
      ])
      if (sourceHash !== targetHash) staleSkillNames.push(record.skillName)
      continue
    }

    const managedEntries = parseManagedEntryNames(record.managedEntriesJson)
    const [sourceHash, targetHash] = await Promise.all([
      hashManagedEntries(path.join(input.sourcePath, record.containerDirName), managedEntries),
      hashManagedEntries(input.targetPath, managedEntries),
    ])

    if (sourceHash !== targetHash) staleSkillNames.push(record.skillName)
  }

  let healthState: SyncHealthState = 'healthy'
  if (input.error) healthState = 'error'
  else if (staleSkillNames.length > 0 || orphanedTargetSkillNames.length > 0) healthState = 'repair-needed'

  return {
    projectTag: input.projectTag,
    updateState: resolveProjectUpdateState({
      localCommitSha: input.localCommitSha,
      remoteCommitSha: input.remoteCommitSha,
      error: input.error ?? '',
    }),
    healthState,
    localCommitSha: input.localCommitSha,
    remoteCommitSha: input.remoteCommitSha,
    checkedAt: input.checkedAt,
    syncedAt: input.syncedAt,
    sourceSkillNames,
    managedSkillNames: effectiveManagedSkillNames,
    enabledSkillNames,
    staleSkillNames,
    orphanedTargetSkillNames,
    error: input.error ?? '',
  }
}

async function copySkill(sourcePath: string, targetPath: string, skillName: string) {
  const sourceSkillPath = path.join(sourcePath, skillName)
  const targetSkillPath = path.join(targetPath, skillName)
  await fs.rm(targetSkillPath, { recursive: true, force: true })
  await fs.cp(sourceSkillPath, targetSkillPath, { recursive: true, force: true })
}

export async function repairProjectGroupTargets(input: RepairProjectTargetsInput): Promise<ProjectSyncReport> {
  await fs.mkdir(input.targetPath, { recursive: true })
  if (input.managedRecords && input.managedRecords.length > 0) {
    const activeSet = new Set(input.activeSkillNames)
    const projectionMode = input.projectionMode ?? 'directory-copy'

    for (const record of input.managedRecords) {
      const result =
        activeSet.has(record.skillName) && isManagedRecordSourcePresent(input.sourcePath, record.skillName, record)
          ? enableSkill(input.sourcePath, input.targetPath, record.skillName, record, { projectionMode })
          : disableSkill(input.targetPath, record.skillName, record, { projectionMode, sourcePath: input.sourcePath })

      if (!result.ok) {
        throw new Error(result.error ?? `修復失敗：${record.skillName}`)
      }
    }

    return inspectProjectGroupSync(input)
  }

  const sourceSkillDirNames = await listSkillDirs(input.sourcePath)
  const sourceSet = new Set(sourceSkillDirNames)

  for (const skillName of input.activeSkillNames) {
    if (sourceSet.has(skillName)) {
      await copySkill(input.sourcePath, input.targetPath, skillName)
      continue
    }

    await fs.rm(path.join(input.targetPath, skillName), { recursive: true, force: true })
  }

  return inspectProjectGroupSync(input)
}
