export const exportAPI = {
  async exportByFile(username: string, method: string, data: string) {
    return await window.export.exportToFile({
      username,
      method,
      data,
    })
  },
  async exportByURL() {},
}
