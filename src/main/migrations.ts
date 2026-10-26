import type Database from 'better-sqlite3'

export const SCHEMA_SQL = `
    CREATE TABLE IF NOT EXISTS pairs (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      sourcePath TEXT NOT NULL,
      targetPath TEXT NOT NULL,
      projectionMode TEXT NOT NULL DEFAULT 'directory-copy',
      createdAt  INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS skill_meta (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      pairId      INTEGER NOT NULL REFERENCES pairs(id) ON DELETE CASCADE,
      skillName   TEXT NOT NULL,
      note        TEXT NOT NULL DEFAULT '',
      projectTags TEXT NOT NULL DEFAULT '',
      funcTags    TEXT NOT NULL DEFAULT '',
      customTags  TEXT NOT NULL DEFAULT '',
      lastTargetPromotedAt INTEGER NOT NULL DEFAULT 0,
      UNIQUE(pairId, skillName)
    );

    CREATE TABLE IF NOT EXISTS sources (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      kind              TEXT NOT NULL,
      owner             TEXT NOT NULL DEFAULT '',
      repo              TEXT NOT NULL DEFAULT '',
      branch            TEXT NOT NULL DEFAULT '',
      subpath           TEXT NOT NULL DEFAULT '',
      canonicalUrl      TEXT NOT NULL DEFAULT '',
      archiveUrl        TEXT NOT NULL DEFAULT '',
      sourcePath        TEXT NOT NULL DEFAULT '',
      resolvedCommitSha TEXT NOT NULL DEFAULT '',
      etag              TEXT NOT NULL DEFAULT '',
      metadataJson      TEXT NOT NULL DEFAULT '{}',
      lastFetchedAt     INTEGER NOT NULL DEFAULT 0,
      createdAt         INTEGER NOT NULL DEFAULT (unixepoch()),
      updatedAt         INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS project_links (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      pairId        INTEGER NOT NULL REFERENCES pairs(id) ON DELETE CASCADE,
      sourceId      INTEGER NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
      sourceKind    TEXT NOT NULL,
      projectTag    TEXT NOT NULL DEFAULT '',
      status        TEXT NOT NULL DEFAULT 'linked',
      lastCheckedAt INTEGER NOT NULL DEFAULT 0,
      lastSyncedAt  INTEGER NOT NULL DEFAULT 0,
      lastRemoteCommitSha TEXT NOT NULL DEFAULT '',
      lastSyncState  TEXT NOT NULL DEFAULT 'idle',
      lastSyncError  TEXT NOT NULL DEFAULT '',
      createdAt     INTEGER NOT NULL DEFAULT (unixepoch()),
      updatedAt     INTEGER NOT NULL DEFAULT (unixepoch()),
      UNIQUE(pairId, projectTag)
    );

    CREATE TABLE IF NOT EXISTS targets (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      pairId        INTEGER NOT NULL REFERENCES pairs(id) ON DELETE CASCADE,
      kind          TEXT NOT NULL,
      rootPath      TEXT NOT NULL,
      layoutVersion TEXT NOT NULL DEFAULT '1',
      agentName     TEXT NOT NULL DEFAULT '',
      metadataJson  TEXT NOT NULL DEFAULT '{}',
      createdAt     INTEGER NOT NULL DEFAULT (unixepoch()),
      updatedAt     INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS target_projections (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      targetId          INTEGER NOT NULL REFERENCES targets(id) ON DELETE CASCADE,
      skillName         TEXT NOT NULL,
      sourceRelativePath TEXT NOT NULL DEFAULT '',
      targetRelativePath TEXT NOT NULL DEFAULT '',
      state             TEXT NOT NULL DEFAULT 'inactive',
      lastProjectedAt   INTEGER NOT NULL DEFAULT 0,
      lastSourceVersion TEXT NOT NULL DEFAULT '',
      metadataJson      TEXT NOT NULL DEFAULT '{}',
      UNIQUE(targetId, skillName)
    );

    CREATE TABLE IF NOT EXISTS install_records (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      pairId            INTEGER NOT NULL REFERENCES pairs(id) ON DELETE CASCADE,
      sourceId          INTEGER NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
      projectTag        TEXT NOT NULL DEFAULT '',
      skillName         TEXT NOT NULL,
      sourceRelativePath TEXT NOT NULL DEFAULT '',
      installedAs       TEXT NOT NULL DEFAULT '',
      installMode       TEXT NOT NULL DEFAULT 'multi-skill-repo',
      installReason     TEXT NOT NULL DEFAULT '',
      sourceRootKind    TEXT NOT NULL DEFAULT 'nested-skills',
      copyMode          TEXT NOT NULL DEFAULT 'directory-copy',
      containerDirName  TEXT NOT NULL DEFAULT '',
      managedEntriesJson TEXT NOT NULL DEFAULT '[]',
      isRootSkillWrapped INTEGER NOT NULL DEFAULT 0,
      managementState   TEXT NOT NULL DEFAULT 'managed',
      removedAt         INTEGER NOT NULL DEFAULT 0,
      removalScope      TEXT NOT NULL DEFAULT '',
      metadataJson      TEXT NOT NULL DEFAULT '{}',
      createdAt         INTEGER NOT NULL DEFAULT (unixepoch()),
      updatedAt         INTEGER NOT NULL DEFAULT (unixepoch()),
      UNIQUE(pairId, projectTag, skillName)
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_sources_canonical_url
      ON sources(canonicalUrl);

    CREATE INDEX IF NOT EXISTS idx_project_links_pair_tag
      ON project_links(pairId, projectTag);

    CREATE UNIQUE INDEX IF NOT EXISTS idx_targets_pair_root
      ON targets(pairId, rootPath);

    CREATE UNIQUE INDEX IF NOT EXISTS idx_target_projections_target_skill
      ON target_projections(targetId, skillName);

    CREATE INDEX IF NOT EXISTS idx_install_records_pair_tag
      ON install_records(pairId, projectTag);
  `

export function migrateDatabase(db: Database.Database) {
  migrateProjectLinksTable(db)
  db.exec(SCHEMA_SQL)
  migratePairsTable(db)
  migrateSkillMetaTable(db)
  migrateProjectLinkSyncColumns(db)
  migrateInstallRecordColumns(db)
}

function tableSql(db: Database.Database, tableName: string): string {
  const row = db
    .prepare(`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?`)
    .get(tableName) as { sql?: string } | undefined

  return row?.sql ?? ''
}

function migrateProjectLinksTable(db: Database.Database) {
  const projectLinksSql = tableSql(db, 'project_links')
  if (!projectLinksSql) return

  const legacyColumns = new Set(tableColumns(db, 'project_links'))
  const isLegacySingleLinkTable =
    projectLinksSql.includes('UNIQUE(pairId)') && !projectLinksSql.includes('UNIQUE(pairId, projectTag)')

  if (!isLegacySingleLinkTable) return

  const projectTagSelect = legacyColumns.has('projectTag')
    ? "COALESCE(NULLIF(projectTag, ''), 'default')"
    : "'default'"

  db.exec(`
    ALTER TABLE project_links RENAME TO project_links_legacy;

    CREATE TABLE project_links (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      pairId        INTEGER NOT NULL REFERENCES pairs(id) ON DELETE CASCADE,
      sourceId      INTEGER NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
      sourceKind    TEXT NOT NULL,
      projectTag    TEXT NOT NULL DEFAULT '',
      status        TEXT NOT NULL DEFAULT 'linked',
      lastCheckedAt INTEGER NOT NULL DEFAULT 0,
      lastSyncedAt  INTEGER NOT NULL DEFAULT 0,
      lastRemoteCommitSha TEXT NOT NULL DEFAULT '',
      lastSyncState  TEXT NOT NULL DEFAULT 'idle',
      lastSyncError  TEXT NOT NULL DEFAULT '',
      createdAt     INTEGER NOT NULL DEFAULT (unixepoch()),
      updatedAt     INTEGER NOT NULL DEFAULT (unixepoch()),
      UNIQUE(pairId, projectTag)
    );

    INSERT INTO project_links (
      id, pairId, sourceId, sourceKind, projectTag, status, lastCheckedAt, lastSyncedAt,
      lastRemoteCommitSha, lastSyncState, lastSyncError, createdAt, updatedAt
    )
    SELECT
      id,
      pairId,
      sourceId,
      sourceKind,
      ${projectTagSelect},
      status,
      lastCheckedAt,
      lastSyncedAt,
      '',
      'idle',
      '',
      createdAt,
      updatedAt
    FROM project_links_legacy;

    DROP TABLE project_links_legacy;
  `)
}

function tableColumns(db: Database.Database, tableName: string): string[] {
  return db
    .prepare(`PRAGMA table_info(${tableName})`)
    .all()
    .map((row) => String((row as { name: string }).name))
}

function addColumnIfMissing(db: Database.Database, tableName: string, columnName: string, definition: string) {
  const columns = new Set(tableColumns(db, tableName))
  if (columns.has(columnName)) return
  db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${definition};`)
}

function migrateProjectLinkSyncColumns(db: Database.Database) {
  addColumnIfMissing(db, 'project_links', 'lastRemoteCommitSha', "lastRemoteCommitSha TEXT NOT NULL DEFAULT ''")
  addColumnIfMissing(db, 'project_links', 'lastSyncState', "lastSyncState TEXT NOT NULL DEFAULT 'idle'")
  addColumnIfMissing(db, 'project_links', 'lastSyncError', "lastSyncError TEXT NOT NULL DEFAULT ''")
}

function migratePairsTable(db: Database.Database) {
  addColumnIfMissing(db, 'pairs', 'projectionMode', "projectionMode TEXT NOT NULL DEFAULT 'directory-copy'")
}

function migrateSkillMetaTable(db: Database.Database) {
  addColumnIfMissing(db, 'skill_meta', 'lastTargetPromotedAt', 'lastTargetPromotedAt INTEGER NOT NULL DEFAULT 0')
}

function migrateInstallRecordColumns(db: Database.Database) {
  addColumnIfMissing(db, 'install_records', 'copyMode', "copyMode TEXT NOT NULL DEFAULT 'directory-copy'")
  addColumnIfMissing(db, 'install_records', 'containerDirName', "containerDirName TEXT NOT NULL DEFAULT ''")
  addColumnIfMissing(db, 'install_records', 'managedEntriesJson', `managedEntriesJson TEXT NOT NULL DEFAULT '[]'`)
  addColumnIfMissing(db, 'install_records', 'managementState', "managementState TEXT NOT NULL DEFAULT 'managed'")
  addColumnIfMissing(db, 'install_records', 'removedAt', 'removedAt INTEGER NOT NULL DEFAULT 0')
  addColumnIfMissing(db, 'install_records', 'removalScope', "removalScope TEXT NOT NULL DEFAULT ''")
}
