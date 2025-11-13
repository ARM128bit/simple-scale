import os from 'os'
import fs from 'fs'
import path from 'path'
import { handleSetUsers } from './settings/users.mjs'
import { handleSetScales } from './settings/scales.mjs'
import { handleSetMethods } from './settings/methods.mjs'
import { handleSetSettings } from './settings/settings.mjs'
import db from './database.mjs'

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

const usersSQL = `CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);`

const scalesSQL = `CREATE TABLE IF NOT EXISTS scales (
  code TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  regex TEXT NOT NULL,
  serial_no TEXT NULL
);`

const methodsSQL = `CREATE TABLE IF NOT EXISTS methods (
  code TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  calc_type TEXT CHECK( calc_type IN ('LOSS','RESIDUE') ) NOT NULL,
  const_weight_rule TEXT,
  significant_digit NOT NULL DEFAULT 2,
  enabled INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);`

const methodsRepeatabilityRulesSQL = `CREATE TABLE IF NOT EXISTS methods_repeatability_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL,
  start INTEGER NOT NULL,
  end INTEGER NOT NULL,
  type TEXT NOT NULL,
  value INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT device_fk_code FOREIGN KEY (code)
        REFERENCES methods (code) ON UPDATE CASCADE ON DELETE CASCADE
);`

db.exec(usersSQL)
db.exec(scalesSQL)
db.exec(methodsSQL)
db.exec(methodsRepeatabilityRulesSQL)

const methods: IMethod<Omit<IRepeatabilityRule, 'id' | 'code'>>[] = [
  {
    code: 'COA__GO111',
    name: 'Зольность',
    calc_type: 'LOSS',
    const_weight_rule: '0.2%',
    significant_digit: 2,
    repeatability_rules: [
      {
        start: 0,
        end: 10,
        type: 'absolute',
        value: 0.2,
      },
      {
        start: 10,
        end: 100,
        type: 'relative',
        value: 0.02,
      },
    ],
    enabled: true,
  },
  {
    code: 'COVM__GO111',
    name: 'Летучки',
    calc_type: 'LOSS',
    const_weight_rule: null,
    significant_digit: 2,
    repeatability_rules: [],
    enabled: true,
  },
]

const users: Omit<IUser, 'fullName'>[] = [
  {
    first_name: 'Yuri',
    last_name: 'Antonevich',
    enabled: 1,
  },
]

const scales: IScale[] = [
  {
    code: 'usb',
    name: 'usb',
    enabled: 1,
    regex: '\\d+.\\d+',
  },
]

export function defaultSettings() {
  return JSON.stringify({
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
  })
}

handleSetUsers(undefined, users)
handleSetScales(undefined, scales)
handleSetMethods(undefined, methods)
handleSetSettings(undefined, defaultSettings())

db.close()
