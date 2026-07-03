import { Prova } from '../../../domain/entities/prova.entity';
import { ProvaPresenter } from '../../../presentation/presenters/prova.presenter';

describe('ProvaPresenter', () => {
  it('deve converter uma prova para resposta HTTP', () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');

    const prova = Prova.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      titulo: 'Prova PF',
      cargo: 'Agente',
      banca: 'CEBRASPE',
      ano: 2024,
      createdAt,
    });

    const resultado = ProvaPresenter.toHTTP(prova);

    expect(resultado).toEqual({
      id: '550e8400-e29b-41d4-a716-446655440000',
      titulo: 'Prova PF',
      cargo: 'Agente',
      banca: 'CEBRASPE',
      ano: 2024,
      createdAt,
    });
  });
});
