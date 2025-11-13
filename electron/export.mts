import fs from 'fs'
import path from 'path'
import { handleGetSettings } from './settings/settings.mjs'

export async function exportToFile(
  event: Electron.IpcMainInvokeEvent,
  { username, method, data }: { username: string; method: string; data: string },
) {
  try {
    const strSetting = handleGetSettings()
    if (!strSetting) return
    const settings = JSON.parse(strSetting) as IConfigSetting
    if (!settings.export.folder_path) return
    const now = new Date().toISOString()
    const _path = path.join(
      settings.export.folder_path,
      `${username}_${method}_${now}.${settings.export.extension}`,
    )

    fs.writeFileSync(_path, data, 'utf8')
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

export async function exportToURL(event: Electron.IpcMainInvokeEvent, url: string) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    console.log(response)
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}
