import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'
import { migrateDatabase } from './migrations'

let db: Database.Database

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(app.getPath('userData'), 'skill-manager.db')
    db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    migrateDatabase(db)
  }
  return db
}
