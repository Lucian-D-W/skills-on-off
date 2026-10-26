import type { Pair } from '../shared/types'
import type { PairProjectionMode } from '../shared/importTypes'
import { getDb } from './db'

export function listPairs(): Pair[] {
  return getDb().prepare('SELECT * FROM pairs ORDER BY createdAt ASC').all() as Pair[]
}

export function createPair(
  name: string,
  sourcePath: string,
  targetPath: string,
  projectionMode: PairProjectionMode = 'directory-copy'
): Pair {
  const stmt = getDb().prepare(
    'INSERT INTO pairs (name, sourcePath, targetPath, projectionMode) VALUES (?, ?, ?, ?)'
  )
  const result = stmt.run(name, sourcePath, targetPath, projectionMode)
  return getPair(result.lastInsertRowid as number)!
}

export function getPair(id: number): Pair | null {
  return (getDb().prepare('SELECT * FROM pairs WHERE id = ?').get(id) as Pair) ?? null
}

export function updatePair(
  id: number,
  name: string,
  sourcePath: string,
  targetPath: string,
  projectionMode: PairProjectionMode
): Pair {
  getDb()
    .prepare('UPDATE pairs SET name=?, sourcePath=?, targetPath=?, projectionMode=? WHERE id=?')
    .run(name, sourcePath, targetPath, projectionMode, id)
  return getPair(id)!
}

export function deletePair(id: number): void {
  getDb().prepare('DELETE FROM pairs WHERE id = ?').run(id)
}
