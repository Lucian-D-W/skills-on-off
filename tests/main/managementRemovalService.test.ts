import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { afterEach, describe, expect, test } from 'vitest'
import {
  archiveManagedSkillDirectory,
  buildManagedRemovalArchivePath,
  listManagedInstallRecords,
  type InstallRecordLike,
} from '../../src/main/managementRemovalService'

const tempRoots: string[] = []

async function makeTempDir(prefix: string) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), prefix))
  tempRoots.push(dir)
  return dir
}

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })))
})

function makeRecord(overrides: Partial<InstallRecordLike> = {}): InstallRecordLike {
  return {
    projectTag: 'gstack',
    skillName: 'alpha',
    installedAs: 'alpha',
    managementState: 'managed',
    ...overrides,
  }
}

describe('buildManagedRemovalArchivePath', () => {
  test('archives removed skills under a hidden folder in the pair source root', () => {
    const archivePath = buildManagedRemovalArchivePath('C:\\skills', 'gstack', 'alpha')
    expect(archivePath).toBe(path.join('C:\\skills', '.removed-managed', 'gstack', 'alpha'))
  })
})

describe('archiveManagedSkillDirectory', () => {
  test('moves a managed skill directory out of the source root without deleting its contents', async () => {
    const sourceRoot = await makeTempDir('removed-managed-source-')
    const skillDir = path.join(sourceRoot, 'alpha')
    await fs.mkdir(skillDir, { recursive: true })
    await fs.writeFile(path.join(skillDir, 'SKILL.md'), '# alpha\n', 'utf8')

    const archivePath = await archiveManagedSkillDirectory(sourceRoot, 'gstack', 'alpha')

    await expect(fs.stat(path.join(sourceRoot, 'alpha'))).rejects.toThrow()
    await expect(fs.readFile(path.join(archivePath, 'SKILL.md'), 'utf8')).resolves.toContain('alpha')
  })
})

describe('listManagedInstallRecords', () => {
  test('filters removed skills out of the managed reconciliation set', () => {
    const records = [
      makeRecord({ skillName: 'alpha', installedAs: 'alpha', managementState: 'managed' }),
      makeRecord({ skillName: 'beta', installedAs: 'beta', managementState: 'removed' }),
      makeRecord({ skillName: 'gamma', installedAs: 'gamma', managementState: 'managed' }),
    ]

    expect(listManagedInstallRecords(records).map((record) => record.skillName)).toEqual(['alpha', 'gamma'])
  })
})
