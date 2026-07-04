import { ProvaException } from '../../../domain/exceptions/prova.exception';
import { AnoProva } from '../../../domain/value-objects/ano-prova.vo';

describe('AnoProva', () => {
  it('deve criar um ano válido', () => {
    const ano = AnoProva.criar(2024);

    expect(ano.valor).toBe(2024);
  });

  it('deve lançar ProvaException quando o ano for menor que 1900', () => {
    expect(() => AnoProva.criar(1899)).toThrow(ProvaException);
  });

  it('deve lançar ProvaException quando o ano não for inteiro', () => {
    expect(() => AnoProva.criar(2024.5)).toThrow(ProvaException);
  });

  it('deve lançar ProvaException quando o ano for maior que o próximo ano', () => {
    const anoInvalido = new Date().getFullYear() + 2;

    expect(() => AnoProva.criar(anoInvalido)).toThrow(ProvaException);
  });
});
