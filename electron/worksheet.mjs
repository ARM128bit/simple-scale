import fs from 'fs'
import path from 'path'
import { dialog } from 'electron'
import { handleGetSettings } from './settings/settings.mjs'

export async function openWorksheet(event) {
  try {
    const strSetting = handleGetSettings()
    const settings = JSON.parse(strSetting)
    const file = await dialog.showOpenDialog({
      defaultPath: settings.export.worksheet_folder_path,
      properties: ['openFile'],
    })
    if (!file.canceled) {
      const data = fs.readFileSync(file.filePaths[0], 'utf8')
      return { data, path: file.filePaths[0] }
    }
  } catch (e) {
    console.error(e)
  }
}

export async function saveWorksheet(event, { username, method, data, path: worksheet_path }) {
  try {
    const strSetting = handleGetSettings()
    const settings = JSON.parse(strSetting)
    const now = new Date().toISOString().split('T')[0]
    const filePath = worksheet_path
      ? worksheet_path
      : path.join(settings.export.worksheet_folder_path, `${username}_${method}_${now}.csv`)
    fs.writeFileSync(filePath, data, 'utf8')
    return filePath
  } catch (e) {
    console.error(e)
  }
}

export async function exportToFile(event, { username, method, data }) {
  // try {
  const strSetting = handleGetSettings()
  const settings = JSON.parse(strSetting)
  const now = new Date().toISOString()
  const _path = path.join(
    settings.export.folder_path,
    `${username}_${method}_${now}.${settings.export.extension}`,
  )

  fs.writeFileSync(_path, data, 'utf8')
  //   return true
  // } catch (e) {
  //   console.error(e)
  //   return false
  // }
}
