export const templatesAPI = {
  async create(template: ITemplate) {
    await window.settings.createTemplate(template)
  },
  async load(): Promise<ITemplate[]> {
    return await window.settings.getTemplates()
  },
  async updateTemplate(template: ITemplate) {
    return await window.settings.updateTemplate(template)
  },
  async deleteTemplate(template: ITemplate) {
    return await window.settings.deleteTemplate(template)
  },
  async openTemplate(): Promise<{ name: string; path: string }> {
    return await window.settings.openTemplateFile()
  },
}
