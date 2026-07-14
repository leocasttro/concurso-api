import {
  Gabarito,
  GabaritoCertoErradoValor,
  TipoGabaritoValor,
} from '../../domain/value-objects/gabarito.vo';

type GabaritoHttpInput = {
  tipo: TipoGabaritoValor;
  valores: string[];
};

export class GabaritoHttpMapper {
  static toDomain(input?: GabaritoHttpInput): Gabarito | undefined {
    if (!input) {
      return undefined;
    }

    if (input.tipo === TipoGabaritoValor.ALTERNATIVAS) {
      return Gabarito.alternativas(input.valores);
    }

    if (input.tipo === TipoGabaritoValor.CERTO_ERRADO) {
      return Gabarito.certoErrado(input.valores[0] as GabaritoCertoErradoValor);
    }

    if (input.tipo === TipoGabaritoValor.DISCURSIVO) {
      return Gabarito.discursivo(input.valores[0]);
    }

    return undefined;
  }
}
