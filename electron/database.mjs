import { DatabaseSync } from 'node:sqlite'

const database = new DatabaseSync(`${import.meta.dirname}/main.db`)

export default database
