export const exportAPI = {
  async exportByFile({
    username,
    method,
    data,
  }: {
    username: string
    method: string
    data: string
  }) {
    return await window.export.exportToFile({
      username,
      method,
      data,
    })
  },
  async exportByURL(url: string) {
    return await window.export.exportToURL(url)
  },
}
