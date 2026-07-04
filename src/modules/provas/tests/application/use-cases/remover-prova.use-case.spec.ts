import { RemoverProvaUseCase } from '../../../application/use-cases/remover-prova.use-case';
import { Prova } from '../../../domain/entities/prova.entity';
import { ProvaNaoEncontradaException } from '../../../domain/exceptions/prova-nao-encontrada.exception';
import type { ProvaRepository } from '../../../domain/repositories/prova.repository';
import { StatusProvaValor } from '../../../domain/value-objects/status-prova.vo';

describe('RemoverProvaUseCase', () => {
  let useCase: RemoverProvaUseCase;
  let provaRepository: ProvaRepository;
  let buscarPorIdMock: jest.MockedFunction<ProvaRepository['buscarPorId']>;
  let removerMock: jest.MockedFunction<ProvaRepository['remover']>;

  beforeEach(() => {
    buscarPorIdMock = jest.fn();
    removerMock = jest.fn();

    provaRepository = {
      salvar: jest.fn(),
      listar: jest.fn(),
      buscarPorId: buscarPorIdMock,
      remover: removerMock,
    };

    useCase = new RemoverProvaUseCase(provaRepository);
  });

  it('deve remover uma prova existente', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';

    const prova = Prova.reconstituir({
      id,
      titulo: 'Prova PF',
      cargo: 'Agente',
      banca: 'CEBRASPE',
      ano: 2024,
      status: StatusProvaValor.PUBLICADA,
      categoria: 'SEGURANÇA',
      createdAt: new Date(),
    });

    buscarPorIdMock.mockResolvedValue(prova);
    removerMock.mockResolvedValue();

    await useCase.execute({ id });

    expect(buscarPorIdMock).toHaveBeenCalledWith(id);
    expect(removerMock).toHaveBeenCalledWith(id);
    expect(removerMock).toHaveBeenCalledTimes(1);
  });

  it('deve lançar ProvaNaoEncontradaException quando a prova não existir', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';

    buscarPorIdMock.mockResolvedValue(null);

    await expect(useCase.execute({ id })).rejects.toBeInstanceOf(
      ProvaNaoEncontradaException,
    );

    expect(buscarPorIdMock).toHaveBeenCalledWith(id);
    expect(removerMock).not.toHaveBeenCalled();
  });
});
