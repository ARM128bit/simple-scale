import { DatabaseSync } from 'node:sqlite'
import { getAppConfigFolder } from './settings/settings.mjs'
import path from 'path'

const database = new DatabaseSync(path.join(getAppConfigFolder(), 'main.db'))

export default database
