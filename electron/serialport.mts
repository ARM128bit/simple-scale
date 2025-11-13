import { ReadlineParser, SerialPort } from 'serialport'
import { handleGetSettings } from './settings/settings.mjs'

class SerialSingleton {
  static instance: SerialSingleton | null = null
  private port: SerialPort | null = null
  private parser: ReadlineParser | null = null
  constructor() {
    if (SerialSingleton.instance) {
      return SerialSingleton.instance
    }

    this.port = null
    this.parser = null

    SerialSingleton.instance = this
    return this
  }

  init(
    config: ISetting['serial_port'],
    openPortCallback: (data: boolean) => void,
    callback: (data: string) => void,
  ) {
    if (this.port) {
      this.port.close(() => {
        console.log('Порт закрыт')
      })
      this.port.destroy()
      this.port = null
    }

    this.port = new SerialPort({
      path: config.path,
      baudRate: config.baudrate,
      autoOpen: false,
    })

    this.port.open((err) => {
      if (err) {
        openPortCallback(false)
        return console.error('Ошибка открытия:', err.message)
      }
      openPortCallback(true)
    })
    this.parser = this.port.pipe(new ReadlineParser())
    this.parser.on('data', callback)

    return this.port
  }

  close() {
    if (this.port && this.port.isOpen) {
      return this.port.close(() => {
        console.log('Порт закрыт')
      })
    }
  }
}

const serialSingleton = new SerialSingleton()

export async function handleInitSerialPort(
  openPortCallback: (value: boolean) => void,
  dataCallback: (data: string) => void,
) {
  try {
    const strSetting = handleGetSettings()
    if (!strSetting) return
    const setting = JSON.parse(strSetting)
    serialSingleton.init(setting.serial_port, openPortCallback, dataCallback)
  } catch (e) {
    console.log(e)
  }
}

export async function handleCloseSerialPort() {
  try {
    serialSingleton.close()
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

export default serialSingleton
