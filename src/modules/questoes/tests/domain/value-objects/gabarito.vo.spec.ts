import { QuestaoException } from '../../../domain/exceptions/questao.exception';
import {
  Gabarito,
  GabaritoCertoErradoValor,
  TipoGabaritoValor,
} from '../../../domain/value-objects/gabarito.vo';

describe('Gabarito', () => {
  it('deve criar gabarito de alternativa única', () => {
    const gabarito = Gabarito.alternativas(['a']);

    expect(gabarito.tipo).toBe(TipoGabaritoValor.ALTERNATIVAS);
    expect(gabarito.valores).toEqual(['A']);
  });

  it('deve criar gabarito com múltiplas alternativas', () => {
    const gabarito = Gabarito.alternativas(['a', 'c', 'd']);

    expect(gabarito.tipo).toBe(TipoGabaritoValor.ALTERNATIVAS);
    expect(gabarito.valores).toEqual(['A', 'C', 'D']);
  });

  it('deve remover valores vazios no gabarito de alternativas', () => {
    const gabarito = Gabarito.alternativas([' a ', '', '  ', 'b']);

    expect(gabarito.valores).toEqual(['A', 'B']);
  });

  it('deve lançar QuestaoException quando gabarito de alternativas for vazio', () => {
    expect(() => Gabarito.alternativas([])).toThrow(QuestaoException);
  });

  it('deve lançar QuestaoException quando gabarito de alternativas tiver apenas valores vazios', () => {
    expect(() => Gabarito.alternativas(['', '   '])).toThrow(QuestaoException);
  });

  it('deve criar gabarito CERTO', () => {
    const gabarito = Gabarito.certoErrado(GabaritoCertoErradoValor.CERTO);

    expect(gabarito.tipo).toBe(TipoGabaritoValor.CERTO_ERRADO);
    expect(gabarito.valores).toEqual(['CERTO']);
  });

  it('deve criar gabarito ERRADO', () => {
    const gabarito = Gabarito.certoErrado(GabaritoCertoErradoValor.ERRADO);

    expect(gabarito.tipo).toBe(TipoGabaritoValor.CERTO_ERRADO);
    expect(gabarito.valores).toEqual(['ERRADO']);
  });

  it('deve lançar QuestaoException quando gabarito certo/errado for inválido', () => {
    expect(() =>
      Gabarito.certoErrado('INVALIDO' as GabaritoCertoErradoValor),
    ).toThrow(QuestaoException);
  });

  it('deve criar gabarito discursivo', () => {
    const gabarito = Gabarito.discursivo(
      'A resposta deve tratar do princípio da legalidade.',
    );

    expect(gabarito.tipo).toBe(TipoGabaritoValor.DISCURSIVO);
    expect(gabarito.valores).toEqual([
      'A resposta deve tratar do princípio da legalidade.',
    ]);
  });

  it('deve remover espaços do gabarito discursivo', () => {
    const gabarito = Gabarito.discursivo('  Resposta esperada  ');

    expect(gabarito.valores).toEqual(['Resposta esperada']);
  });

  it('deve lançar QuestaoException quando gabarito discursivo for vazio', () => {
    expect(() => Gabarito.discursivo('')).toThrow(QuestaoException);
  });

  it('deve lançar QuestaoException quando gabarito discursivo tiver apenas espaços', () => {
    expect(() => Gabarito.discursivo('   ')).toThrow(QuestaoException);
  });

  it('deve retornar cópia dos valores para proteger o estado interno', () => {
    const gabarito = Gabarito.alternativas(['A']);

    const valores = gabarito.valores;
    valores.push('B');

    expect(gabarito.valores).toEqual(['A']);
  });
});
