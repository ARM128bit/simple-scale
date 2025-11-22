export abstract class Office {
  abstract execute(args: string[]): Promise<string>
}
