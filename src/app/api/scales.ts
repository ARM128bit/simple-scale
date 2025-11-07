export const scalesAPI = {
  async save(scales: IScale[]) {
    await window.settings.setScales(scales)
  },
  async load(): Promise<IScale[]> {
    return await window.settings.getScales()
  },
}
