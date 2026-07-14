import { QuestaoException } from '../exceptions/questao.exception';

export enum StatusQuestaoValor {
  RASCUNHO = 'RASCUNHO',
  IMPORTADA = 'IMPORTADA',
  PENDENTE_REVISAO = 'PENDENTE_REVISAO',
  PUBLICADA = 'PUBLICADA',
  ANULADA = 'ANULADA',
}

export class StatusQuestao {
  private constructor(private readonly value: StatusQuestaoValor) {}

  static criar(value: StatusQuestaoValor): StatusQuestao {
    if (!Object.values(StatusQuestaoValor).includes(value)) {
      throw new QuestaoException('Status da questão inválido.');
    }

    return new StatusQuestao(value);
  }

  static rascunho(): StatusQuestao {
    return new StatusQuestao(StatusQuestaoValor.RASCUNHO);
  }

  static importada(): StatusQuestao {
    return new StatusQuestao(StatusQuestaoValor.IMPORTADA);
  }

  static pendenteRevisao(): StatusQuestao {
    return new StatusQuestao(StatusQuestaoValor.PENDENTE_REVISAO);
  }

  get valor(): StatusQuestaoValor {
    return this.value;
  }
}
