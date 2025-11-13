export const worksheetAPI = {
  async save({
    username,
    method,
    data,
    path,
  }: {
    username: string
    method: string
    data: string
    path?: string
  }) {
    return await window.worksheet.saveWorksheet({
      username,
      method,
      data,
      path,
    })
  },
  async open() {
    return await window.worksheet.openWorksheet()
  },
}
