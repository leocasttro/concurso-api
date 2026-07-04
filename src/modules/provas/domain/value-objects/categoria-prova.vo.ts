import { ProvaException } from '../exceptions/prova.exception';

export class CategoriaProvaVO {
  private constructor(private readonly value: string) {}

  static criar(value: string): CategoriaProvaVO {
    if (!value?.trim()) {
      throw new ProvaException('Categoria da prova é obrigatória.');
    }

    return new CategoriaProvaVO(value.trim().toUpperCase());
  }

  get valor(): string {
    return this.value;
  }
}
