import { app, BrowserWindow, shell, ipcMain, systemPreferences } from 'electron'
import { spawn, ChildProcess } from 'node:child_process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import { update } from './features/update'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
let splash: BrowserWindow | null = null
let inputServer: ChildProcess | null = null

function startInputServer() {
  const isDev = !!process.env.VITE_DEV_SERVER_URL
  const exeName = process.platform === 'win32' ? 'input-server.exe' : 'input-server'

  let serverPath = ''
  if (isDev) {
    serverPath = path.join(process.env.APP_ROOT, 'tools/input-server/target/release', exeName)
  } else {
    serverPath = path.join(process.resourcesPath, exeName)
  }

  console.log('Starting input server at:', serverPath)

  try {
    inputServer = spawn(serverPath, [], {
      stdio: ['pipe', 'inherit', 'inherit']
    })

    inputServer.on('error', (err) => {
      console.error('Failed to start input server:', err)
    })

    inputServer.on('exit', (code, signal) => {
      console.log(`Input server exited with code ${code} and signal ${signal}`)
      inputServer = null
    })
  } catch (error) {
    console.error('Error spawning input server:', error)
  }
}

const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

async function createSplashWindow() {
  splash = new BrowserWindow({
    width: 500,
    height: 300,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    center: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  })

  const splashHtml = path.join(process.env.VITE_PUBLIC, 'splash.html')
  splash.loadFile(splashHtml)

  splash.on('closed', () => {
    splash = null
  })
}

async function createWindow() {
  win = new BrowserWindow({
    title: 'YETI',
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false, // Frameless
    show: false, // Don't show until ready
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    backgroundColor: '#00000000', // Transparent background
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // but keeping it consistent with the template for now.
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    // win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())

    // Show main window after a delay to let splash animation finish
    setTimeout(() => {
      if (splash) {
        splash.close()
      }
      win?.show()
      win?.focus()
    }, 2500)
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  // Auto update
  update(win)
}

app.whenReady().then(() => {
  createSplashWindow()
  createWindow()
  startInputServer()
})

app.on('will-quit', () => {
  if (inputServer) {
    inputServer.kill()
  }
})

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})

// Window Controls
ipcMain.on('window-minimize', () => win?.minimize())
ipcMain.on('window-maximize', () => {
  if (win?.isMaximized()) {
    win.unmaximize()
  } else {
    win?.maximize()
  }
})
ipcMain.on('window-close', () => win?.close())

// Input Control IPC
ipcMain.on('input-event', (_, eventData) => {
  if (inputServer && inputServer.stdin) {
    const json = JSON.stringify(eventData) + '\n'
    inputServer.stdin.write(json)
  }
})

ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('check-media-access', async () => {
  if (process.platform !== 'darwin') return true
  const status = systemPreferences.getMediaAccessStatus('screen')
  return status === 'granted'
})

ipcMain.handle('request-accessibility', async () => {
  if (process.platform !== 'darwin') return true
  return systemPreferences.isTrustedAccessibilityClient(true)
})
