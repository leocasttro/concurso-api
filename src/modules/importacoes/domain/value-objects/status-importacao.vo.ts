import { BusinessException } from '../../../../shared/domain/exceptions/business.exception';
import { ErrorStatus } from '../../../../shared/domain/exceptions/error-status';

export enum StatusImportacaoValor {
  PENDENTE = 'PENDENTE',
  PROCESSANDO = 'PROCESSANDO',
  AGUARDANDO_REVISAO = 'AGUARDANDO_REVISAO',
  CONCLUIDA = 'CONCLUIDA',
  FALHOU = 'FALHOU',
  CANCELADA = 'CANCELADA',
}

export class StatusImportacao {
  private constructor(private readonly value: StatusImportacaoValor) {}

  static criar(value: StatusImportacaoValor): StatusImportacao {
    if (!Object.values(StatusImportacaoValor).includes(value)) {
      throw new BusinessException(
        'Status da importação inválido.',
        'INVALID_IMPORT_STATUS',
        ErrorStatus.BAD_REQUEST,
      );
    }

    return new StatusImportacao(value);
  }

  static pendente(): StatusImportacao {
    return new StatusImportacao(StatusImportacaoValor.PENDENTE);
  }

  static processando(): StatusImportacao {
    return new StatusImportacao(StatusImportacaoValor.PROCESSANDO);
  }

  static aguardandoRevisao(): StatusImportacao {
    return new StatusImportacao(StatusImportacaoValor.AGUARDANDO_REVISAO);
  }

  static concluida(): StatusImportacao {
    return new StatusImportacao(StatusImportacaoValor.CONCLUIDA);
  }

  static falhou(): StatusImportacao {
    return new StatusImportacao(StatusImportacaoValor.FALHOU);
  }

  static cancelada(): StatusImportacao {
    return new StatusImportacao(StatusImportacaoValor.CANCELADA);
  }

  get valor(): StatusImportacaoValor {
    return this.value;
  }
}
