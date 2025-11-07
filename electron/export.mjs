import fs from 'fs'
import path from 'path'
import { dialog } from 'electron'
import { handleGetSettings } from './settings/settings.mjs'

export async function exportToFile(event, { username, method, data }) {
  try {
    const strSetting = handleGetSettings()
    const settings = JSON.parse(strSetting)
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

export async function exportToURL(event, url) {
  try {
    console.log(url)
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
