import { contextBridge, ipcRenderer } from 'electron'
contextBridge.exposeInMainWorld('settings', {
  getUsers: () => ipcRenderer.invoke('getUsers'),
  setUsers: (payload) => ipcRenderer.invoke('setUsers', payload),
  getScales: () => ipcRenderer.invoke('getScales'),
  setScales: (payload) => ipcRenderer.invoke('setScales', payload),
  getMethods: () => ipcRenderer.invoke('getMethods'),
  setMethods: (payload) => ipcRenderer.invoke('setMethods', payload),
  getSettings: () => ipcRenderer.invoke('getSettings'),
  setSettings: (payload) => ipcRenderer.invoke('setSettings', payload),
})

contextBridge.exposeInMainWorld('serialPort', {
  initSerialPort: (payload) => ipcRenderer.send('serial-port:init', payload),
  successfulCloseSerialPort: (callback) =>
    ipcRenderer.invoke('serial-port:close', (_event, value) => callback(value)),
  listenSerialPort: (callback) =>
    ipcRenderer.on('serial-port:listen', (_event, value) => callback(value)),
  successfulOpenSerialPort: (callback) =>
    ipcRenderer.on('serial-port:successfully-opened', (_event, value) => callback(value)),
})

contextBridge.exposeInMainWorld('worksheet', {
  saveWorksheet: (payload) => ipcRenderer.send('worksheet:save', payload),
  openWorksheet: (payload) => ipcRenderer.invoke('openWorksheet', payload),
})
