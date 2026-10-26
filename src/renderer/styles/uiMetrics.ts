export const uiMetrics = {
  bodyFontSize: 13,
  monoFontSize: 13,
  mutedFontSize: 12,
  eyebrowFontSize: 11,
  sectionTitleSize: 13,
  listTitleSize: 15,
  pageTitleSize: 30,
  cardPadding: 22,
  listRowPaddingY: 15,
  listRowPaddingX: 18,
  controlHeight: 34,
  pillFontSize: 11,
  chipFontSize: 12,
} as const

export type UiMetrics = typeof uiMetrics
