import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { afterEach, describe, expect, test } from 'vitest'
import { SCHEMA_SQL } from '../../src/main/migrations'
import { analyzeImportedSkills, copyImportedSourceToPair, resolveRecordedImportMode } from '../../src/main/projectLinking'
import { disableSkill, enableSkill, scanSkills } from '../../src/main/fileOps'
import { inspectProjectGroupSync } from '../../src/main/projectSync'

const tempRoots: string[] = []

async function makeTempDir(prefix: string) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), prefix))
  tempRoots.push(dir)
  return dir
}

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })))
})

describe('SCHEMA_SQL install ledger support', () => {
  test('stores pair projection mode for target layout decisions', () => {
    expect(SCHEMA_SQL).toContain("projectionMode TEXT NOT NULL DEFAULT 'directory-copy'")
  })

  test('declares install_records for import bookkeeping and reconciliation', () => {
    expect(SCHEMA_SQL).toContain('CREATE TABLE IF NOT EXISTS install_records')
    expect(SCHEMA_SQL).toContain('installMode')
    expect(SCHEMA_SQL).toContain('installedAs')
    expect(SCHEMA_SQL).toContain('installReason')
  })

  test('stores copy mode and managed entry bookkeeping fields for content-mode installs', () => {
    expect(SCHEMA_SQL).toContain("copyMode          TEXT NOT NULL DEFAULT 'directory-copy'")
    expect(SCHEMA_SQL).toContain("containerDirName  TEXT NOT NULL DEFAULT ''")
    expect(SCHEMA_SQL).toContain("managedEntriesJson TEXT NOT NULL DEFAULT '[]'")
  })
})

describe('analyzeImportedSkills', () => {
  test('wraps a root-level single skill repository into its own installed directory', async () => {
    const importedSourcePath = await makeTempDir('root-skill-source-')
    await fs.writeFile(path.join(importedSourcePath, 'SKILL.md'), '---\nname: yt-dlp-downloader\n---\n', 'utf8')
    await fs.writeFile(path.join(importedSourcePath, 'README.md'), '# Root skill\n', 'utf8')
    await fs.mkdir(path.join(importedSourcePath, 'scripts'), { recursive: true })
    await fs.writeFile(path.join(importedSourcePath, 'scripts', 'download.sh'), 'echo ok\n', 'utf8')

    const records = await analyzeImportedSkills(importedSourcePath, 'yt-dlp-downloader-skill')

    expect(records).toHaveLength(1)
    expect(records[0]).toMatchObject({
      skillName: 'yt-dlp-downloader-skill',
      sourceRelativePath: '.',
      installMode: 'single-root-skill',
      installedAs: 'yt-dlp-downloader-skill',
      copyMode: 'directory-copy',
      containerDirName: 'yt-dlp-downloader-skill',
      sourceRootKind: 'root-skill',
      isRootSkillWrapped: true,
    })
    expect(records[0].installReason).toContain('repo root contains SKILL.md')
  })

  test('keeps child skill directories unchanged for multi-skill repositories', async () => {
    const importedSourcePath = await makeTempDir('multi-skill-source-')
    await fs.mkdir(path.join(importedSourcePath, 'alpha'), { recursive: true })
    await fs.writeFile(path.join(importedSourcePath, 'alpha', 'SKILL.md'), '# alpha\n', 'utf8')
    await fs.mkdir(path.join(importedSourcePath, 'beta'), { recursive: true })
    await fs.writeFile(path.join(importedSourcePath, 'beta', 'SKILL.md'), '# beta\n', 'utf8')

    const records = await analyzeImportedSkills(importedSourcePath, 'toolbox')

    expect(records.map((record) => record.installedAs)).toEqual(['alpha', 'beta'])
    expect(records.every((record) => record.installMode === 'multi-skill-repo')).toBe(true)
    expect(records.every((record) => record.copyMode === 'directory-copy')).toBe(true)
    expect(records.every((record) => record.isRootSkillWrapped === false)).toBe(true)
  })

  test('creates a single content-managed install record for directory-contents-copy imports', async () => {
    const importedSourcePath = await makeTempDir('content-source-')
    await fs.writeFile(path.join(importedSourcePath, 'AGENTS.md'), '# agents\n', 'utf8')
    await fs.writeFile(path.join(importedSourcePath, 'README.md'), '# readme\n', 'utf8')
    await fs.mkdir(path.join(importedSourcePath, 'rules'), { recursive: true })

    const records = await analyzeImportedSkills(importedSourcePath, 'gstack-agent-files', 'directory-contents-copy')

    expect(records).toHaveLength(1)
    expect(records[0]).toMatchObject({
      skillName: 'gstack-agent-files',
      sourceRelativePath: '.',
      installedAs: 'gstack-agent-files',
      copyMode: 'directory-contents-copy',
      containerDirName: 'gstack-agent-files',
      installMode: 'content-repo',
      sourceRootKind: 'content-root',
      isRootSkillWrapped: false,
    })
    expect(records[0].managedEntriesJson).toBe(JSON.stringify(['AGENTS.md', 'README.md', 'rules']))
  })

  test('creates a single content-managed install record for agent-files-copy imports', async () => {
    const importedSourcePath = await makeTempDir('content-source-')
    await fs.writeFile(path.join(importedSourcePath, 'AGENTS.md'), '# agents\n', 'utf8')
    await fs.writeFile(path.join(importedSourcePath, 'README.md'), '# readme\n', 'utf8')

    const records = await analyzeImportedSkills(importedSourcePath, 'repo-agent-files', 'agent-files-copy')

    expect(records).toHaveLength(1)
    expect(records[0]).toMatchObject({
      skillName: 'repo-agent-files',
      copyMode: 'agent-files-copy',
      installMode: 'content-repo',
      sourceRootKind: 'content-root',
    })
    expect(records[0].managedEntriesJson).toBe(JSON.stringify(['AGENTS.md']))
  })

  test('rejects agent-files-copy imports when no common agent files are present', async () => {
    const importedSourcePath = await makeTempDir('content-source-')
    await fs.writeFile(path.join(importedSourcePath, 'README.md'), '# readme\n', 'utf8')

    await expect(analyzeImportedSkills(importedSourcePath, 'repo-agent-files', 'agent-files-copy')).rejects.toThrow(
      '找不到常見 Agent 文件'
    )
  })
})

describe('copyImportedSourceToPair', () => {
  test('whole-folder imports keep their outer folder through enable, scan, sync and disable in a content-layout pair', async () => {
    const repository = await makeTempDir('whole-folder-repository-')
    const source = await makeTempDir('whole-folder-source-')
    const target = await makeTempDir('whole-folder-target-')
    await fs.writeFile(path.join(repository, 'AGENTS.md'), '# imported')
    await fs.writeFile(path.join(target, 'AGENTS.md'), '# unrelated target file')
    const imported = await copyImportedSourceToPair(repository, source, 'toolbox', 'directory-copy')
    const record = imported.records[0]
    const options = { projectionMode: 'directory-contents-copy' as const, sourcePath: source }

    expect(enableSkill(source, target, record.skillName, record, options)).toEqual({ ok: true })
    await expect(fs.readFile(path.join(target, 'toolbox', 'AGENTS.md'), 'utf8')).resolves.toBe('# imported')
    expect(scanSkills({ sourcePath: source, targetPath: target, metas: [], installRecords: imported.records, ...options }).skills[0].enabled).toBe(true)
    const status = await inspectProjectGroupSync({
      projectTag: 'toolbox', sourcePath: source, targetPath: target, metas: [],
      managedRecords: imported.records, projectionMode: options.projectionMode,
      localCommitSha: '', remoteCommitSha: '', checkedAt: 0, syncedAt: 0,
    })
    expect(status.enabledSkillNames).toEqual(['toolbox'])
    expect(status.staleSkillNames).toEqual([])
    expect(disableSkill(target, record.skillName, record, options)).toEqual({ ok: true })
    expect(await fs.readdir(target)).toEqual(['AGENTS.md'])
    await expect(fs.readFile(path.join(target, 'AGENTS.md'), 'utf8')).resolves.toBe('# unrelated target file')
  })

  test('discovers nested skills from a repository URL and preserves each complete skill', async () => {
    const repository = await makeTempDir('nested-skill-source-')
    const source = await makeTempDir('nested-skill-pair-')
    await fs.mkdir(path.join(repository, 'skills', 'alpha', 'references'), { recursive: true })
    await fs.writeFile(path.join(repository, 'skills', 'alpha', 'SKILL.md'), '# alpha')
    await fs.writeFile(path.join(repository, 'skills', 'alpha', 'references', 'guide.md'), 'reference')
    await fs.writeFile(path.join(repository, 'README.md'), 'repository readme')

    const result = await copyImportedSourceToPair(repository, source, 'toolbox', 'skills-import')

    expect(result.skillNames).toEqual(['alpha'])
    expect(result.records[0].sourceRelativePath).toBe('skills/alpha')
    await expect(fs.readFile(path.join(source, 'alpha', 'references', 'guide.md'), 'utf8')).resolves.toBe('reference')
    expect(await fs.readdir(source)).toEqual(['alpha'])
  })

  test.each([
    ['skills-import', ['alpha'], ['alpha']],
    ['directory-copy', ['toolbox'], ['toolbox']],
    ['directory-contents-copy', ['toolbox'], ['AGENTS.md', 'CLAUDE.md', 'README.md', 'skills']],
    ['agent-files-copy', ['toolbox'], ['AGENTS.md', 'CLAUDE.md']],
  ] as const)('%s produces its advertised layout through import and enable', async (mode, expectedSources, expectedTargets) => {
    const repository = await makeTempDir('mode-repository-')
    const source = await makeTempDir('mode-source-')
    const target = await makeTempDir('mode-target-')
    await fs.mkdir(path.join(repository, 'skills', 'alpha'), { recursive: true })
    await fs.writeFile(path.join(repository, 'skills', 'alpha', 'SKILL.md'), '# alpha')
    for (const file of ['AGENTS.md', 'CLAUDE.md', 'README.md']) await fs.writeFile(path.join(repository, file), file)

    const imported = await copyImportedSourceToPair(repository, source, 'toolbox', mode)
    for (const record of imported.records) {
      expect(enableSkill(source, target, record.skillName, record)).toEqual({ ok: true })
      expect(JSON.parse(record.metadataJson).importMode).toBe(mode)
    }

    expect((await fs.readdir(source)).sort()).toEqual([...expectedSources])
    expect((await fs.readdir(target)).sort()).toEqual([...expectedTargets])
    if (mode === 'agent-files-copy') {
      expect((await fs.readdir(path.join(source, 'toolbox'))).sort()).toEqual(['AGENTS.md', 'CLAUDE.md'])
    }
    if (mode === 'directory-copy') {
      await expect(fs.readFile(path.join(target, 'toolbox', 'README.md'), 'utf8')).resolves.toBe('README.md')
      await expect(fs.stat(path.join(target, 'toolbox', 'skills', 'alpha', 'SKILL.md'))).resolves.toBeDefined()
    }
  })

  test('does not report success or change existing content when no skills are found', async () => {
    const repository = await makeTempDir('no-skills-repository-')
    const source = await makeTempDir('no-skills-source-')
    await fs.writeFile(path.join(repository, 'README.md'), 'not a skill')
    await fs.writeFile(path.join(source, 'keep.txt'), 'keep')

    await expect(copyImportedSourceToPair(repository, source, 'toolbox', 'skills-import')).rejects.toThrow('SKILL.md')
    expect(await fs.readdir(source)).toEqual(['keep.txt'])
  })

  test('rejects ambiguous skill folder names before copying either directory', async () => {
    const repository = await makeTempDir('duplicate-skills-repository-')
    const source = await makeTempDir('duplicate-skills-source-')
    for (const parent of ['first', 'second']) {
      await fs.mkdir(path.join(repository, parent, 'same-name'), { recursive: true })
      await fs.writeFile(path.join(repository, parent, 'same-name', 'SKILL.md'), '# skill')
    }

    await expect(copyImportedSourceToPair(repository, source, 'toolbox', 'skills-import')).rejects.toThrow('same-name')
    expect(await fs.readdir(source)).toEqual([])
  })

  test('copies a root-level single skill into a dedicated folder instead of flattening repo files', async () => {
    const importedSourcePath = await makeTempDir('copy-root-skill-source-')
    const pairSourcePath = await makeTempDir('copy-root-skill-pair-')
    await fs.writeFile(path.join(importedSourcePath, 'SKILL.md'), '# root skill\n', 'utf8')
    await fs.writeFile(path.join(importedSourcePath, 'README.md'), '# readme\n', 'utf8')
    await fs.mkdir(path.join(importedSourcePath, 'scripts'), { recursive: true })
    await fs.writeFile(path.join(importedSourcePath, 'scripts', 'tool.sh'), 'echo hi\n', 'utf8')

    const result = await copyImportedSourceToPair(importedSourcePath, pairSourcePath, 'yt-dlp-downloader-skill')

    expect(result.skillNames).toEqual(['yt-dlp-downloader-skill'])
    expect(result.records).toHaveLength(1)
    await expect(fs.readFile(path.join(pairSourcePath, 'yt-dlp-downloader-skill', 'SKILL.md'), 'utf8')).resolves.toContain('root skill')
    await expect(fs.stat(path.join(pairSourcePath, 'SKILL.md'))).rejects.toThrow()
  })
})

describe('recorded import mode for GitHub updates', () => {
  test.each(['skills-import', 'directory-copy', 'directory-contents-copy', 'agent-files-copy'] as const)(
    'preserves %s for subsequent updates', (mode) => {
      expect(resolveRecordedImportMode([{
        copyMode: mode === 'skills-import' ? 'directory-copy' : mode,
        metadataJson: JSON.stringify({ importMode: mode }),
      }])).toBe(mode)
    }
  )

  test('keeps older per-skill imports as per-skill imports without migrating their data', () => {
    expect(resolveRecordedImportMode([{ copyMode: 'directory-copy', metadataJson: '{}' }])).toBe('skills-import')
    expect(resolveRecordedImportMode([{ copyMode: 'agent-files-copy', metadataJson: '{}' }])).toBe('agent-files-copy')
  })
})
