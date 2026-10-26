import { describe, expect, test } from 'vitest'
import { SCHEMA_SQL } from '../../src/main/migrations'

describe('SCHEMA_SQL', () => {
  test('declares all legacy and new tables', () => {
    expect(SCHEMA_SQL).toContain('CREATE TABLE IF NOT EXISTS pairs')
    expect(SCHEMA_SQL).toContain('CREATE TABLE IF NOT EXISTS skill_meta')
    expect(SCHEMA_SQL).toContain('CREATE TABLE IF NOT EXISTS sources')
    expect(SCHEMA_SQL).toContain('CREATE TABLE IF NOT EXISTS project_links')
    expect(SCHEMA_SQL).toContain('CREATE TABLE IF NOT EXISTS targets')
    expect(SCHEMA_SQL).toContain('CREATE TABLE IF NOT EXISTS target_projections')
  })

  test('is safe for in-place upgrades of an existing database', () => {
    expect(SCHEMA_SQL).toContain('CREATE TABLE IF NOT EXISTS pairs')
    expect(SCHEMA_SQL).toContain('CREATE UNIQUE INDEX IF NOT EXISTS idx_sources_canonical_url')
    expect(SCHEMA_SQL).toContain('UNIQUE(pairId, projectTag)')
    expect(SCHEMA_SQL).toContain('CREATE INDEX IF NOT EXISTS idx_project_links_pair_tag')
    expect(SCHEMA_SQL).not.toContain('DROP TABLE')
  })

  test('stores remote check and sync health fields for linked github projects', () => {
    expect(SCHEMA_SQL).toContain('lastRemoteCommitSha TEXT NOT NULL DEFAULT')
    expect(SCHEMA_SQL).toContain('lastSyncState  TEXT NOT NULL DEFAULT')
    expect(SCHEMA_SQL).toContain('lastSyncError  TEXT NOT NULL DEFAULT')
  })

  test('stores removal management ledger fields for imported skills', () => {
    expect(SCHEMA_SQL).toContain("managementState   TEXT NOT NULL DEFAULT 'managed'")
    expect(SCHEMA_SQL).toContain('removedAt         INTEGER NOT NULL DEFAULT 0')
    expect(SCHEMA_SQL).toContain("removalScope      TEXT NOT NULL DEFAULT ''")
  })
})
