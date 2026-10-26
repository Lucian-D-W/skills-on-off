import { describe, expect, test } from 'vitest'
import { getPairDetailTabs } from '../../src/renderer/pages/pairDetailTabs'

describe('getPairDetailTabs', () => {
  test('keeps all tabs for whole-directory projection pairs', () => {
    expect(getPairDetailTabs('directory-copy', 'en').map((item) => item.id)).toEqual([
      'all',
      'enabled',
      'project',
      'func',
      'custom',
    ])
  })

  test('hides project and function tabs for custom content projection pairs', () => {
    expect(getPairDetailTabs('directory-contents-copy', 'en').map((item) => item.id)).toEqual([
      'all',
      'enabled',
      'custom',
    ])
  })

  test('localizes visible tab labels', () => {
    expect(getPairDetailTabs('directory-copy', 'zh-CN').map((item) => item.label)).toEqual([
      '全部',
      '已启用',
      '项目',
      '功能',
      '自定义',
    ])
  })
})
