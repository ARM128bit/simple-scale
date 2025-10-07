import fs from 'fs'
import path from 'path'
import { dialog } from 'electron'
import { handleGetSettings } from './settings/settings.mjs'

export async function openWorksheet(event) {
  const settings = handleGetSettings()
  const file = await dialog.showOpenDialog({
    defaultPath: settings.export.worksheet_folder_path,
    properties: ['openFile'],
  })
  if (!file.canceled) {
    const data = fs.readFileSync(file.filePaths[0], 'utf8')
    return data
  }
}

export async function saveWorksheet(event, { username, method, data }) {
  try {
    const settings = handleGetSettings()
    const now = new Date().toISOString().split('T')[0]
    fs.writeFileSync(
      path.join(settings.export.worksheet_folder_path, `${username}_${method}_${now}.csv`),
      data,
      'utf8',
    )
  } catch (e) {
    console.error(e)
  }
}
