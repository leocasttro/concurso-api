import { Prova } from '../../../domain/entities/prova.entity';
import { ProvaException } from '../../../domain/exceptions/prova.exception';
import { StatusProvaValor } from '../../../domain/value-objects/status-prova.vo';

describe('Prova', () => {
  it('deve criar uma prova válida', () => {
    const prova = Prova.criar({
      titulo: '  Prova PF  ',
      cargo: '  Agente  ',
      banca: 'cebraspe',
      ano: 2024,
      categoria: 'segurança',
    });

    expect(prova.id).toBeDefined();
    expect(prova.titulo).toBe('Prova PF');
    expect(prova.cargo).toBe('Agente');
    expect(prova.banca.valor).toBe('CEBRASPE');
    expect(prova.ano.valor).toBe(2024);
    expect(prova.status.valor).toBe(StatusProvaValor.RASCUNHO);
    expect(prova.categoria.valor).toBe('SEGURANÇA');
    expect(prova.createdAt).toBeInstanceOf(Date);
  });

  it('deve reconstituir uma prova existente', () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');

    const prova = Prova.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      titulo: 'Prova PF',
      cargo: 'Agente',
      banca: 'CEBRASPE',
      ano: 2024,
      status: StatusProvaValor.PUBLICADA,
      categoria: 'SEGURANÇA',
      createdAt,
    });

    expect(prova.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(prova.titulo).toBe('Prova PF');
    expect(prova.cargo).toBe('Agente');
    expect(prova.banca.valor).toBe('CEBRASPE');
    expect(prova.ano.valor).toBe(2024);
    expect(prova.status.valor).toBe(StatusProvaValor.PUBLICADA);
    expect(prova.categoria.valor).toBe('SEGURANÇA');
    expect(prova.createdAt).toBe(createdAt);
  });

  it('deve atualizar uma prova existente', () => {
    const prova = Prova.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      titulo: 'Prova PF',
      cargo: 'Agente',
      banca: 'CEBRASPE',
      ano: 2024,
      status: StatusProvaValor.PUBLICADA,
      categoria: 'SEGURANÇA',
      createdAt: new Date(),
    });

    prova.atualizar({
      titulo: '  Prova PRF  ',
      cargo: '  Policial Rodoviário Federal  ',
      banca: 'fgv',
      ano: 2025,
      categoria: 'direito',
    });

    expect(prova.titulo).toBe('Prova PRF');
    expect(prova.cargo).toBe('Policial Rodoviário Federal');
    expect(prova.banca.valor).toBe('FGV');
    expect(prova.ano.valor).toBe(2025);
    expect(prova.status.valor).toBe(StatusProvaValor.PUBLICADA);
    expect(prova.categoria.valor).toBe('DIREITO');
  });

  it('deve lançar ProvaException ao criar prova sem título', () => {
    expect(() =>
      Prova.criar({
        titulo: '',
        cargo: 'Agente',
        banca: 'CEBRASPE',
        ano: 2024,
        categoria: 'SEGURANÇA',
      }),
    ).toThrow(ProvaException);
  });

  it('deve lançar ProvaException ao criar prova sem cargo', () => {
    expect(() =>
      Prova.criar({
        titulo: 'Prova PF',
        cargo: '',
        banca: 'CEBRASPE',
        ano: 2024,
        categoria: 'SEGURANÇA',
      }),
    ).toThrow(ProvaException);
  });

  it('deve lançar ProvaException ao atualizar prova com título vazio', () => {
    const prova = Prova.criar({
      titulo: 'Prova PF',
      cargo: 'Agente',
      banca: 'CEBRASPE',
      ano: 2024,
      categoria: 'SEGURANÇA',
    });

    expect(() =>
      prova.atualizar({
        titulo: '',
        cargo: 'Agente',
        banca: 'CEBRASPE',
        ano: 2024,
        categoria: 'SEGURANÇA',
      }),
    ).toThrow(ProvaException);
  });
});
