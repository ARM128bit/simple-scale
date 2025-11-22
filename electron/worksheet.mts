import fs from 'fs'
import path from 'path'
import { dialog } from 'electron'
import { handleGetSettings } from './settings/settings.mjs'

export async function openWorksheet() {
  try {
    const strSetting = handleGetSettings()
    if (!strSetting) return
    const settings = JSON.parse(strSetting)
    const file = (await dialog.showOpenDialog({
      filters: [
        { name: 'All Files', extensions: ['*'] },
        { name: 'csv', extensions: ['csv'] },
      ],
      defaultPath: settings.export.worksheet_folder_path,
      properties: ['openFile'],
    })) as unknown as { canceled: boolean; filePaths: string[] }
    if (!file.canceled) {
      const data = fs.readFileSync(file.filePaths[0], 'utf8')
      return { data, path: file.filePaths[0] }
    }
  } catch (e) {
    console.error(e)
  }
}

export async function saveWorksheet(
  event: Electron.IpcMainInvokeEvent,
  {
    username,
    method,
    data,
    path: worksheet_path,
  }: { username: string; method: string; path: string; data: string },
) {
  try {
    const strSetting = handleGetSettings()
    if (!strSetting) return
    const settings = JSON.parse(strSetting)
    const now = new Date()
    const nowPath =
      now.toISOString().split('T')[0].replace(/-/g, '') +
      '_' +
      now.toLocaleTimeString().replace(/:/g, '-').slice(0, 5)

    const filePath = worksheet_path
      ? worksheet_path
      : path.join(settings.export.worksheet_folder_path, `${username}_${method}_${nowPath}.csv`)
    fs.writeFileSync(filePath, data, 'utf8')
    return filePath
  } catch (e) {
    console.error(e)
  }
}
