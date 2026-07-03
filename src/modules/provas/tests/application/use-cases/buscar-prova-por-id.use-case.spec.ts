import { Prova } from '../../../domain/entities/prova.entity';
import { ProvaNaoEncontradaException } from '../../../domain/exceptions/prova-nao-encontrada.exception';
import type { ProvaRepository } from '../../../domain/repositories/prova.repository';
import { BuscarProvaPorIdUseCase } from '../../../application/use-cases/buscar-prova-por-id.use-case';

describe('BuscarProvaPorIdUseCase', () => {
  let useCase: BuscarProvaPorIdUseCase;
  let provaRepository: ProvaRepository;
  let buscarPorIdMock: jest.MockedFunction<ProvaRepository['buscarPorId']>;

  beforeEach(() => {
    buscarPorIdMock = jest.fn();

    provaRepository = {
      salvar: jest.fn(),
      listar: jest.fn(),
      buscarPorId: buscarPorIdMock,
      remover: jest.fn(),
    };

    useCase = new BuscarProvaPorIdUseCase(provaRepository);
  });

  it('deve retornar uma prova quando ela existir', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';

    const prova = Prova.reconstituir({
      id,
      titulo: 'Prova PF',
      cargo: 'Agente',
      banca: 'CEBRASPE',
      ano: 2024,
      createdAt: new Date(),
    });

    buscarPorIdMock.mockResolvedValue(prova);

    const resultado = await useCase.execute({ id });

    expect(resultado).toBe(prova);
    expect(buscarPorIdMock).toHaveBeenCalledWith(id);
  });

  it('deve lançar ProvaNaoEncontradaException quando a prova não existir', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';

    buscarPorIdMock.mockResolvedValue(null);

    await expect(useCase.execute({ id })).rejects.toBeInstanceOf(
      ProvaNaoEncontradaException,
    );

    expect(buscarPorIdMock).toHaveBeenCalledWith(id);
  });
});
