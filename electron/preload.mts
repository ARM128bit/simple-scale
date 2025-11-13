import { contextBridge, ipcRenderer } from 'electron'
contextBridge.exposeInMainWorld('settings', {
  getUsers: () => ipcRenderer.invoke('getUsers'),
  setUsers: (payload: Omit<IUser, 'fullName'>[]) => ipcRenderer.invoke('setUsers', payload),
  getScales: () => ipcRenderer.invoke('getScales'),
  setScales: (payload: IScale[]) => ipcRenderer.invoke('setScales', payload),
  getMethods: () => ipcRenderer.invoke('getMethods'),
  setMethods: (payload: IMethod[]) => ipcRenderer.invoke('setMethods', payload),
  getSettings: () => ipcRenderer.invoke('settings:load'),
  setSettings: (payload: IConfigSetting) => ipcRenderer.invoke('settings:save', payload),
})

contextBridge.exposeInMainWorld('serialPort', {
  initSerialPort: (payload: IScale) => ipcRenderer.send('serial-port:init', payload),
  listenSerialPort: (callback: (data: string) => void) =>
    ipcRenderer.on('serial-port:listen', (_event, value) => callback(value)),
  successfulOpenSerialPort: (callback: (data: boolean) => void) =>
    ipcRenderer.on('serial-port:successfully-opened', (_event, value) => callback(value)),
  closeSerialPort: () => ipcRenderer.invoke('serial-port:close'),
})

contextBridge.exposeInMainWorld('worksheet', {
  openWorksheet: () => ipcRenderer.invoke('worksheet:open'),
  saveWorksheet: (payload: { username: string; method: string; data: string; path?: string }) =>
    ipcRenderer.invoke('worksheet:save', payload),
})

contextBridge.exposeInMainWorld('export', {
  exportToURL: (payload: string) => ipcRenderer.invoke('export:url', payload),
  exportToFile: (payload: { username: string; method: string; data: string }) =>
    ipcRenderer.invoke('export:file', payload),
})
