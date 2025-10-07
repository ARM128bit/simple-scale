import fs from 'fs'
import path from 'path'
import { dialog } from 'electron'
import { handleGetSettings } from './settings/settings.mjs'

export async function openWorksheet(event, default_path) {
  const file = await dialog.showOpenDialog({ defaultPath: default_path, properties: ['openFile'] })
  console.log(file)
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
