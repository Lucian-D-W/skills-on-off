import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { afterEach, describe, expect, test } from 'vitest'
import type { SkillMeta } from '../../src/shared/types'
import {
  inspectProjectGroupSync,
  repairProjectGroupTargets,
  resolveProjectUpdateState,
} from '../../src/main/projectSync'
import type { InstallRecord } from '../../src/shared/importTypes'

const tempRoots: string[] = []

async function makeTempDir(prefix: string) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), prefix))
  tempRoots.push(dir)
  return dir
}

async function writeSkill(rootPath: string, skillName: string, body = `# ${skillName}\n`) {
  const skillDir = path.join(rootPath, skillName)
  await fs.mkdir(skillDir, { recursive: true })
  await fs.writeFile(path.join(skillDir, 'SKILL.md'), body, 'utf8')
}

function makeMeta(skillName: string, projectTags: string): SkillMeta {
  return {
    id: 1,
    pairId: 1,
    skillName,
    note: '',
    projectTags,
    funcTags: '',
    customTags: '',
  }
}

function makeInstallRecord(
  skillName: string,
  overrides: Partial<Pick<InstallRecord, 'installedAs' | 'copyMode' | 'containerDirName' | 'managedEntriesJson'>> = {}
): Pick<InstallRecord, 'skillName' | 'installedAs' | 'copyMode' | 'containerDirName' | 'managedEntriesJson'> {
  return {
    skillName,
    installedAs: skillName,
    copyMode: 'directory-copy',
    containerDirName: skillName,
    managedEntriesJson: '[]',
    ...overrides,
  }
}

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })))
})

describe('inspectProjectGroupSync', () => {
  test('limits managed skills to the tagged project group and reports stale plus orphan target skills', async () => {
    const sourcePath = await makeTempDir('skill-sync-source-')
    const targetPath = await makeTempDir('skill-sync-target-')

    await writeSkill(sourcePath, 'alpha', '# alpha source\n')
    await writeSkill(sourcePath, 'beta', '# beta source\n')
    await writeSkill(sourcePath, 'gamma', '# gamma source\n')

    await writeSkill(targetPath, 'alpha', '# alpha target stale\n')
    await writeSkill(targetPath, 'beta', '# beta source\n')
    await writeSkill(targetPath, 'ghost', '# ghost target only\n')

    const report = await inspectProjectGroupSync({
      projectTag: 'gstack',
      sourcePath,
      targetPath,
      metas: [
        makeMeta('alpha', 'gstack'),
        makeMeta('beta', 'gstack'),
        makeMeta('gamma', 'other-tag'),
        makeMeta('ghost', 'gstack'),
      ],
      localCommitSha: 'local-sha',
      remoteCommitSha: 'local-sha',
      checkedAt: 100,
      syncedAt: 90,
    })

    expect(report.managedSkillNames).toEqual(['alpha', 'beta', 'ghost'])
    expect(report.enabledSkillNames).toEqual(['alpha', 'beta', 'ghost'])
    expect(report.staleSkillNames).toEqual(['alpha'])
    expect(report.orphanedTargetSkillNames).toEqual(['ghost'])
    expect(report.healthState).toBe('repair-needed')
    expect(report.updateState).toBe('up-to-date')
  })

  test('falls back to all source skills when the project tag has not been written into skill meta yet', async () => {
    const sourcePath = await makeTempDir('skill-sync-source-')
    const targetPath = await makeTempDir('skill-sync-target-')

    await writeSkill(sourcePath, 'alpha')
    await writeSkill(sourcePath, 'beta')
    await writeSkill(targetPath, 'alpha')

    const report = await inspectProjectGroupSync({
      projectTag: 'gstack',
      sourcePath,
      targetPath,
      metas: [makeMeta('alpha', 'other-tag')],
      localCommitSha: '',
      remoteCommitSha: 'remote-sha',
      checkedAt: 100,
      syncedAt: 0,
    })

    expect(report.managedSkillNames).toEqual(['alpha', 'beta'])
    expect(report.enabledSkillNames).toEqual(['alpha'])
    expect(report.updateState).toBe('not-synced')
  })

  test('excludes removed install records from the managed reconciliation set when an override is provided', async () => {
    const sourcePath = await makeTempDir('skill-sync-source-')
    const targetPath = await makeTempDir('skill-sync-target-')

    await writeSkill(sourcePath, 'alpha')
    await writeSkill(sourcePath, 'beta')
    await writeSkill(targetPath, 'alpha')
    await writeSkill(targetPath, 'beta')

    const report = await inspectProjectGroupSync({
      projectTag: 'gstack',
      sourcePath,
      targetPath,
      metas: [makeMeta('alpha', 'gstack'), makeMeta('beta', 'gstack')],
      localCommitSha: 'local-sha',
      remoteCommitSha: 'local-sha',
      checkedAt: 100,
      syncedAt: 90,
      managedSkillNamesOverride: ['alpha'],
    })

    expect(report.managedSkillNames).toEqual(['alpha'])
    expect(report.enabledSkillNames).toEqual(['alpha'])
  })

  test('tracks directory-contents-copy installs as managed content instead of requiring a SKILL.md directory in target', async () => {
    const sourcePath = await makeTempDir('skill-sync-source-')
    const targetPath = await makeTempDir('skill-sync-target-')
    const container = path.join(sourcePath, 'gstack-agent-files')

    await fs.mkdir(path.join(container, 'rules'), { recursive: true })
    await fs.writeFile(path.join(container, 'AGENTS.md'), '# agents source\n', 'utf8')
    await fs.writeFile(path.join(container, 'rules', 'base.md'), '# base source\n', 'utf8')

    await fs.writeFile(path.join(targetPath, 'AGENTS.md'), '# agents source\n', 'utf8')
    await fs.mkdir(path.join(targetPath, 'rules'), { recursive: true })
    await fs.writeFile(path.join(targetPath, 'rules', 'base.md'), '# stale target\n', 'utf8')

    const report = await inspectProjectGroupSync({
      projectTag: 'custom',
      sourcePath,
      targetPath,
      metas: [makeMeta('gstack-agent-files', 'custom')],
      managedRecords: [
        makeInstallRecord('gstack-agent-files', {
          copyMode: 'directory-contents-copy',
          containerDirName: 'gstack-agent-files',
          managedEntriesJson: JSON.stringify(['AGENTS.md', 'rules']),
        }),
      ],
      localCommitSha: 'local-sha',
      remoteCommitSha: 'local-sha',
      checkedAt: 100,
      syncedAt: 90,
    })

    expect(report.managedSkillNames).toEqual(['gstack-agent-files'])
    expect(report.enabledSkillNames).toEqual(['gstack-agent-files'])
    expect(report.staleSkillNames).toEqual(['gstack-agent-files'])
    expect(report.healthState).toBe('repair-needed')
  })
})

describe('repairProjectGroupTargets', () => {
  test('overwrites stale enabled skills and removes orphan target skills', async () => {
    const sourcePath = await makeTempDir('skill-sync-source-')
    const targetPath = await makeTempDir('skill-sync-target-')

    await writeSkill(sourcePath, 'alpha', '# alpha fresh\n')
    await writeSkill(sourcePath, 'beta', '# beta fresh\n')
    await writeSkill(targetPath, 'alpha', '# alpha stale\n')
    await writeSkill(targetPath, 'ghost', '# ghost target only\n')

    const repaired = await repairProjectGroupTargets({
      projectTag: 'gstack',
      sourcePath,
      targetPath,
      metas: [makeMeta('alpha', 'gstack'), makeMeta('beta', 'gstack'), makeMeta('ghost', 'gstack')],
      activeSkillNames: ['alpha', 'ghost'],
      localCommitSha: 'local-sha',
      remoteCommitSha: 'local-sha',
      checkedAt: 100,
      syncedAt: 90,
    })

    expect(repaired.healthState).toBe('healthy')
    expect(repaired.orphanedTargetSkillNames).toEqual([])
    expect(repaired.staleSkillNames).toEqual([])
    await expect(fs.readFile(path.join(targetPath, 'alpha', 'SKILL.md'), 'utf8')).resolves.toBe('# alpha fresh\n')
    await expect(fs.stat(path.join(targetPath, 'ghost'))).rejects.toThrow()
  })

  test('repairs managed directory contents in target root for directory-contents-copy installs', async () => {
    const sourcePath = await makeTempDir('skill-sync-source-')
    const targetPath = await makeTempDir('skill-sync-target-')
    const container = path.join(sourcePath, 'gstack-agent-files')

    await fs.mkdir(path.join(container, 'rules'), { recursive: true })
    await fs.writeFile(path.join(container, 'AGENTS.md'), '# agents fresh\n', 'utf8')
    await fs.writeFile(path.join(container, 'rules', 'base.md'), '# base fresh\n', 'utf8')

    await fs.writeFile(path.join(targetPath, 'AGENTS.md'), '# agents stale\n', 'utf8')
    await fs.mkdir(path.join(targetPath, 'rules'), { recursive: true })
    await fs.writeFile(path.join(targetPath, 'rules', 'base.md'), '# base stale\n', 'utf8')

    const repaired = await repairProjectGroupTargets({
      projectTag: 'custom',
      sourcePath,
      targetPath,
      metas: [makeMeta('gstack-agent-files', 'custom')],
      managedRecords: [
        makeInstallRecord('gstack-agent-files', {
          copyMode: 'directory-contents-copy',
          containerDirName: 'gstack-agent-files',
          managedEntriesJson: JSON.stringify(['AGENTS.md', 'rules']),
        }),
      ],
      activeSkillNames: ['gstack-agent-files'],
      localCommitSha: 'local-sha',
      remoteCommitSha: 'local-sha',
      checkedAt: 100,
      syncedAt: 90,
    })

    expect(repaired.healthState).toBe('healthy')
    await expect(fs.readFile(path.join(targetPath, 'AGENTS.md'), 'utf8')).resolves.toBe('# agents fresh\n')
    await expect(fs.readFile(path.join(targetPath, 'rules', 'base.md'), 'utf8')).resolves.toBe('# base fresh\n')
  })
})

describe('resolveProjectUpdateState', () => {
  test('distinguishes not-synced, update-available, up-to-date, and error states', () => {
    expect(resolveProjectUpdateState({ localCommitSha: '', remoteCommitSha: 'remote-sha', error: '' })).toBe('not-synced')
    expect(resolveProjectUpdateState({ localCommitSha: 'local-sha', remoteCommitSha: 'remote-sha', error: '' })).toBe('update-available')
    expect(resolveProjectUpdateState({ localCommitSha: 'same-sha', remoteCommitSha: 'same-sha', error: '' })).toBe('up-to-date')
    expect(resolveProjectUpdateState({ localCommitSha: 'same-sha', remoteCommitSha: '', error: 'boom' })).toBe('error')
  })
})
