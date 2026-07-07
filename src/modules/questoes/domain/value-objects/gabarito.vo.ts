import { QuestaoException } from '../exceptions/questao.exception';

export enum TipoGabaritoValor {
  ALTERNATIVAS = 'ALTERNATIVAS',
  CERTO_ERRADO = 'CERTO_ERRADO',
  DISCURSIVO = 'DISCURSIVO',
}

export enum GabaritoCertoErradoValor {
  CERTO = 'CERTO',
  ERRADO = 'ERRADO',
}

export class Gabarito {
  private constructor(
    private readonly type: TipoGabaritoValor,
    private readonly value: string[],
  ) {}

  static alternativas(value: string[]): Gabarito {
    const alternativas = value
      .map((item) => item.trim().toUpperCase())
      .filter(Boolean);

    if (alternativas.length === 0) {
      throw new QuestaoException('Gabarito deve ter ao menos uma alternativa.');
    }

    return new Gabarito(TipoGabaritoValor.ALTERNATIVAS, alternativas);
  }

  static certoErrado(value: GabaritoCertoErradoValor): Gabarito {
    if (!Object.values(GabaritoCertoErradoValor).includes(value)) {
      throw new QuestaoException('Gabarito certo/errado inválido.');
    }

    return new Gabarito(TipoGabaritoValor.CERTO_ERRADO, [value]);
  }

  static discursivo(value: string): Gabarito {
    if (!value.trim()) {
      throw new QuestaoException('Gabarito discursivo é obrigatório.');
    }

    return new Gabarito(TipoGabaritoValor.DISCURSIVO, [value.trim()]);
  }

  get tipo(): TipoGabaritoValor {
    return this.type;
  }

  get valores(): string[] {
    return [...this.value];
  }
}
