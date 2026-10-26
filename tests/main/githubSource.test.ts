import { afterEach, describe, expect, test, vi } from 'vitest'
import { buildDefaultProjectTag, parseGithubSourceUrl, resolveGithubImportPreview } from '../../src/main/githubSource'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('parseGithubSourceUrl', () => {
  test('parses a repository root url into canonical github archive metadata', () => {
    const parsed = parseGithubSourceUrl('https://github.com/VintLin/skill-flow')

    expect(parsed).toMatchObject({
      owner: 'VintLin',
      repo: 'skill-flow',
      branch: 'main',
      subpath: '',
      canonicalUrl: 'https://github.com/VintLin/skill-flow/tree/main',
      archiveUrl: 'https://github.com/VintLin/skill-flow/archive/refs/heads/main.tar.gz',
    })
  })

  test('parses a branch subpath url into canonical metadata', () => {
    const parsed = parseGithubSourceUrl('https://github.com/VintLin/skill-flow/tree/dev/catalog/skills')

    expect(parsed).toMatchObject({
      owner: 'VintLin',
      repo: 'skill-flow',
      branch: 'dev',
      subpath: 'catalog/skills',
      canonicalUrl: 'https://github.com/VintLin/skill-flow/tree/dev/catalog/skills',
      archiveUrl: 'https://github.com/VintLin/skill-flow/archive/refs/heads/dev.tar.gz',
    })
  })

  test('rejects blob urls so a single-file link is not imported as a repo root', () => {
    expect(() =>
      parseGithubSourceUrl('https://github.com/VintLin/skill-flow/blob/main/README.md')
    ).toThrow(/blob/i)
  })
})

describe('buildDefaultProjectTag', () => {
  test('normalizes repository names into project tags', () => {
    expect(buildDefaultProjectTag('Skill Flow')).toBe('skill-flow')
    expect(buildDefaultProjectTag('my_awesome.skills')).toBe('my-awesome-skills')
  })
})

describe('resolveGithubImportPreview', () => {
  test('uses the repository default branch for root repository urls', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ default_branch: 'master' }),
      })
    )

    const preview = await resolveGithubImportPreview('https://github.com/MapleShaw/yt-dlp-downloader-skill')

    expect(preview).toMatchObject({
      owner: 'MapleShaw',
      repo: 'yt-dlp-downloader-skill',
      branch: 'master',
      canonicalUrl: 'https://github.com/MapleShaw/yt-dlp-downloader-skill/tree/master',
      archiveUrl: 'https://github.com/MapleShaw/yt-dlp-downloader-skill/archive/refs/heads/master.tar.gz',
    })
  })

  test('keeps explicit tree branch urls unchanged without extra lookup', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    const preview = await resolveGithubImportPreview('https://github.com/VintLin/skill-flow/tree/dev/catalog/skills')

    expect(preview.branch).toBe('dev')
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
