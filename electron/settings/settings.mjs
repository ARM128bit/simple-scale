import { app } from 'electron'
import fs from 'fs'
import path from 'path'

export function getAppConfigFolder() {
  // Get Electron's userData path (per app)
  const configPath = app.getPath('appData')

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
  const settings = handleGetSettings()
  if (!fs.existsSync(settings.export.worksheet_folder_path)) {
    fs.mkdirSync(settings.export.worksheet_folder_path, { recursive: true })
    console.log('Worksheet folder created:', settings.export.worksheet_folder_path)
  } else {
    console.log('Worksheet folder already exists:', settings.export.worksheet_folder_path)
  }
}

function defaultSettings() {
  return {
    export: {
      url: '',
      worksheet_folder_path: path.join(app.getPath('documents'), 'ProgressBalance'),
      folder_path: '',
    },
    worksheet_columns: [
      { name: 'expand', required: true, visible: true },
      { name: 'lab_id', required: true, visible: true },
      { name: 'crucible_id', required: true, visible: true },
      { name: 'crucible_weight', required: true, visible: true },
      { name: 'sample_weight', required: true, visible: true },
      { name: 'final_weight', required: true, visible: true },
      { name: 'result', required: true, visible: true },
      { name: 'laborant', visible: false },
      { name: 'calculated_at', visible: false },
      { name: 'exported_at', visible: false },
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
    fs.writeFileSync(path.join(appConfigFolder, 'config.json'), JSON.stringify(payload), 'utf8')
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
    return JSON.parse(configStr)
  } catch (e) {
    console.error(e)
  }
}
