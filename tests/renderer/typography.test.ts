import { describe, expect, it } from 'vitest'
import { typography } from '../../src/renderer/styles/typography'

describe('typography hierarchy', () => {
  it('uses the embedded UI font family', () => {
    expect(typography.family.ui).toContain('SkillUI')
    expect(typography.family.ui).toContain('sans-serif')
  })

  it('assigns heavier weights to more important interface levels', () => {
    expect(typography.weight.appTitle).toBeGreaterThan(typography.weight.sectionTitle)
    expect(typography.weight.sectionTitle).toBeGreaterThan(typography.weight.body)
    expect(typography.weight.listItemTitle).toBeGreaterThanOrEqual(typography.weight.body)
    expect(typography.weight.helper).toBeLessThanOrEqual(typography.weight.body)
  })
})
