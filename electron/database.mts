import path from 'path'
import { DatabaseSync } from 'node:sqlite'
import { getAppConfigFolder } from './settings/settings.mjs'

const database = new DatabaseSync(path.join(getAppConfigFolder(), 'main.db'))

export default database
