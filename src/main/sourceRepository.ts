import type { SourceRecord } from '../shared/importTypes'
import { getDb } from './db'
import { nowEpoch } from './time'

export interface SourceUpsertInput {
  kind: SourceRecord['kind']
  owner: string
  repo: string
  branch: string
  subpath: string
  canonicalUrl: string
  archiveUrl: string
  sourcePath: string
  resolvedCommitSha: string
  etag: string
  metadataJson: string
  lastFetchedAt: number
}

export function listSources(): SourceRecord[] {
  return getDb().prepare('SELECT * FROM sources ORDER BY createdAt ASC').all() as SourceRecord[]
}

export function getSourceById(id: number): SourceRecord | null {
  return (getDb().prepare('SELECT * FROM sources WHERE id = ?').get(id) as SourceRecord) ?? null
}

export function getSourceByCanonicalUrl(canonicalUrl: string): SourceRecord | null {
  return (
    (getDb().prepare('SELECT * FROM sources WHERE canonicalUrl = ?').get(canonicalUrl) as SourceRecord) ?? null
  )
}

export function createSource(input: SourceUpsertInput): SourceRecord {
  const database = getDb()
  const now = nowEpoch()
  const result = database.prepare(`
    INSERT INTO sources (
      kind, owner, repo, branch, subpath, canonicalUrl, archiveUrl, sourcePath,
      resolvedCommitSha, etag, metadataJson, lastFetchedAt, createdAt, updatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    input.kind,
    input.owner,
    input.repo,
    input.branch,
    input.subpath,
    input.canonicalUrl,
    input.archiveUrl,
    input.sourcePath,
    input.resolvedCommitSha,
    input.etag,
    input.metadataJson,
    input.lastFetchedAt,
    now,
    now
  )
  return getSourceById(result.lastInsertRowid as number)!
}

export function updateSource(id: number, input: SourceUpsertInput): SourceRecord {
  const now = nowEpoch()
  getDb().prepare(`
    UPDATE sources
    SET kind=?, owner=?, repo=?, branch=?, subpath=?, canonicalUrl=?, archiveUrl=?, sourcePath=?,
        resolvedCommitSha=?, etag=?, metadataJson=?, lastFetchedAt=?, updatedAt=?
    WHERE id=?
  `).run(
    input.kind,
    input.owner,
    input.repo,
    input.branch,
    input.subpath,
    input.canonicalUrl,
    input.archiveUrl,
    input.sourcePath,
    input.resolvedCommitSha,
    input.etag,
    input.metadataJson,
    input.lastFetchedAt,
    now,
    id
  )
  return getSourceById(id)!
}

export function upsertSourceByCanonicalUrl(input: SourceUpsertInput): SourceRecord {
  const existing = getSourceByCanonicalUrl(input.canonicalUrl)
  return existing ? updateSource(existing.id, input) : createSource(input)
}
