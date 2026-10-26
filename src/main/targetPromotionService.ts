import { createHash, randomUUID } from 'crypto'
import fs from 'fs/promises'
import path from 'path'
import type { InstallRecord } from '../shared/importTypes'
import type { Pair, SkillMeta, SkillTargetPromotionStatus } from '../shared/types'
import { getManagedInstallRecordByPairIdAndSkillName } from './installRecordRepository'
import { getPair } from './pairRepository'
import { getSkillMeta, touchSkillTargetPromotedAt } from './skillMetaRepository'
import { nowEpoch } from './time'

interface PromotionContext {
  pair: Pair
  skillName: string
  record?: InstallRecord | null
  meta?: SkillMeta | null
}

interface DirectoryMapping {
  mode: 'directory-copy'
  sourceDir: string
  targetDir: string
}

function resolveDirectoryContainerName(skillName: string, record?: InstallRecord | null): string {
  return record?.containerDirName || record?.installedAs || skillName
}

function resolveDirectoryTargetName(skillName: string, record?: InstallRecord | null): string {
  return record?.installedAs || skillName
}

function resolvePromotionMapping(context: PromotionContext): DirectoryMapping | null {
  if (context.pair.projectionMode !== 'directory-copy') return null

  const sourceDirName = resolveDirectoryContainerName(context.skillName, context.record)
  const targetDirName = resolveDirectoryTargetName(context.skillName, context.record)

  return {
    mode: 'directory-copy',
    sourceDir: path.join(context.pair.sourcePath, sourceDirName),
    targetDir: path.join(context.pair.targetPath, targetDirName),
  }
}

async function pathExistsAsync(entryPath: string): Promise<boolean> {
  try {
    await fs.stat(entryPath)
    return true
  } catch {
    return false
  }
}

async function isValidSkillDirectory(dirPath: string): Promise<boolean> {
  return pathExistsAsync(path.join(dirPath, 'SKILL.md'))
}

async function collectDirectoryFingerprint(rootDir: string): Promise<string> {
  const entries: string[] = []

  async function walk(dirPath: string, relativeRoot: string) {
    const dirEntries = (await fs.readdir(dirPath, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))
    for (const entry of dirEntries) {
      const absolutePath = path.join(dirPath, entry.name)
      const relativePath = path.posix.join(relativeRoot, entry.name)
      if (entry.isDirectory()) {
        entries.push(`D:${relativePath}`)
        await walk(absolutePath, relativePath)
        continue
      }

      const content = await fs.readFile(absolutePath)
      const hash = createHash('sha1').update(content).digest('hex')
      entries.push(`F:${relativePath}:${hash}`)
    }
  }

  await walk(rootDir, '')
  return createHash('sha1').update(entries.join('\n')).digest('hex')
}

async function copyDirRecursive(sourceDir: string, destinationDir: string): Promise<void> {
  await fs.mkdir(destinationDir, { recursive: true })
  const entries = await fs.readdir(sourceDir, { withFileTypes: true })
  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name)
    const destinationPath = path.join(destinationDir, entry.name)
    if (entry.isDirectory()) {
      await copyDirRecursive(sourcePath, destinationPath)
      continue
    }

    await fs.mkdir(path.dirname(destinationPath), { recursive: true })
    await fs.copyFile(sourcePath, destinationPath)
  }
}

async function copyDirectoryToTemp(sourceDir: string, destinationParent: string, destinationName: string): Promise<string> {
  const tempDir = path.join(destinationParent, `.${destinationName}.promote-${randomUUID()}.tmp`)
  await fs.rm(tempDir, { recursive: true, force: true })
  await copyDirRecursive(sourceDir, tempDir)
  return tempDir
}

async function replaceDirectoryAtomically(tempDir: string, destinationDir: string): Promise<void> {
  const destinationParent = path.dirname(destinationDir)
  const destinationName = path.basename(destinationDir)
  const backupDir = path.join(destinationParent, `.${destinationName}.backup-${randomUUID()}`)
  const destinationExists = await pathExistsAsync(destinationDir)
  let backedUp = false

  try {
    if (destinationExists) {
      await fs.rename(destinationDir, backupDir)
      backedUp = true
    }

    await fs.rename(tempDir, destinationDir)

    if (backedUp) {
      await fs.rm(backupDir, { recursive: true, force: true })
    }
  } catch (error) {
    if (await pathExistsAsync(tempDir)) {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => undefined)
    }

    if (backedUp && !(await pathExistsAsync(destinationDir)) && (await pathExistsAsync(backupDir))) {
      await fs.rename(backupDir, destinationDir).catch(() => undefined)
    }

    throw error
  }
}

export async function getSkillTargetPromotionStatus(context: PromotionContext): Promise<SkillTargetPromotionStatus> {
  const mapping = resolvePromotionMapping(context)
  const lastTargetPromotedAt = context.meta?.lastTargetPromotedAt ?? 0
  if (!mapping) {
    return {
      canPromote: false,
      targetExists: false,
      targetDiffersFromSource: false,
      lastTargetPromotedAt,
      unsupportedReason: 'current projection mode does not support target-to-source promotion yet',
    }
  }

  const targetExists = await pathExistsAsync(mapping.targetDir)
  if (!targetExists) {
    return {
      canPromote: false,
      targetExists: false,
      targetDiffersFromSource: false,
      lastTargetPromotedAt,
      unsupportedReason: 'target skill directory does not exist',
    }
  }

  const validTarget = await isValidSkillDirectory(mapping.targetDir)
  if (!validTarget) {
    return {
      canPromote: false,
      targetExists: true,
      targetDiffersFromSource: false,
      lastTargetPromotedAt,
      unsupportedReason: 'target skill directory is missing SKILL.md',
    }
  }

  const sourceExists = await pathExistsAsync(mapping.sourceDir)
  if (!sourceExists) {
    return {
      canPromote: true,
      targetExists: true,
      targetDiffersFromSource: true,
      lastTargetPromotedAt,
      unsupportedReason: '',
    }
  }

  const sourceFingerprint = await collectDirectoryFingerprint(mapping.sourceDir)
  const targetFingerprint = await collectDirectoryFingerprint(mapping.targetDir)
  return {
    canPromote: true,
    targetExists: true,
    targetDiffersFromSource: sourceFingerprint !== targetFingerprint,
    lastTargetPromotedAt,
    unsupportedReason: '',
  }
}

export async function promoteSkillTargetToSource(context: PromotionContext): Promise<{ promotedAt: number }> {
  const mapping = resolvePromotionMapping(context)
  if (!mapping) {
    throw new Error('目前投影模式暫不支援從目標更新到主倉庫')
  }

  const validTarget = await isValidSkillDirectory(mapping.targetDir)
  if (!validTarget) {
    throw new Error('目標目錄中找不到有效的 SKILL.md，無法更新到主倉庫')
  }

  const sourceParent = path.dirname(mapping.sourceDir)
  const sourceDirName = path.basename(mapping.sourceDir)
  const tempDir = await copyDirectoryToTemp(mapping.targetDir, sourceParent, sourceDirName)

  await replaceDirectoryAtomically(tempDir, mapping.sourceDir)
  return { promotedAt: nowEpoch() }
}

export async function getSkillTargetPromotionStatusForPair(
  pairId: number,
  skillName: string
): Promise<SkillTargetPromotionStatus> {
  const pair = getPair(pairId)
  if (!pair) {
    throw new Error(`Pair 不存在：${pairId}`)
  }

  return getSkillTargetPromotionStatus({
    pair,
    skillName,
    record: getManagedInstallRecordByPairIdAndSkillName(pairId, skillName),
    meta: getSkillMeta(pairId, skillName),
  })
}

export async function promoteSkillTargetToSourceForPair(
  pairId: number,
  skillName: string
): Promise<SkillTargetPromotionStatus> {
  const pair = getPair(pairId)
  if (!pair) {
    throw new Error(`Pair 不存在：${pairId}`)
  }

  const record = getManagedInstallRecordByPairIdAndSkillName(pairId, skillName)
  const meta = getSkillMeta(pairId, skillName)
  const { promotedAt } = await promoteSkillTargetToSource({ pair, skillName, record, meta })
  touchSkillTargetPromotedAt(pairId, skillName, promotedAt)
  return getSkillTargetPromotionStatus({ pair, skillName, record, meta: getSkillMeta(pairId, skillName) })
}
