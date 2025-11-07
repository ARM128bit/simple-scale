import db from '../database.mjs'

export function handleSetScales(event, payload) {
  try {
    db.exec('DELETE FROM scales;')
    const insertStatement = db.prepare(
      'INSERT INTO scales (code, name, enabled, regex, serial_no) VALUES (?, ?, ?, ?, ?)',
    )
    for (const scale of payload) {
      insertStatement.run(scale.code, scale.name, +scale.enabled, scale.regex)
    }
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

export function handleGetScales() {
  const scalesStatement = db.prepare('SELECT * FROM scales')
  return scalesStatement.all()
}
