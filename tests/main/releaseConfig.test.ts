import fs from 'fs'
import path from 'path'
import { describe, expect, test } from 'vitest'

const repoRoot = path.resolve(__dirname, '..', '..')
const packageJsonPath = path.join(repoRoot, 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as {
  scripts?: Record<string, string>
  build?: {
    directories?: { output?: string; buildResources?: string }
    win?: { target?: string[]; icon?: string }
  }
}

describe('release packaging config', () => {
  test('uses skills on-off as the packaged product name', () => {
    expect(packageJson.build?.productName).toBe('skills on-off')
  })

  test('declares a Windows release script', () => {
    expect(packageJson.scripts?.['release:win']).toBeTruthy()
  })

  test('points electron-builder at the packaged icon assets', () => {
    expect(packageJson.build?.directories?.buildResources).toBe('build')
    expect(packageJson.build?.win?.icon).toBe('build/icon.ico')
  })
})
