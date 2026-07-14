import { GabaritoHttpMapper } from '../../../presentation/mappers/gabarito-http.mapper';
import {
  GabaritoCertoErradoValor,
  TipoGabaritoValor,
} from '../../../domain/value-objects/gabarito.vo';

describe('GabaritoHttpMapper', () => {
  it('deve retornar undefined quando não receber gabarito', () => {
    const resultado = GabaritoHttpMapper.toDomain();

    expect(resultado).toBeUndefined();
  });

  it('deve converter gabarito de alternativas para domínio', () => {
    const resultado = GabaritoHttpMapper.toDomain({
      tipo: TipoGabaritoValor.ALTERNATIVAS,
      valores: [' a ', 'b'],
    });

    expect(resultado?.tipo).toBe(TipoGabaritoValor.ALTERNATIVAS);
    expect(resultado?.valores).toEqual(['A', 'B']);
  });

  it('deve converter gabarito certo/errado para domínio', () => {
    const resultado = GabaritoHttpMapper.toDomain({
      tipo: TipoGabaritoValor.CERTO_ERRADO,
      valores: [GabaritoCertoErradoValor.CERTO],
    });

    expect(resultado?.tipo).toBe(TipoGabaritoValor.CERTO_ERRADO);
    expect(resultado?.valores).toEqual([GabaritoCertoErradoValor.CERTO]);
  });

  it('deve converter gabarito discursivo para domínio', () => {
    const resultado = GabaritoHttpMapper.toDomain({
      tipo: TipoGabaritoValor.DISCURSIVO,
      valores: [' resposta esperada '],
    });

    expect(resultado?.tipo).toBe(TipoGabaritoValor.DISCURSIVO);
    expect(resultado?.valores).toEqual(['resposta esperada']);
  });
});
