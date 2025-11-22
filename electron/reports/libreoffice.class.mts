import { execFile } from 'node:child_process'
import { Office } from './office.abstract.mjs'

function libreOfficePath(): string | null {
  // todo: find libreoffice binary, see https://github.com/elwerene/libreoffice-convert/blob/master/index.js
  switch (process.platform) {
    case 'linux':
      return '/usr/bin/libreoffice'
    default:
      break
  }

  return null
}

export default class LibreOffice extends Office {
  execute(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const exePath = libreOfficePath()
      if (!exePath) {
        return reject('Libreoffice path is undefined')
      }
      execFile(exePath, args, (error, stdout, stderr) => {
        if (!error || error.code === 1 || error.code === 0) {
          resolve(stdout)
        } else {
          reject(error)
        }
        if (stderr) {
          reject(stderr)
        }
        resolve(stdout)
      })
    })
  }
}
