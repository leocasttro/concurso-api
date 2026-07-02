import { ProvaException } from '../exceptions/prova.exception';

export class Banca {
  private constructor(private readonly value: string) {}

  static criar(value: string): Banca {
    if (!value?.trim()) {
      throw new ProvaException('Banca é obrigatória.');
    }

    return new Banca(value.trim().toUpperCase());
  }

  get valor(): string {
    return this.value;
  }
}
