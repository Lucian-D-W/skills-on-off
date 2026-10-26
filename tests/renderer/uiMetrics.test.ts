import { describe, expect, it } from 'vitest'
import { uiMetrics } from '../../src/renderer/styles/uiMetrics'

describe('uiMetrics', () => {
  it('raises the base reading sizes above the previous compact defaults', () => {
    expect(uiMetrics.bodyFontSize).toBeGreaterThanOrEqual(13)
    expect(uiMetrics.monoFontSize).toBeGreaterThanOrEqual(13)
    expect(uiMetrics.sectionTitleSize).toBeGreaterThanOrEqual(13)
  })

  it('keeps primary card spacing in the comfortable range', () => {
    expect(uiMetrics.cardPadding).toBeGreaterThanOrEqual(20)
    expect(uiMetrics.listRowPaddingY).toBeGreaterThanOrEqual(14)
    expect(uiMetrics.controlHeight).toBeGreaterThanOrEqual(32)
  })
})
