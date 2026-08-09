import {
  Gabarito,
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

    return Gabarito.criar(input);
  }
}
