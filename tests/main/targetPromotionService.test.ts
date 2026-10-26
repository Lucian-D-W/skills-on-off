import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { afterEach, describe, expect, test, vi } from 'vitest'
import type { Pair, SkillMeta } from '../../src/shared/types'
import { getSkillTargetPromotionStatus, promoteSkillTargetToSource } from '../../src/main/targetPromotionService'

const tempRoots: string[] = []

async function makeTempDir(prefix: string) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), prefix))
  tempRoots.push(dir)
  return dir
}

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })))
})

function makePair(sourcePath: string, targetPath: string, projectionMode: Pair['projectionMode'] = 'directory-copy'): Pair {
  return {
    id: 1,
    name: 'codex',
    sourcePath,
    targetPath,
    projectionMode,
    createdAt: 0,
  }
}

function makeMeta(lastTargetPromotedAt = 0): SkillMeta {
  return {
    id: 1,
    pairId: 1,
    skillName: 'markitdown',
    note: '',
    projectTags: '',
    funcTags: '',
    customTags: '',
    lastTargetPromotedAt,
  }
}

describe('targetPromotionService', () => {
  test('detects drift for a directory-copy skill when target differs from source', async () => {
    const sourceRoot = await makeTempDir('promotion-source-')
    const targetRoot = await makeTempDir('promotion-target-')
    const sourceSkillDir = path.join(sourceRoot, 'markitdown')
    const targetSkillDir = path.join(targetRoot, 'markitdown')

    await fs.mkdir(sourceSkillDir, { recursive: true })
    await fs.mkdir(targetSkillDir, { recursive: true })
    await fs.writeFile(path.join(sourceSkillDir, 'SKILL.md'), '# source version\n', 'utf8')
    await fs.writeFile(path.join(targetSkillDir, 'SKILL.md'), '# target version\n', 'utf8')

    const status = await getSkillTargetPromotionStatus({
      pair: makePair(sourceRoot, targetRoot),
      skillName: 'markitdown',
      meta: makeMeta(123),
    })

    expect(status).toMatchObject({
      canPromote: true,
      targetExists: true,
      targetDiffersFromSource: true,
      lastTargetPromotedAt: 123,
      unsupportedReason: '',
    })
  })

  test('promotes target directory into source and removes stale source files', async () => {
    const sourceRoot = await makeTempDir('promotion-source-')
    const targetRoot = await makeTempDir('promotion-target-')
    const sourceSkillDir = path.join(sourceRoot, 'markitdown')
    const targetSkillDir = path.join(targetRoot, 'markitdown')

    await fs.mkdir(path.join(sourceSkillDir, 'reference'), { recursive: true })
    await fs.mkdir(path.join(targetSkillDir, 'reference'), { recursive: true })
    await fs.writeFile(path.join(sourceSkillDir, 'SKILL.md'), '# old\n', 'utf8')
    await fs.writeFile(path.join(sourceSkillDir, 'reference', 'old.md'), '# old ref\n', 'utf8')
    await fs.writeFile(path.join(targetSkillDir, 'SKILL.md'), '# new\n', 'utf8')
    await fs.writeFile(path.join(targetSkillDir, 'reference', 'guide.md'), '# guide\n', 'utf8')

    await promoteSkillTargetToSource({
      pair: makePair(sourceRoot, targetRoot),
      skillName: 'markitdown',
    })

    await expect(fs.readFile(path.join(sourceSkillDir, 'SKILL.md'), 'utf8')).resolves.toContain('new')
    await expect(fs.readFile(path.join(sourceSkillDir, 'reference', 'guide.md'), 'utf8')).resolves.toContain('guide')
    await expect(fs.stat(path.join(sourceSkillDir, 'reference', 'old.md'))).rejects.toThrow()
  })

  test('keeps the original source directory when copying target content fails', async () => {
    const sourceRoot = await makeTempDir('promotion-source-')
    const targetRoot = await makeTempDir('promotion-target-')
    const sourceSkillDir = path.join(sourceRoot, 'markitdown')
    const targetSkillDir = path.join(targetRoot, 'markitdown')

    await fs.mkdir(sourceSkillDir, { recursive: true })
    await fs.mkdir(targetSkillDir, { recursive: true })
    await fs.writeFile(path.join(sourceSkillDir, 'SKILL.md'), '# source survives\n', 'utf8')
    await fs.writeFile(path.join(targetSkillDir, 'SKILL.md'), '# target new\n', 'utf8')

    const copyFileSpy = vi.spyOn(fs, 'copyFile').mockRejectedValue(new Error('copy failed'))

    try {
      await expect(
        promoteSkillTargetToSource({
          pair: makePair(sourceRoot, targetRoot),
          skillName: 'markitdown',
        })
      ).rejects.toThrow(/copy failed/i)
    } finally {
      copyFileSpy.mockRestore()
    }

    await expect(fs.readFile(path.join(sourceSkillDir, 'SKILL.md'), 'utf8')).resolves.toContain('source survives')
  })

  test('returns unsupported for content projection pairs to avoid ambiguous reverse mapping', async () => {
    const sourceRoot = await makeTempDir('promotion-source-')
    const targetRoot = await makeTempDir('promotion-target-')
    const sourceSkillDir = path.join(sourceRoot, 'markitdown')

    await fs.mkdir(sourceSkillDir, { recursive: true })
    await fs.writeFile(path.join(sourceSkillDir, 'SKILL.md'), '# skill\n', 'utf8')
    await fs.writeFile(path.join(targetRoot, 'SKILL.md'), '# target root\n', 'utf8')

    const status = await getSkillTargetPromotionStatus({
      pair: makePair(sourceRoot, targetRoot, 'directory-contents-copy'),
      skillName: 'markitdown',
      meta: makeMeta(),
    })

    expect(status.canPromote).toBe(false)
    expect(status.unsupportedReason).not.toBe('')
  })
})
