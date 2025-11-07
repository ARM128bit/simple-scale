export const settingsAPI = {
  async save(settings: IConfigSetting) {
    await window.settings.setSettings(JSON.stringify(settings))
  },
  async load(): Promise<IConfigSetting> {
    const res = await window.settings.getSettings()
    return JSON.parse(res)
  },
}
