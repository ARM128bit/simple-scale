import fs from 'node:fs/promises'
import path from 'path'
import { tmpdir } from 'node:os'
import { BlobClass } from './blob.abstract.mjs'
import { Office } from './office.abstract.mjs'

export class LibreOfficeDOCGenerator extends BlobClass {
  private office: Office
  constructor(blob: Buffer, office: Office) {
    super(blob)
    this.office = office
  }

  async generate(infilter?: string) {
    const tmpDir = await tmpdir()
    const userInstallationDir = await tmpdir()
    await fs.writeFile(path.join(tmpDir, 'source.docx'), this.blob)

    const command = [
      '--headless',
      ...(infilter ? [infilter] : []),
      `"-env:UserInstallation=file:///${userInstallationDir}"`,
      '--convert-to',
      'docx:"MS Word 2007 XML"',
      '--outdir',
      tmpDir,
      path.join(tmpDir, 'source'),
    ]

    await this.office.execute(command)

    return path.join(tmpDir, 'source.docx')
    // const docx = await fs.readFile()
    // return docx
  }
}
