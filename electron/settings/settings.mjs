import os from 'os'
import fs from 'fs'
import path from 'path'

function getDocumentsPath() {
  const home = os.homedir()

  if (process.platform === 'win32') {
    // Windows: usually "C:\Users\<User>\Documents"
    return path.join(home, 'Documents')
  }

  if (process.platform === 'darwin') {
    // macOS: usually "/Users/<User>/Documents"
    return path.join(home, 'Documents')
  }

  if (process.platform === 'linux') {
    // Linux: might vary depending on XDG settings
    const xdgDocuments = path.join(home, 'Documents')
    const userDirsFile = path.join(home, '.config', 'user-dirs.dirs')

    try {
      const content = fs.readFileSync(userDirsFile, 'utf8')
      const match = content.match(/^XDG_DOCUMENTS_DIR="?(.+)"?$/m)
      if (match) {
        let dir = match[1].replace('$HOME', home)
        return dir
      }
    } catch {
      // Fallback
    }

    return xdgDocuments
  }

  // Default fallback
  return path.join(home, 'Documents')
}

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
    handleSetSettings(undefined, defaultSettings())
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

function defaultSettings() {
  return {
    export: {
      url: '',
      worksheet_folder_path: path.join(getDocumentsPath(), 'ProgressBalance'),
      folder_path: '',
      extension: '',
      data_template: '{lab_id}={result}',
    },
    worksheet_columns: [
      { name: 'expand', required: true, visible: true },
      { name: 'lab_id', required: true, visible: true },
      { name: 'crucible_id', required: true, visible: true },
      { name: 'crucible_weight', required: true, visible: true },
      { name: 'sample_weight', required: true, visible: true },
      { name: 'final_weight', required: true, visible: true },
      { name: 'result', required: true, visible: true },
      { name: 'exported_at', required: true, visible: true },
      { name: 'laborant', visible: false },
      { name: 'calculated_at', visible: false },
      { name: 'scale_no', visible: false },
    ],
    serial_port: {
      path: '',
      baudrate: 1200,
      databits: 7,
      stopbit: 1,
      pairly: 'odd',
      termination_code: 'CRLF',
    },
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
