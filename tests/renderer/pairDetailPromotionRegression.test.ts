import fs from 'fs'
import path from 'path'
import { describe, expect, test } from 'vitest'

const repoRoot = path.resolve(__dirname, '..', '..')

describe('pair detail promotion regression guards', () => {
  test('category tab workspace forwards promotion state instead of reaching for pair detail locals', () => {
    const source = fs.readFileSync(path.join(repoRoot, 'src', 'renderer', 'pages', 'pairDetailWorkspaces.tsx'), 'utf8')
    const categoryStart = source.indexOf('function CategoryTabWorkspace')
    const batchBarStart = source.indexOf('function CategoryBatchBar')
    const categoryBody = source.slice(categoryStart, batchBarStart)

    expect(categoryStart).toBeGreaterThanOrEqual(0)
    expect(batchBarStart).toBeGreaterThan(categoryStart)
    expect(categoryBody).not.toContain('activePromotionStatusBySkill={promotionStatuses}')
    expect(categoryBody).not.toContain('activePromotionBusyNames={promotionBusyKeys}')
    expect(categoryBody).not.toContain('refreshSkillPromotionStatus(')
    expect(categoryBody).not.toContain('promoteTargetToMainRepo(')
  })

  test('group detail workspace does not reach for outer promotion state directly', () => {
    const source = fs.readFileSync(path.join(repoRoot, 'src', 'renderer', 'pages', 'pairDetailGroupWorkspace.tsx'), 'utf8')
    const groupDetailStart = source.indexOf('function GroupDetailWorkspace')
    const groupDetailBody = source.slice(groupDetailStart)

    expect(groupDetailStart).toBeGreaterThanOrEqual(0)
    expect(groupDetailBody).not.toContain('promotionStatuses[')
    expect(groupDetailBody).not.toContain('promotionBusyKeys.')
    expect(groupDetailBody).not.toContain('promoteTargetToMainRepo(')
  })

  test('toggleSkill only shows overwrite confirmation when enabling a skill', () => {
    const source = fs.readFileSync(path.join(repoRoot, 'src', 'renderer', 'pages', 'usePairDetailController.ts'), 'utf8')

    expect(source).toMatch(
      /if\s*\(\s*!skill\.enabled\s*&&\s*promotionStatus\.targetExists\s*&&\s*promotionStatus\.targetDiffersFromSource\s*\)/
    )
  })
})
