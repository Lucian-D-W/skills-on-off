import fs from 'fs'
import path from 'path'
import { describe, expect, test } from 'vitest'

const repoRoot = path.resolve(__dirname, '..', '..')

describe('migrations project_links compatibility guard', () => {
  test('falls back to a default projectTag when the legacy table does not provide that column', () => {
    const source = fs.readFileSync(path.join(repoRoot, 'src', 'main', 'migrations.ts'), 'utf8')

    expect(source).toContain("const legacyColumns = new Set(tableColumns(db, 'project_links'))")
    expect(source).toContain("const projectTagSelect = legacyColumns.has('projectTag')")
    expect(source).toContain(`? "COALESCE(NULLIF(projectTag, ''), 'default')"`)
    expect(source).toContain(": \"'default'\"")
  })
})
