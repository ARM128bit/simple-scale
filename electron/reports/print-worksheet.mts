import path from 'path'
import fs from 'node:fs/promises'
import { BrowserWindow } from 'electron'
import LibreOffice from './libreoffice.class.mjs'
import { DocLoader } from './doc-loader.class.mjs'
import { LibreOfficePDFGenerator } from './libreoffice-pdf-generator.class.mjs'
import { handleGetTemplateBlob } from '../settings/templates.mjs'

export async function printPdfFile(
  event: Electron.IpcMainInvokeEvent | undefined,
  { template, worksheetData }: { template: ITemplate; worksheetData: string },
) {
  if (!template.id) return
  const res = handleGetTemplateBlob(template.id) as {
    id: number
    title: string
    file_name: string
    blob: Uint8Array
  }

  const docLoader = new DocLoader(Buffer.from(res.blob))
  const data = JSON.parse(worksheetData)

  const buffer = await docLoader.render({
    method: data[0]._method.name,
    laborant_first_name: data[0]._laborant.first_name,
    laborant_last_name: data[0]._laborant.last_name,
    parallels: data,
  })
  const generator = new LibreOfficePDFGenerator(buffer, new LibreOffice())
  const file = await generator.generate()
  const win = new BrowserWindow({ width: 800, height: 1500 })
  await win.loadURL('data:application/pdf;base64,' + file.toString('base64'))

  win.webContents.print({ silent: false })
}
