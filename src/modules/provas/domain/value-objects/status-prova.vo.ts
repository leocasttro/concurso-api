import { ProvaException } from '../exceptions/prova.exception';

export enum StatusProvaValor {
  RASCUNHO = 'RASCUNHO',
  PUBLICADA = 'PUBLICADA',
  REVISAO = 'REVISAO',
}

export class StatusProva {
  private constructor(private readonly value: StatusProvaValor) {}

  static criar(value: StatusProvaValor): StatusProva {
    if (!Object.values(StatusProvaValor).includes(value)) {
      throw new ProvaException('Status da prova inválido.');
    }

    return new StatusProva(value);
  }

  static rascunho(): StatusProva {
    return new StatusProva(StatusProvaValor.RASCUNHO);
  }

  get valor(): StatusProvaValor {
    return this.value;
  }
}
