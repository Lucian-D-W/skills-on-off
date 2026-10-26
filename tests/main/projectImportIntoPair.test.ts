import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import type { Pair } from '../../src/shared/types'

const mocks = vi.hoisted(() => ({
  importGithubArchive: vi.fn(),
  resolveGithubImportPreview: vi.fn(),
  upsertSourceByCanonicalUrl: vi.fn(),
  upsertProjectLink: vi.fn(),
  getSkillMeta: vi.fn(),
  listInstallRecordsByPairIdAndTag: vi.fn(),
  listManagedInstallRecordsByPairIdAndTag: vi.fn(),
  listProjectLinksByPairId: vi.fn(),
  replaceInstallRecords: vi.fn(),
  replaceTargetProjectionsForProjectTag: vi.fn(),
  saveSkillMeta: vi.fn(),
  getProjectLinkByPairId: vi.fn(),
  getProjectLinkByPairIdAndTag: vi.fn(),
  listPairTargets: vi.fn(),
  archiveRemovedManagedSkills: vi.fn(),
}))

vi.mock('../../src/main/githubSource', () => ({
  buildDefaultProjectTag: (repo: string) => `#${repo}`,
  importGithubArchive: mocks.importGithubArchive,
  resolveGithubImportPreview: mocks.resolveGithubImportPreview,
}))

vi.mock('../../src/main/installRecordRepository', () => ({
  listInstallRecordsByPairIdAndTag: mocks.listInstallRecordsByPairIdAndTag,
  listManagedInstallRecordsByPairIdAndTag: mocks.listManagedInstallRecordsByPairIdAndTag,
  replaceInstallRecords: mocks.replaceInstallRecords,
}))

vi.mock('../../src/main/targetProjectionRepository', () => ({
  replaceTargetProjectionsForProjectTag: mocks.replaceTargetProjectionsForProjectTag,
}))

vi.mock('../../src/main/sourceRepository', () => ({
  upsertSourceByCanonicalUrl: mocks.upsertSourceByCanonicalUrl,
}))

vi.mock('../../src/main/projectLinkRepository', () => ({
  upsertProjectLink: mocks.upsertProjectLink,
  listProjectLinksByPairId: mocks.listProjectLinksByPairId,
  getProjectLinkByPairId: mocks.getProjectLinkByPairId,
  getProjectLinkByPairIdAndTag: mocks.getProjectLinkByPairIdAndTag,
}))

vi.mock('../../src/main/skillMetaRepository', () => ({
  getSkillMeta: mocks.getSkillMeta,
  saveSkillMeta: mocks.saveSkillMeta,
}))

vi.mock('../../src/main/targetRegistry', () => ({
  listPairTargets: mocks.listPairTargets,
}))

vi.mock('../../src/main/managementRemovalService', () => ({
  archiveRemovedManagedSkills: mocks.archiveRemovedManagedSkills,
}))

const tempRoots: string[] = []

async function makeTempDir(prefix: string) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), prefix))
  tempRoots.push(dir)
  return dir
}

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })))
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('importProjectIntoPair', () => {
  test('preserves managed entry metadata when persisting projections for imported project skills', async () => {
    const importedSourcePath = await makeTempDir('import-project-source-')
    const pairSourcePath = await makeTempDir('import-project-pair-')
    await fs.mkdir(path.join(importedSourcePath, 'hv-analysis'), { recursive: true })
    await fs.writeFile(path.join(importedSourcePath, 'hv-analysis', 'SKILL.md'), '# hv-analysis\n', 'utf8')

    const pair: Pair = {
      id: 7,
      name: 'codex',
      sourcePath: pairSourcePath,
      targetPath: 'C:\\Users\\6\\.codex\\skills',
      projectionMode: 'directory-copy',
      createdAt: 0,
    }

    mocks.importGithubArchive.mockResolvedValue({
      owner: 'KKKKhazix',
      repo: 'khazix-skills',
      branch: 'main',
      sourcePath: importedSourcePath,
    })
    mocks.resolveGithubImportPreview.mockResolvedValue({
      owner: 'KKKKhazix',
      repo: 'khazix-skills',
      branch: 'main',
      subpath: '',
      canonicalUrl: 'https://github.com/KKKKhazix/khazix-skills/tree/main',
      archiveUrl: 'https://github.com/KKKKhazix/khazix-skills/archive/refs/heads/main.zip',
    })
    mocks.upsertSourceByCanonicalUrl.mockReturnValue({ id: 41, kind: 'github-archive' })
    mocks.upsertProjectLink.mockReturnValue({
      id: 9,
      pairId: 7,
      sourceId: 41,
      sourceKind: 'github-archive',
      projectTag: '#khazix-skills',
      status: 'linked',
    })
    mocks.getSkillMeta.mockReturnValue(null)
    mocks.listInstallRecordsByPairIdAndTag.mockReturnValue([])
    mocks.listManagedInstallRecordsByPairIdAndTag.mockReturnValue([
      {
        skillName: 'hv-analysis',
        sourceRelativePath: 'hv-analysis',
        installedAs: 'hv-analysis',
        installMode: 'multi-skill-repo',
        installReason: 'child directory contains SKILL.md; kept as-is under source root',
        sourceRootKind: 'nested-skills',
        copyMode: 'directory-copy',
        containerDirName: 'hv-analysis',
        managedEntriesJson: JSON.stringify(['SKILL.md']),
        isRootSkillWrapped: 0,
        metadataJson: '{}',
      },
    ])
    mocks.listPairTargets.mockReturnValue([{ id: 91 }])
    mocks.archiveRemovedManagedSkills.mockResolvedValue(undefined)

    const { importProjectIntoPair } = await import('../../src/main/projectLinking')

    await expect(
      importProjectIntoPair(pair, 'https://github.com/KKKKhazix/khazix-skills', 'skills-import')
    ).resolves.toMatchObject({
      projectTag: '#khazix-skills',
      importedSkillNames: ['hv-analysis'],
    })

    expect(mocks.replaceTargetProjectionsForProjectTag).toHaveBeenCalledTimes(1)
    const projections = mocks.replaceTargetProjectionsForProjectTag.mock.calls[0][2]
    expect(projections).toHaveLength(1)
    expect(JSON.parse(projections[0].metadataJson)).toMatchObject({
      projectTag: '#khazix-skills',
      copyMode: 'directory-copy',
      containerDirName: 'hv-analysis',
      managedEntries: ['SKILL.md'],
    })
  })
})
