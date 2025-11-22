export interface ITemplateLoader {
  render(data: any): Promise<Buffer>
}
