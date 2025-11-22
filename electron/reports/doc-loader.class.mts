import { TemplateHandler } from 'easy-template-x'
import { ITemplateLoader } from './template-loader.interface.mjs'

// https://github.com/alonrbar/easy-template-x/issues/39#issuecomment-701059665
/**
 * easy-template-x не умеет считывать вложенные поля объектов
 * @param docData трансформируемый объект
 * @returns объект
 */
function unnest(docData: Record<string, any>) {
  var res: Record<string, any> = {}
  ;(function recurse(obj, current?: string) {
    for (var key in obj) {
      var value = obj[key]
      var newKey = current ? current + '.' + key : key // joined key with dot
      if (value && typeof value === 'object') {
        if (Array.isArray(value)) {
          res[newKey] = value.map(function (e) {
            if (typeof e == 'object') {
              return unnest(e)
            } else {
              return e
            }
          })
        } else {
          recurse(value, newKey) // it's a nested object, so do it again
        }
      } else {
        res[newKey] = value // it's not an object, so set the property
      }
    }
  })(docData)
  return res
}

export class DocLoader extends TemplateHandler implements ITemplateLoader {
  private readonly blob: Buffer
  constructor(blob: Buffer) {
    super()
    this.blob = blob
  }

  async render(data: any): Promise<Buffer> {
    return this.process(this.blob, unnest(data))
  }
}
