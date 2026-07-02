import { ProvaException } from '../exceptions/prova.exception';

export class AnoProva {
  private constructor(private readonly value: number) {}

  static criar(value: number): AnoProva {
    const anoAtual = new Date().getFullYear();

    if (!Number.isInteger(value) || value < 1900 || value > anoAtual + 1) {
      throw new ProvaException('Ano da prova inválido.');
    }

    return new AnoProva(value);
  }

  get valor(): number {
    return this.value;
  }
}
