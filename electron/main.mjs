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
import { openWorksheet, saveWorksheet, exportToFile } from './worksheet.mjs'
import serialSingleton, { handleCloseSerialPort, handleInitSerialPort } from './serialport.mjs'

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(import.meta.dirname, 'preload.js'),
      nodeIntegration: true,
    },
  })
  win.webContents.openDevTools()

  // win.loadFile('dist/index.html')
  win.loadURL('http://localhost:5173')
  return win
}

const sendSerialDataToRenderer = (window) => {
  return (data) => {
    window.webContents.send('serial-port:listen', data)
  }
}

const sendSuccessOpenPortToRenderer = (window) => {
  return (data) => {
    window.webContents.send('serial-port:successfully-opened', data)
  }
}

app.whenReady().then(() => {
  const mainWindow = createWindow()
  ipcMain.handle('setUsers', handleSetUsers)
  ipcMain.handle('getUsers', handleGetUsers)
  ipcMain.handle('setScales', handleSetScales)
  ipcMain.handle('getScales', handleGetScales)
  ipcMain.handle('setMethods', handleSetMethods)
  ipcMain.handle('getMethods', handleGetMethods)
  ipcMain.handle('settings:save', handleSetSettings)
  ipcMain.handle('settings:load', handleGetSettings)
  ipcMain.on('serial-port:init', (event, payload) =>
    handleInitSerialPort(
      sendSuccessOpenPortToRenderer(mainWindow),
      sendSerialDataToRenderer(mainWindow),
      payload,
    ),
  )
  ipcMain.handle('serial-port:close', handleCloseSerialPort)

  ipcMain.handle('worksheet:save', saveWorksheet)
  ipcMain.handle('worksheet:open', openWorksheet)

  ipcMain.handle('export:file', exportToFile)

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
