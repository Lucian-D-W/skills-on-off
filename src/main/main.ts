import fsSync from 'fs'
import { app, BrowserWindow, Menu, Tray, nativeImage } from 'electron'
import path from 'path'
import { getMainProcessMessage } from './mainI18n'
import { registerHandlers } from './ipcHandlers'

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged
let mainWindow: BrowserWindow | null = null
let appTray: Tray | null = null
let isQuitting = false

function resolveAppIconPath() {
  const appPath = app.getAppPath()
  const candidates = [
    path.join(process.resourcesPath, 'app-icon.png'),
    path.join(appPath, 'public', 'app-icon.png'),
    path.join(appPath, 'dist', 'app-icon.png'),
  ]

  return candidates.find((candidate) => fsSync.existsSync(candidate)) ?? candidates[0]
}

function createTrayIcon() {
  const icon = nativeImage.createFromPath(resolveAppIconPath())
  if (process.platform === 'win32') {
    return icon.resize({ width: 16, height: 16 })
  }
  return icon
}

function showMainWindow() {
  if (!mainWindow) return
  if (!mainWindow.isVisible()) mainWindow.show()
  if (mainWindow.isMinimized()) mainWindow.restore()
  mainWindow.focus()
}

function createTray() {
  if (appTray) return
  const locale = app.getLocale()

  appTray = new Tray(createTrayIcon())
  appTray.setToolTip('skills on-off')
  appTray.setContextMenu(
    Menu.buildFromTemplate([
      { label: getMainProcessMessage('trayShowMainWindow', locale), click: () => showMainWindow() },
      {
        label: getMainProcessMessage('trayQuit', locale),
        click: () => {
          isQuitting = true
          app.quit()
        },
      },
    ])
  )
  appTray.on('click', () => showMainWindow())
  appTray.on('double-click', () => showMainWindow())
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'skills on-off',
    backgroundColor: '#0f0f0f',
    icon: resolveAppIconPath(),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })
  mainWindow = win

  win.on('close', (event) => {
    if (isQuitting) return
    event.preventDefault()
    win.hide()
  })
  win.on('closed', () => {
    if (mainWindow === win) mainWindow = null
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  win.webContents.on('did-finish-load', () => {
    void win.webContents
      .executeJavaScript('({ hasSkillApi: !!window.skillApi, href: location.href, title: document.title })')
      .then((info) => {
        console.log('[skill-manager] renderer bridge', info)
      })
      .catch((error) => {
        console.error('[skill-manager] bridge probe failed', error)
      })
  })
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null)
  registerHandlers()
  createTray()
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
    else showMainWindow()
  })
})

app.on('before-quit', () => {
  isQuitting = true
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
