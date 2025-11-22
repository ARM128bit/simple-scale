import { contextBridge, ipcRenderer } from 'electron'
contextBridge.exposeInMainWorld('settings', {
  getUsers: () => ipcRenderer.invoke('users:get'),
  setUsers: (payload: Omit<IUser, 'fullName'>[]) => ipcRenderer.invoke('users:set', payload),
  getScales: () => ipcRenderer.invoke('scales:get'),
  setScales: (payload: IScale[]) => ipcRenderer.invoke('scales:set', payload),
  getMethods: () => ipcRenderer.invoke('methods:get'),
  setMethods: (payload: IMethod[]) => ipcRenderer.invoke('methods:set', payload),
  getSettings: () => ipcRenderer.invoke('settings:load'),
  setSettings: (payload: IConfigSetting) => ipcRenderer.invoke('settings:save', payload),
  getTemplates: () => ipcRenderer.invoke('templates:get'),
  createTemplate: (payload: ITemplate) => ipcRenderer.invoke('template:create', payload),
  updateTemplate: (payload: ITemplate) => ipcRenderer.invoke('template:update', payload),
  deleteTemplate: (payload: ITemplate) => ipcRenderer.invoke('template:delete', payload),
  openTemplateFile: () => ipcRenderer.invoke('templates:open-template'),
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
  printPdf: (payload: { template: ITemplate; worksheetData: string }) =>
    ipcRenderer.invoke('print:pdf', payload),
})

contextBridge.exposeInMainWorld('export', {
  exportToURL: (payload: string) => ipcRenderer.invoke('export:url', payload),
  exportToFile: (payload: { username: string; method: string; data: string }) =>
    ipcRenderer.invoke('export:file', payload),
})
