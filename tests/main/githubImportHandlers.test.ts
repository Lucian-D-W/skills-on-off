import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { IPC } from '../../src/shared/types'

const mocks = vi.hoisted(() => ({
  handlers: new Map<string, (...args: any[]) => any>(),
  importProjectIntoPair: vi.fn(),
  createPair: vi.fn(),
  getPair: vi.fn(),
  getPath: vi.fn(),
}))

vi.mock('electron', () => ({
  app: { getPath: mocks.getPath },
  dialog: {},
  ipcMain: { handle: (channel: string, handler: (...args: any[]) => any) => mocks.handlers.set(channel, handler) },
}))
vi.mock('../../src/main/projectLinking', () => ({ importProjectIntoPair: mocks.importProjectIntoPair }))
vi.mock('../../src/main/pairRepository', () => ({ createPair: mocks.createPair, getPair: mocks.getPair }))
vi.mock('../../src/main/targetRegistry', () => ({ ensureDefaultTarget: vi.fn() }))

const roots: string[] = []
afterEach(async () => {
  await Promise.all(roots.splice(0).map(root => fs.rm(root, { recursive: true, force: true })))
  vi.clearAllMocks()
})

describe('GitHub import mode routing', () => {
  test.each(['skills-import', 'directory-copy', 'directory-contents-copy', 'agent-files-copy'] as const)(
    'keeps %s distinct for both import entry points', async (mode) => {
      const root = await fs.mkdtemp(path.join(os.tmpdir(), 'import-handler-'))
      roots.push(root)
      const pair = { id: 7, name: 'demo', sourcePath: root, targetPath: path.join(root, 'target'), projectionMode: 'directory-copy', createdAt: 0 }
      mocks.getPath.mockReturnValue(root)
      mocks.createPair.mockReturnValue(pair)
      mocks.getPair.mockReturnValue(pair)
      mocks.importProjectIntoPair.mockResolvedValue({ importedSkillNames: ['demo'] })
      const { registerHandlers } = await import('../../src/main/ipcHandlers')
      registerHandlers()

      await mocks.handlers.get(IPC.SOURCE_GITHUB_IMPORT_TO_PAIR)!(null, 7, 'https://github.com/example/demo', mode)
      expect(mocks.importProjectIntoPair).toHaveBeenLastCalledWith(pair, 'https://github.com/example/demo', mode)
      await mocks.handlers.get(IPC.SOURCE_GITHUB_IMPORT)!(null, 'demo', 'https://github.com/example/demo', pair.targetPath, mode)
      expect(mocks.importProjectIntoPair).toHaveBeenLastCalledWith(pair, 'https://github.com/example/demo', mode)
    }
  )
})
