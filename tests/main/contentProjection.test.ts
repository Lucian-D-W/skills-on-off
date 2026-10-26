import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { afterEach, describe, expect, test } from 'vitest'
import { collectManagedEntryNames } from '../../src/main/contentProjection'

const tempRoots: string[] = []

async function makeTempDir(prefix: string) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), prefix))
  tempRoots.push(dir)
  return dir
}

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })))
})

describe('collectManagedEntryNames', () => {
  test('returns all direct child files and folders for directory-contents-copy', async () => {
    const root = await makeTempDir('content-projection-')
    await fs.writeFile(path.join(root, 'AGENTS.md'), '# agents\n', 'utf8')
    await fs.writeFile(path.join(root, 'README.md'), '# readme\n', 'utf8')
    await fs.mkdir(path.join(root, 'rules'), { recursive: true })
    await fs.writeFile(path.join(root, 'rules', 'base.md'), '# base\n', 'utf8')

    const entries = await collectManagedEntryNames(root, 'directory-contents-copy')

    expect(entries).toEqual(['AGENTS.md', 'README.md', 'rules'])
  })

  test('returns only common agent files for agent-files-copy', async () => {
    const root = await makeTempDir('content-projection-')
    await fs.writeFile(path.join(root, 'AGENTS.md'), '# agents\n', 'utf8')
    await fs.writeFile(path.join(root, 'claude.md'), '# claude\n', 'utf8')
    await fs.writeFile(path.join(root, 'README.md'), '# readme\n', 'utf8')
    await fs.mkdir(path.join(root, 'rules'), { recursive: true })

    const entries = await collectManagedEntryNames(root, 'agent-files-copy')

    expect(entries).toEqual(['AGENTS.md', 'claude.md'])
  })
})
