import type { SkillMeta } from '../shared/types'
import { getDb } from './db'
import { nowEpoch } from './time'

export function getSkillMeta(pairId: number, skillName: string): SkillMeta | null {
  return (
    (getDb()
      .prepare('SELECT * FROM skill_meta WHERE pairId=? AND skillName=?')
      .get(pairId, skillName) as SkillMeta) ?? null
  )
}

export function listSkillMetas(pairId: number): SkillMeta[] {
  return getDb()
    .prepare('SELECT * FROM skill_meta WHERE pairId=?')
    .all(pairId) as SkillMeta[]
}

export function saveSkillMeta(
  pairId: number,
  skillName: string,
  note: string,
  projectTags: string,
  funcTags: string,
  customTags: string
): SkillMeta {
  const database = getDb()
  database.prepare(`
    INSERT INTO skill_meta (pairId, skillName, note, projectTags, funcTags, customTags)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(pairId, skillName) DO UPDATE SET
      note=excluded.note,
      projectTags=excluded.projectTags,
      funcTags=excluded.funcTags,
      customTags=excluded.customTags
  `).run(pairId, skillName, note, projectTags, funcTags, customTags)
  return getSkillMeta(pairId, skillName)!
}

export function touchSkillTargetPromotedAt(
  pairId: number,
  skillName: string,
  lastTargetPromotedAt: number = nowEpoch()
): SkillMeta {
  const database = getDb()
  database.prepare(`
    INSERT INTO skill_meta (pairId, skillName, lastTargetPromotedAt)
    VALUES (?, ?, ?)
    ON CONFLICT(pairId, skillName) DO UPDATE SET
      lastTargetPromotedAt=excluded.lastTargetPromotedAt
  `).run(pairId, skillName, lastTargetPromotedAt)
  return getSkillMeta(pairId, skillName)!
}
