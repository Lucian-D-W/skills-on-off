import fs from 'fs'
import path from 'path'
import type { InstallRecord } from '../shared/importTypes'
import type { PairProjectionMode } from '../shared/importTypes'
import type { SkillItem, SkillMeta } from '../shared/types'
import { isContentCopyMode } from './copyModes'
import { hasAnyManagedTargetEntry, pathExistsSync, resolveManagedEntryNames } from './contentProjection'

function dirExists(p: string): boolean {
  try {
    return fs.statSync(p).isDirectory()
  } catch {
    return false
  }
}

/** Return subdirectory names one level deep */
function listSubDirs(dir: string): string[] {
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .filter((name) => fs.existsSync(path.join(dir, name, 'SKILL.md')))
  } catch {
    return []
  }
}

/** Recursively copy src → dest, overwriting if needed */
function copyDirRecursive(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true })
  const entries = fs.readdirSync(src, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

/** Recursively delete a directory */
function removeDir(p: string): void {
  fs.rmSync(p, { recursive: true, force: true })
}

function removePath(p: string): void {
  fs.rmSync(p, { recursive: true, force: true })
}

function copyPath(src: string, dest: string): void {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    copyDirRecursive(src, dest)
    return
  }

  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
}

function listDirectEntryNames(dir: string): string[] {
  try {
    return fs.readdirSync(dir, { withFileTypes: true }).map((entry) => entry.name)
  } catch {
    return []
  }
}

export interface ManagedInstallRecordLike {
  skillName: string
  installedAs: string
  copyMode: InstallRecord['copyMode']
  containerDirName: string
  managedEntriesJson: string
  managementState?: InstallRecord['managementState']
  metadataJson?: string
}

function resolveInstalledDirectoryName(skillName: string, record?: ManagedInstallRecordLike): string {
  return record?.installedAs || skillName
}

function resolveContainerDirName(skillName: string, record?: ManagedInstallRecordLike): string {
  return record?.containerDirName || resolveInstalledDirectoryName(skillName, record)
}

function resolveCopyMode(record?: ManagedInstallRecordLike): InstallRecord['copyMode'] {
  return record?.copyMode ?? 'directory-copy'
}

export function usesDirectoryContainer(record: ManagedInstallRecordLike | undefined, projectionMode: PairProjectionMode): boolean {
  if (isContentCopyMode(resolveCopyMode(record))) return false
  if (projectionMode === 'directory-copy') return true
  try {
    return JSON.parse(record?.metadataJson || '{}').importMode === 'directory-copy'
  } catch {
    return false
  }
}

function resolveManagedEntries(sourcePath: string, skillName: string, record?: ManagedInstallRecordLike): string[] {
  if (!record) return []
  const containerPath = path.join(sourcePath, resolveContainerDirName(skillName, record))
  return resolveManagedEntryNames(containerPath, record.copyMode, record.managedEntriesJson)
}

export function isManagedRecordSourcePresent(sourcePath: string, skillName: string, record?: ManagedInstallRecordLike): boolean {
  const containerDirName = resolveContainerDirName(skillName, record)
  return dirExists(path.join(sourcePath, containerDirName))
}

export function isManagedRecordEnabled(
  targetPath: string,
  skillName: string,
  record?: ManagedInstallRecordLike,
  options?: PairProjectionOptions
): boolean {
  const projectionMode = options?.projectionMode ?? 'directory-copy'
  const copyMode = resolveCopyMode(record)
  if (usesDirectoryContainer(record, projectionMode)) {
    return dirExists(path.join(targetPath, resolveInstalledDirectoryName(skillName, record)))
  }

  const entryNames = record
    ? resolveManagedEntryNames(path.join(targetPath, '..', '__unused__'), copyMode, record.managedEntriesJson)
    : []
  return hasAnyManagedTargetEntry(targetPath, entryNames)
}

export interface ScanOptions {
  sourcePath: string
  targetPath: string
  metas: SkillMeta[]
  installRecords?: ManagedInstallRecordLike[]
  projectionMode?: PairProjectionMode
}

export interface ScanResult {
  skills: SkillItem[]
  error?: string
}

export function scanSkills(opts: ScanOptions): ScanResult {
  const { sourcePath, targetPath, metas } = opts
  const projectionMode = opts.projectionMode ?? 'directory-copy'

  if (!dirExists(sourcePath)) {
    return { skills: [], error: `來源資料夾不存在：${sourcePath}` }
  }
  if (!dirExists(targetPath)) {
    return { skills: [], error: `目標資料夾不存在：${targetPath}` }
  }

  const sourceSkills = new Set(listSubDirs(sourcePath))
  const targetSkills = new Set(listSubDirs(targetPath))
  const managedRecords = (opts.installRecords ?? []).filter((record) => record.managementState !== 'removed')
  const managedNames = new Set(managedRecords.map((record) => record.skillName))
  const metaMap = new Map<string, SkillMeta>()
  for (const m of metas) metaMap.set(m.skillName, m)

  const skillMap = new Map<string, SkillItem>()

  // Skills that exist in source (normal)
  for (const name of sourceSkills) {
    if (managedNames.has(name)) continue
    const enabled =
      projectionMode === 'directory-copy'
        ? targetSkills.has(name)
        : listDirectEntryNames(path.join(sourcePath, name)).some((entryName) =>
            pathExistsSync(path.join(targetPath, entryName))
          )
    skillMap.set(name, {
      name,
      enabled,
      orphan: false,
      meta: metaMap.get(name) ?? null
    })
  }

  // Orphans: in target but not in source
  for (const name of targetSkills) {
    if (!sourceSkills.has(name) && !managedNames.has(name)) {
      skillMap.set(name, {
        name,
        enabled: true,
        orphan: true,
        meta: metaMap.get(name) ?? null
      })
    }
  }

  for (const record of managedRecords) {
    const name = record.skillName
    const sourceExists = isManagedRecordSourcePresent(sourcePath, name, record)
    const enabled = isManagedRecordEnabled(targetPath, name, record, { projectionMode })
    skillMap.set(name, {
      name,
      enabled,
      orphan: !sourceExists && enabled,
      meta: metaMap.get(name) ?? null
    })
  }

  const skills = [...skillMap.values()]
  skills.sort((a, b) => a.name.localeCompare(b.name))
  return { skills }
}

export interface EnableResult {
  ok: boolean
  error?: string
}

export interface PairProjectionOptions {
  projectionMode?: PairProjectionMode
  sourcePath?: string
}

export function enableSkill(
  sourcePath: string,
  targetPath: string,
  skillName: string,
  record?: ManagedInstallRecordLike,
  options?: PairProjectionOptions
): EnableResult {
  const projectionMode = options?.projectionMode ?? 'directory-copy'
  const copyMode = resolveCopyMode(record)
  const src = path.join(sourcePath, resolveContainerDirName(skillName, record))
  const dest = path.join(targetPath, resolveInstalledDirectoryName(skillName, record))

  if (!dirExists(sourcePath)) return { ok: false, error: `來源資料夾不存在：${sourcePath}` }
  if (!dirExists(targetPath)) return { ok: false, error: `目標資料夾不存在：${targetPath}` }
  if (!dirExists(src)) return { ok: false, error: `Skill 來源不存在：${src}` }

  try {
    if (usesDirectoryContainer(record, projectionMode)) {
      copyDirRecursive(src, dest)
      return { ok: true }
    }

    const entryNames = record ? resolveManagedEntries(sourcePath, skillName, record) : listDirectEntryNames(src)
    if (!entryNames.length) {
      return { ok: false, error: `找不到可同步的內容：${skillName}` }
    }

    for (const entryName of entryNames) {
      copyPath(path.join(src, entryName), path.join(targetPath, entryName))
    }

    return { ok: true }
  } catch (e: unknown) {
    return { ok: false, error: `複製失敗：${(e as Error).message}` }
  }
}

export function disableSkill(
  targetPath: string,
  skillName: string,
  record?: ManagedInstallRecordLike,
  options?: PairProjectionOptions
): EnableResult {
  const projectionMode = options?.projectionMode ?? 'directory-copy'
  const copyMode = resolveCopyMode(record)
  const dest = path.join(targetPath, resolveInstalledDirectoryName(skillName, record))
  try {
    if (usesDirectoryContainer(record, projectionMode)) {
      if (!dirExists(dest)) return { ok: true }
      removeDir(dest)
      return { ok: true }
    }

    const entryNames = record
      ? resolveManagedEntryNames('', copyMode, record.managedEntriesJson)
      : options?.sourcePath
        ? listDirectEntryNames(path.join(options.sourcePath, skillName))
        : []
    for (const entryName of entryNames) {
      removePath(path.join(targetPath, entryName))
    }
    return { ok: true }
  } catch (e: unknown) {
    return { ok: false, error: `刪除失敗：${(e as Error).message}` }
  }
}
