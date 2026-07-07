import { QuestaoException } from '../exceptions/questao.exception';

export enum TipoQuestaoValor {
  MULTIPLA_ESCOLHA = 'MULTIPLA_ESCOLHA',
  MULTIPLAS_CORRETAS = 'MULTIPLAS_CORRETAS',
  CERTO_ERRADO = 'CERTO_ERRADO',
  DISCURSIVA = 'DISCURSIVA',
}

export class TipoQuestao {
  private constructor(private readonly value: TipoQuestaoValor) {}

  static criar(value: TipoQuestaoValor): TipoQuestao {
    if (!Object.values(TipoQuestaoValor).includes(value)) {
      throw new QuestaoException('Tipo da questão inválida');
    }

    return new TipoQuestao(value);
  }

  static multiplaEscolha(): TipoQuestao {
    return new TipoQuestao(TipoQuestaoValor.MULTIPLA_ESCOLHA);
  }

  get valor(): TipoQuestaoValor {
    return this.value;
  }
}
