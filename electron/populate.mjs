import db from './database.mjs'
import { handleSetMethods } from './settings/methods.mjs'

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
  regex TEXT NOT NULL
);`

const methodsSQL = `CREATE TABLE IF NOT EXISTS methods (
  code TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  calc_type TEXT CHECK( calc_type IN ('LOSS','RESIDUE') ) NOT NULL,
  const_weight_rule TEXT,
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

const methods = [
  {
    code: 'COA__GO111',
    name: 'Зольность',
    calc_type: 'LOSS',
    const_weight_rule: null,
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
    enabled: 1,
  },
  {
    code: 'COVM__GO111',
    name: 'Летучки',
    calc_type: 'LOSS',
    const_weight_rule: null,
    repeatability_rules: [],
    enabled: 1,
  },
]

handleSetMethods(null, methods)

db.close()
