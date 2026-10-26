import fs from 'fs'
import path from 'path'
import { describe, expect, test } from 'vitest'

const repoRoot = path.resolve(__dirname, '..', '..')

describe('branding and renderer regression guards', () => {
  test('uses skills on-off in the html document title', () => {
    const html = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8')
    expect(html).toContain('<title>skills on-off</title>')
  })

  test('keeps skillDetailHint scoped to the skill detail panel only', () => {
    const source = fs.readFileSync(path.join(repoRoot, 'src', 'renderer', 'pages', 'pairDetailModel.ts'), 'utf8')
    const countTagsStart = source.indexOf('export function countTags')
    const countTagsEnd = source.indexOf('export function tagsPreview')
    const countTagsBody = source.slice(countTagsStart, countTagsEnd)

    expect(countTagsStart).toBeGreaterThanOrEqual(0)
    expect(countTagsEnd).toBeGreaterThan(countTagsStart)
    expect(countTagsBody).not.toContain('skillDetailHint')
  })
})
