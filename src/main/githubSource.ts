import { app } from 'electron'
import fs from 'fs/promises'
import path from 'path'
import extract from 'extract-zip'
import type { GithubImportParsed, GithubImportPreview } from '../shared/importTypes'

function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, '')
}

export function buildDefaultProjectTag(repoName: string): string {
  return repoName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function parseGithubSourceUrl(rawUrl: string): GithubImportParsed {
  const url = new URL(rawUrl)

  if (url.hostname !== 'github.com') {
    throw new Error('目前只支援 github.com 倉庫地址')
  }

  const segments = trimSlashes(url.pathname).split('/').filter(Boolean)
  if (segments.length < 2) {
    throw new Error('GitHub 地址格式不完整')
  }

  const [owner, repo] = segments
  let branch = 'main'
  let subpath = ''

  if (segments.length > 2) {
    if (segments[2] === 'tree') {
      branch = segments[3] || 'main'
      subpath = segments.slice(4).join('/')
    } else if (segments[2] === 'blob') {
      throw new Error('GitHub blob 單檔地址不支援匯入，請改用倉庫根目錄或 tree 目錄地址')
    } else {
      throw new Error('GitHub 地址目前只支援倉庫根目錄或 tree 目錄地址')
    }
  }

  const canonicalUrl = subpath
    ? `https://github.com/${owner}/${repo}/tree/${branch}/${subpath}`
    : `https://github.com/${owner}/${repo}/tree/${branch}`

  return {
    owner,
    repo,
    branch,
    subpath,
    canonicalUrl,
    archiveUrl: `https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.tar.gz`,
  }
}

export function buildGithubImportPreview(rawUrl: string): GithubImportPreview {
  const parsed = parseGithubSourceUrl(rawUrl)
  const defaultProjectTag = buildDefaultProjectTag(parsed.repo)
  const cacheKey = path.posix.join(parsed.owner, parsed.repo, parsed.branch, parsed.subpath || '.')

  return {
    ...parsed,
    defaultProjectTag,
    suggestedName: parsed.repo,
    cacheKey,
  }
}

async function fetchGithubRepoMeta(rawUrl: string): Promise<{ defaultBranch: string }> {
  const parsed = parseGithubSourceUrl(rawUrl)
  const response = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'skill-manager',
    },
  })

  if (!response.ok) {
    throw new Error(`GitHub 倉庫資訊查詢失敗：${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as { default_branch?: string }
  return {
    defaultBranch: data.default_branch || 'main',
  }
}

function hasExplicitBranch(rawUrl: string): boolean {
  const url = new URL(rawUrl)
  const segments = trimSlashes(url.pathname).split('/').filter(Boolean)
  return segments[2] === 'tree'
}

export async function resolveGithubImportPreview(rawUrl: string): Promise<GithubImportPreview> {
  const preview = buildGithubImportPreview(rawUrl)
  if (hasExplicitBranch(rawUrl)) {
    return preview
  }

  const repoMeta = await fetchGithubRepoMeta(rawUrl)
  if (repoMeta.defaultBranch === preview.branch) {
    return preview
  }

  return buildGithubImportPreview(`https://github.com/${preview.owner}/${preview.repo}/tree/${repoMeta.defaultBranch}`)
}

export async function fetchGithubBranchHeadSha(rawUrl: string): Promise<string> {
  const preview = await resolveGithubImportPreview(rawUrl)
  const response = await fetch(
    `https://api.github.com/repos/${preview.owner}/${preview.repo}/commits/${encodeURIComponent(preview.branch)}`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'skill-manager',
      },
    }
  )

  if (!response.ok) {
    throw new Error(`GitHub commit 查詢失敗：${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as { sha?: string }
  if (!data.sha) {
    throw new Error('GitHub commit 查詢失敗：回傳內容缺少 sha')
  }

  return data.sha
}

async function ensureCleanDir(dir: string) {
  await fs.rm(dir, { recursive: true, force: true })
  await fs.mkdir(dir, { recursive: true })
}

async function detectExtractedRoot(dir: string): Promise<string> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const firstDir = entries.find((entry) => entry.isDirectory())
  if (!firstDir) {
    throw new Error('GitHub 壓縮包解壓後找不到倉庫目錄')
  }
  return path.join(dir, firstDir.name)
}

export async function importGithubArchive(rawUrl: string) {
  const preview = await resolveGithubImportPreview(rawUrl)
  const baseDir = path.join(
    app.getPath('userData'),
    'github-sources',
    preview.owner,
    preview.repo,
    preview.branch.replace(/[\\/]/g, '--')
  )
  const downloadDir = path.join(baseDir, 'download')
  const extractDir = path.join(baseDir, 'workspace')
  const zipPath = path.join(downloadDir, 'archive.zip')

  await fs.mkdir(downloadDir, { recursive: true })
  await ensureCleanDir(extractDir)

  const downloadUrl = preview.archiveUrl.replace(/\.tar\.gz$/i, '.zip')
  const response = await fetch(downloadUrl)
  if (!response.ok) {
    throw new Error(`GitHub 下載失敗：${response.status} ${response.statusText}`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  await fs.writeFile(zipPath, buffer)
  await extract(zipPath, { dir: extractDir })

  const repoRoot = await detectExtractedRoot(extractDir)
  const sourcePath = preview.subpath ? path.join(repoRoot, preview.subpath) : repoRoot

  const stat = await fs.stat(sourcePath).catch(() => null)
  if (!stat || !stat.isDirectory()) {
    throw new Error(`解壓完成，但找不到來源目錄：${sourcePath}`)
  }

  return {
    ...preview,
    sourcePath,
    cacheDir: baseDir,
  }
}
