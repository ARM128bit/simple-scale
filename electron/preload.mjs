import { contextBridge, ipcRenderer } from 'electron'
contextBridge.exposeInMainWorld('settings', {
  getUsers: () => ipcRenderer.invoke('getUsers'),
  setUsers: (payload) => ipcRenderer.invoke('setUsers', payload),
  getScales: () => ipcRenderer.invoke('getScales'),
  setScales: (payload) => ipcRenderer.invoke('setScales', payload),
  getMethods: () => ipcRenderer.invoke('getMethods'),
  setMethods: (payload) => ipcRenderer.invoke('setMethods', payload),
  getSettings: () => ipcRenderer.invoke('settings:load'),
  setSettings: (payload) => ipcRenderer.invoke('settings:save', payload),
})

contextBridge.exposeInMainWorld('serialPort', {
  initSerialPort: (payload) => ipcRenderer.send('serial-port:init', payload),
  listenSerialPort: (callback) =>
    ipcRenderer.on('serial-port:listen', (_event, value) => callback(value)),
  successfulOpenSerialPort: (callback) =>
    ipcRenderer.on('serial-port:successfully-opened', (_event, value) => callback(value)),
  closeSerialPort: () => ipcRenderer.invoke('serial-port:close'),
})

contextBridge.exposeInMainWorld('worksheet', {
  openWorksheet: () => ipcRenderer.invoke('worksheet:open'),
  saveWorksheet: (payload) => ipcRenderer.invoke('worksheet:save', payload),
})

contextBridge.exposeInMainWorld('export', {
  exportToURL: (payload) => ipcRenderer.invoke('export:url', payload),
  exportToFile: (payload) => ipcRenderer.invoke('export:file', payload),
})
