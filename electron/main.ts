import { ipcMain } from 'electron'
import { app, BrowserWindow } from 'electron/main'
import path from 'path'

import database from './database.mjs'

import { handleGetUsers, handleSetUsers } from './settings/users.mjs'
import { handleGetScales, handleSetScales } from './settings/scales.mjs'
import { handleGetMethods, handleSetMethods } from './settings/methods.mjs'
import {
  createWorksheetFolder,
  handleGetSettings,
  handleSetSettings,
} from './settings/settings.mjs'
import { exportToFile, exportToURL } from './export.mjs'
import { openWorksheet, saveWorksheet } from './worksheet.mjs'
import serialSingleton, { handleCloseSerialPort, handleInitSerialPort } from './serialport.mjs'
import { printPdfFile } from './reports/print-worksheet.mjs'
import {
  handleGetTemplates,
  handleCreateTemplate,
  handleUpdateTemplate,
  handleDeleteTemplate,
  openTemplate,
} from './settings/templates.mjs'

const isDev = process.env.NODE_ENV === 'development'

console.log('development', isDev)

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(import.meta.dirname, 'preload.mjs'),
      nodeIntegration: true,
      devTools: isDev,
    },
  })
  if (isDev) win.webContents.openDevTools({ mode: 'detach' })

  if (!isDev) win.loadFile('dist/prod.html')
  if (isDev) win.loadURL('http://localhost:5173')

  return win
}

const sendSerialDataToRenderer = (window: BrowserWindow) => {
  return (data: string) => {
    window.webContents.send('serial-port:listen', data)
  }
}

const sendSuccessOpenPortToRenderer = (window: BrowserWindow) => {
  return (data: boolean) => {
    window.webContents.send('serial-port:successfully-opened', data)
  }
}

app.whenReady().then(() => {
  const mainWindow = createWindow()
  ipcMain.handle('users:set', handleSetUsers)
  ipcMain.handle('users:get', handleGetUsers)
  ipcMain.handle('scales:set', handleSetScales)
  ipcMain.handle('scales:get', handleGetScales)
  ipcMain.handle('methods:set', handleSetMethods)
  ipcMain.handle('methods:get', handleGetMethods)
  ipcMain.handle('settings:save', handleSetSettings)
  ipcMain.handle('settings:load', handleGetSettings)

  ipcMain.handle('templates:get', handleGetTemplates)
  ipcMain.handle('template:create', handleCreateTemplate)
  ipcMain.handle('template:update', handleUpdateTemplate)
  ipcMain.handle('template:delete', handleDeleteTemplate)
  ipcMain.handle('templates:open-template', openTemplate)

  ipcMain.on('serial-port:init', () =>
    handleInitSerialPort(
      sendSuccessOpenPortToRenderer(mainWindow),
      sendSerialDataToRenderer(mainWindow),
    ),
  )
  ipcMain.handle('serial-port:close', handleCloseSerialPort)

  ipcMain.handle('worksheet:save', saveWorksheet)
  ipcMain.handle('worksheet:open', openWorksheet)

  ipcMain.handle('export:file', exportToFile)
  ipcMain.handle('export:url', exportToURL)

  ipcMain.handle('print:pdf', printPdfFile)

  createWorksheetFolder()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    serialSingleton.close()
    database.close()
    app.quit()
  }
})
