import { QuestaoException } from '../exceptions/questao.exception';
import { randomUUID } from 'node:crypto';

export class Alternativa {
  private constructor(
    public readonly id: string,
    public readonly texto: string,
    public readonly letra?: string,
  ) {}

  static criar(input: { texto: string; letra?: string }): Alternativa {
    if (!input.texto.trim()) {
      throw new QuestaoException('Texto da alternativa é obrigatório.');
    }

    return new Alternativa(
      randomUUID(),
      input.texto.trim(),
      input.letra?.trim().toUpperCase(),
    );
  }

  static reconstituir(input: {
    id: string;
    texto: string;
    letra?: string;
  }): Alternativa {
    return new Alternativa(
      input.id,
      input.texto,
      input.letra?.trim().toUpperCase(),
    );
  }
}
