export interface IReportGenerator {
  generate(): Promise<Buffer>
}
