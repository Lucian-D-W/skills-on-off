import fs from 'fs'
import path from 'path'
import type { CopyMode } from '../shared/importTypes'
import { isCommonAgentFileName } from './copyModes'

function safeReadDir(dirPath: string): fs.Dirent[] {
  try {
    return fs.readdirSync(dirPath, { withFileTypes: true })
  } catch {
    return []
  }
}

export function parseManagedEntryNames(rawJson: string): string[] {
  if (!rawJson.trim()) return []
  try {
    const parsed = JSON.parse(rawJson) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
  } catch {
    return []
  }
}

export function stringifyManagedEntryNames(entries: string[]): string {
  return JSON.stringify([...new Set(entries)].sort((a, b) => a.localeCompare(b)))
}

export function collectManagedEntryNames(containerPath: string, copyMode: CopyMode): string[] {
  if (copyMode === 'directory-copy') return []

  const entries = safeReadDir(containerPath)
  const names: string[] = []

  for (const entry of entries) {
    if (copyMode === 'agent-files-copy') {
      if (entry.isFile() && isCommonAgentFileName(entry.name)) names.push(entry.name)
      continue
    }

    names.push(entry.name)
  }

  return [...new Set(names)].sort((a, b) => a.localeCompare(b))
}

export function pathExistsSync(entryPath: string): boolean {
  try {
    fs.statSync(entryPath)
    return true
  } catch {
    return false
  }
}

export function resolveManagedEntryNames(
  containerPath: string,
  copyMode: CopyMode,
  managedEntriesJson: string
): string[] {
  const fromRecord = parseManagedEntryNames(managedEntriesJson)
  return fromRecord.length > 0 ? fromRecord : collectManagedEntryNames(containerPath, copyMode)
}

export function hasAnyManagedTargetEntry(targetRoot: string, entryNames: string[]): boolean {
  return entryNames.some((entryName) => pathExistsSync(path.join(targetRoot, entryName)))
}
