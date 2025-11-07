export const methodsAPI = {
  async save(methods: IMethodForm[]) {
    await window.settings.setMethods(methods)
  },
  async load(): Promise<IMethod[]> {
    return await window.settings.getMethods()
  },
}
