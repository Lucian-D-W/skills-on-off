import type { CopyMode } from '../shared/importTypes'

export const COMMON_AGENT_FILE_NAMES = ['agents.md', 'claude.md'] as const

export function isCommonAgentFileName(fileName: string): boolean {
  return COMMON_AGENT_FILE_NAMES.includes(fileName.toLowerCase() as (typeof COMMON_AGENT_FILE_NAMES)[number])
}

export function isContentCopyMode(copyMode: CopyMode): boolean {
  return copyMode === 'directory-contents-copy' || copyMode === 'agent-files-copy'
}
