export class ProvaException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProvaException';
  }
}
