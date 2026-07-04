import { ProvaException } from '../../../domain/exceptions/prova.exception';
import { CategoriaProvaVO } from '../../../domain/value-objects/categoria-prova.vo';

describe('CategoriaProvaVO', () => {
  it('deve criar uma categoria válida em maiúsculo', () => {
    const categoria = CategoriaProvaVO.criar('segurança');

    expect(categoria.valor).toBe('SEGURANÇA');
  });

  it('deve remover espaços antes e depois do valor', () => {
    const categoria = CategoriaProvaVO.criar('  ti - cloud  ');

    expect(categoria.valor).toBe('TI - CLOUD');
  });

  it('deve lançar ProvaException quando a categoria for vazia', () => {
    expect(() => CategoriaProvaVO.criar('')).toThrow(ProvaException);
  });

  it('deve lançar ProvaException quando a categoria tiver apenas espaços', () => {
    expect(() => CategoriaProvaVO.criar('   ')).toThrow(ProvaException);
  });
});
