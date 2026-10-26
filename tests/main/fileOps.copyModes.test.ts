import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { afterEach, describe, expect, test } from 'vitest'
import { disableSkill, enableSkill } from '../../src/main/fileOps'

const tempRoots: string[] = []

async function makeTempDir(prefix: string) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), prefix))
  tempRoots.push(dir)
  return dir
}

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })))
})

describe('fileOps copy modes', () => {
  test('pair directory-contents-copy projects a skill directory into target root without its outer folder', async () => {
    const sourceRoot = await makeTempDir('fileops-source-')
    const targetRoot = await makeTempDir('fileops-target-')
    const skillDir = path.join(sourceRoot, 'custom-skill')
    await fs.mkdir(path.join(skillDir, 'reference'), { recursive: true })
    await fs.writeFile(path.join(skillDir, 'SKILL.md'), '# custom\n', 'utf8')
    await fs.writeFile(path.join(skillDir, 'reference', 'guide.md'), '# guide\n', 'utf8')

    const enableResult = await enableSkill(sourceRoot, targetRoot, 'custom-skill', undefined, {
      projectionMode: 'directory-contents-copy',
    })

    expect(enableResult).toEqual({ ok: true })
    await expect(fs.readFile(path.join(targetRoot, 'SKILL.md'), 'utf8')).resolves.toContain('custom')
    await expect(fs.readFile(path.join(targetRoot, 'reference', 'guide.md'), 'utf8')).resolves.toContain('guide')
    await expect(fs.stat(path.join(targetRoot, 'custom-skill'))).rejects.toThrow()

    const disableResult = await disableSkill(targetRoot, 'custom-skill', undefined, {
      projectionMode: 'directory-contents-copy',
      sourcePath: sourceRoot,
    })

    expect(disableResult).toEqual({ ok: true })
    await expect(fs.stat(path.join(targetRoot, 'SKILL.md'))).rejects.toThrow()
    await expect(fs.stat(path.join(targetRoot, 'reference'))).rejects.toThrow()
  })

  test('directory-contents-copy copies direct children into target root without outer folder', async () => {
    const sourceRoot = await makeTempDir('fileops-source-')
    const targetRoot = await makeTempDir('fileops-target-')
    const container = path.join(sourceRoot, 'gstack-agent-files')
    await fs.mkdir(container, { recursive: true })
    await fs.writeFile(path.join(container, 'AGENTS.md'), '# agents\n', 'utf8')
    await fs.mkdir(path.join(container, 'rules'), { recursive: true })
    await fs.writeFile(path.join(container, 'rules', 'base.md'), '# base\n', 'utf8')

    const result = await enableSkill(sourceRoot, targetRoot, 'gstack-agent-files', {
      skillName: 'gstack-agent-files',
      installedAs: 'gstack-agent-files',
      containerDirName: 'gstack-agent-files',
      copyMode: 'directory-contents-copy',
      managedEntriesJson: JSON.stringify(['AGENTS.md', 'rules']),
    })

    expect(result).toEqual({ ok: true })
    await expect(fs.readFile(path.join(targetRoot, 'AGENTS.md'), 'utf8')).resolves.toContain('agents')
    await expect(fs.readFile(path.join(targetRoot, 'rules', 'base.md'), 'utf8')).resolves.toContain('base')
    await expect(fs.stat(path.join(targetRoot, 'gstack-agent-files'))).rejects.toThrow()
  })

  test('agent-files-copy only copies whitelisted files and disable removes managed entries only', async () => {
    const sourceRoot = await makeTempDir('fileops-source-')
    const targetRoot = await makeTempDir('fileops-target-')
    const container = path.join(sourceRoot, 'repo-managed')
    await fs.mkdir(container, { recursive: true })
    await fs.writeFile(path.join(container, 'AGENTS.md'), '# agents\n', 'utf8')
    await fs.writeFile(path.join(container, 'README.md'), '# readme\n', 'utf8')
    await fs.writeFile(path.join(targetRoot, 'README.md'), '# keep me\n', 'utf8')

    const record = {
      skillName: 'repo-managed',
      installedAs: 'repo-managed',
      containerDirName: 'repo-managed',
      copyMode: 'agent-files-copy' as const,
      managedEntriesJson: JSON.stringify(['AGENTS.md']),
    }

    const enableResult = await enableSkill(sourceRoot, targetRoot, 'repo-managed', record)
    expect(enableResult).toEqual({ ok: true })
    await expect(fs.readFile(path.join(targetRoot, 'AGENTS.md'), 'utf8')).resolves.toContain('agents')
    await expect(fs.readFile(path.join(targetRoot, 'README.md'), 'utf8')).resolves.toContain('keep me')

    const disableResult = await disableSkill(targetRoot, 'repo-managed', record)
    expect(disableResult).toEqual({ ok: true })
    await expect(fs.stat(path.join(targetRoot, 'AGENTS.md'))).rejects.toThrow()
    await expect(fs.readFile(path.join(targetRoot, 'README.md'), 'utf8')).resolves.toContain('keep me')
  })
})
