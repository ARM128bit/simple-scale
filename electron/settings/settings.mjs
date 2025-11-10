import os from 'os'
import fs from 'fs'
import path from 'path'

export function getAppDataPath() {
  const home = os.homedir()

  switch (process.platform) {
    case 'win32':
      // Windows has multiple AppData folders:
      // - %APPDATA% → Roaming (usually preferred)
      // - %LOCALAPPDATA% → Local
      return process.env.APPDATA || path.join(home, 'AppData', 'Roaming')

    case 'darwin':
      // macOS: ~/Library/Application Support
      return path.join(home, 'Library', 'Application Support')

    case 'linux':
      // Linux: XDG standard or fallback to ~/.config
      return process.env.XDG_CONFIG_HOME || path.join(home, '.config')

    default:
      // Fallback for unknown systems
      return path.join(home, '.config')
  }
}

export function getAppConfigFolder() {
  // Get Electron's userData path (per app)
  const configPath = getAppDataPath()

  // Define your config folder path inside userData
  const appConfigFolder = path.join(configPath, 'ProgressBalance')

  // Ensure the folder exists
  if (!fs.existsSync(appConfigFolder)) {
    fs.mkdirSync(appConfigFolder, { recursive: true })
    console.log('Config folder created:', appConfigFolder)
  } else {
    console.log('Config folder already exists:', appConfigFolder)
  }

  return appConfigFolder
}

export function createWorksheetFolder() {
  try {
    const strSettings = handleGetSettings()
    const settings = JSON.parse(strSettings)
    if (!fs.existsSync(settings.export.worksheet_folder_path)) {
      fs.mkdirSync(settings.export.worksheet_folder_path, { recursive: true })
      console.log('Worksheet folder created:', settings.export.worksheet_folder_path)
    } else {
      console.log('Worksheet folder already exists:', settings.export.worksheet_folder_path)
    }
  } catch (e) {
    console.log(e)
  }
}

export function handleSetSettings(event, payload) {
  try {
    const appConfigFolder = getAppConfigFolder()
    fs.writeFileSync(path.join(appConfigFolder, 'config.json'), payload, 'utf8')
    return true
  } catch (e) {
    console.log(e)
    return false
  }
}

export function handleGetSettings() {
  try {
    const appConfigFolder = getAppConfigFolder()
    const configStr = fs.readFileSync(path.join(appConfigFolder, 'config.json'), 'utf8')
    return configStr
  } catch (e) {
    console.error(e)
  }
}
