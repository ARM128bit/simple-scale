import db from '../database.mjs'

export function handleSetUsers(event, payload) {
  try {
    db.exec('DELETE FROM users;')
    const insertStatement = db.prepare(
      'INSERT INTO users (first_name, last_name, enabled, created_at) VALUES (?, ?, ?, ?)',
    )
    for (const user of payload) {
      insertStatement.run(user.first_name, user.last_name, +user.enabled, new Date().toISOString())
    }
    return true
  } catch (e) {
    console.log(e)
    return false
  }
}

export function handleGetUsers() {
  const usersStatement = db.prepare('SELECT * FROM users')
  return usersStatement.all()
}
