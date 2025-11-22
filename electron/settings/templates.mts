import path from 'path'
import { dialog } from 'electron'
import fs from 'node:fs/promises'
import db from '../database.mjs'
import { handleGetSettings } from './settings.mjs'

async function updateTemplatesMethods(templateId: number | bigint, methods: string[]) {
  const deleteTemplatesMethods = db.prepare('DELETE FROM templates_methods WHERE template_id = ?')
  deleteTemplatesMethods.run(templateId)
  for (const method of methods ?? []) {
    if (!method) continue
    const insertTemplatesMethodsStatement = db.prepare(
      'INSERT INTO templates_methods (method_code, template_id) VALUES (?, ?)',
    )
    insertTemplatesMethodsStatement.run(method, templateId)
  }
}

export async function openTemplate() {
  try {
    const strSetting = handleGetSettings()
    if (!strSetting) return
    const settings = JSON.parse(strSetting)
    const res = (await dialog.showOpenDialog({
      filters: [
        { name: 'All Files', extensions: ['*'] },
        { name: 'Microsoft Word', extensions: ['docx'] },
      ],
      defaultPath: settings.export.worksheet_folder_path,
      properties: ['openFile'],
    })) as unknown as { canceled: boolean; filePaths: string[] }
    if (!res.canceled) {
      return { path: res.filePaths[0], name: path.basename(res.filePaths[0]) }
    }
  } catch (e) {
    console.error(e)
  }
}

export async function handleCreateTemplate(
  event: Electron.IpcMainInvokeEvent | undefined,
  template: NonNullableFields<ITemplate>,
) {
  try {
    if (!template.file.path || template.id) return
    const insertStatement = db.prepare(
      'INSERT INTO templates (title, file_name, blob) VALUES (?, ?, ?);',
    )
    const fileBuffer = await fs.readFile(template.file.path)
    const insertedTemplates = insertStatement.run(
      template.title,
      template.file.name,
      Buffer.from(fileBuffer),
    )
    await updateTemplatesMethods(insertedTemplates.lastInsertRowid, template.methods)
    return true
  } catch (e) {
    console.log(e)
    return false
  }
}

export async function handleUpdateTemplate(
  event: Electron.IpcMainInvokeEvent | undefined,
  template: NonNullableFields<ITemplate>,
) {
  try {
    if (!template?.id) return
    const updateStatement = db.prepare(
      `UPDATE templates SET
        title = COALESCE(?, title),
        file_name = COALESCE(?, file_name),
        blob = COALESCE(?, blob)
      WHERE id = ?`,
    )
    const fileBuffer = template.file.path ? await fs.readFile(template.file.path) : null
    updateStatement.run(template.title, template.file.name, fileBuffer, template.id)
    await updateTemplatesMethods(template.id, template.methods)
  } catch (e) {
    console.log(e)
  }
}

export function handleDeleteTemplate(
  event: Electron.IpcMainInvokeEvent | undefined,
  template: NonNullableFields<ITemplate>,
) {
  if (!template?.id) return
  const deletionPrepare = db.prepare('DELETE FROM templates WHERE id = ?;')
  deletionPrepare.run(template.id)
}

export function handleGetTemplates() {
  const templatesStatement = db.prepare(
    `SELECT
      json_object(
        'id', t.id,
        'title', t.title,
        'file', json_object('name', t.file_name),
        'methods', json_group_array(tm.method_code)
      ) result
    FROM templates as t
    LEFT OUTER JOIN templates_methods as tm
    ON t.id = tm.template_id
    GROUP BY t.id;`,
  )
  return templatesStatement.all().map((item) => JSON.parse(item.result as string))
}

export function handleGetTemplateBlob(id: number) {
  const templatesStatement = db.prepare(
    `SELECT id, title, file_name, blob FROM templates WHERE id = ?;`,
  )
  return templatesStatement.get(id)
}
