import { ProvaException } from '../../../domain/exceptions/prova.exception';
import { Banca } from '../../../domain/value-objects/banca.vo';

describe('Banca', () => {
  it('deve criar uma banca válida em maiúsculo', () => {
    const banca = Banca.criar('cebraspe');

    expect(banca.valor).toBe('CEBRASPE');
  });

  it('deve remover espaços antes e depois do valor', () => {
    const banca = Banca.criar('  fgv  ');

    expect(banca.valor).toBe('FGV');
  });

  it('deve lançar ProvaException quando a banca for vazia', () => {
    expect(() => Banca.criar('')).toThrow(ProvaException);
  });

  it('deve lançar ProvaException quando a banca tiver apenas espaços', () => {
    expect(() => Banca.criar('   ')).toThrow(ProvaException);
  });
});
