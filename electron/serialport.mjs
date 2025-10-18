import { RegexParser, SerialPort } from 'serialport'
import { handleGetSettings } from './settings/settings.mjs'

class SerialSingleton {
  constructor() {
    if (SerialSingleton.instance) {
      return SerialSingleton.instance
    }

    this.port = null
    this.parser = null

    SerialSingleton.instance = this
    return this
  }

  init(config, openPortCallback, callback, regex) {
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

    this.parser = this.port.pipe(
      new RegexParser({ regex: new RegExp(regex, 'i'), encoding: 'utf8' }),
    )
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

export async function handleInitSerialPort(openPortCallback, dataCallback, regex) {
  try {
    const strSetting = handleGetSettings()
    const setting = JSON.parse(strSetting)
    serialSingleton.init(setting.serial_port, openPortCallback, dataCallback, regex)
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
