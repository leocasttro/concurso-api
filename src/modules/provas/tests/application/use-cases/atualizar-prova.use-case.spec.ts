import { AtualizarProvaUseCase } from '../../../application/use-cases/atualizar-prova.use-case';
import { ProvaRepository } from '../../../domain/repositories/prova.repository';
import { Prova } from '../../../domain/entities/prova.entity';
import { ProvaNaoEncontradaException } from '../../../domain/exceptions/prova-nao-encontrada.exception';
import { StatusProvaValor } from '../../../domain/value-objects/status-prova.vo';

describe('AtualizarProvaUseCase', () => {
  let useCase: AtualizarProvaUseCase;
  let provaRepository: ProvaRepository;
  let buscarPorIdMock: jest.MockedFunction<ProvaRepository['buscarPorId']>;
  let salvarMock: jest.MockedFunction<ProvaRepository['salvar']>;

  beforeEach(() => {
    buscarPorIdMock = jest.fn();
    salvarMock = jest.fn();

    provaRepository = {
      salvar: salvarMock,
      listar: jest.fn(),
      buscarPorId: buscarPorIdMock,
      remover: jest.fn(),
    };

    useCase = new AtualizarProvaUseCase(provaRepository);
  });

  it('deve atualizar uma prova existente', async () => {
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

    const input = {
      id,
      titulo: 'Prova PF - Atualizada',
      cargo: 'Agente',
      banca: 'CEBRASPE',
      ano: 2024,
      categoria: 'Direito',
    };

    buscarPorIdMock.mockResolvedValue(prova);
    salvarMock.mockImplementation((provaAtualizada) =>
      Promise.resolve(provaAtualizada),
    );

    const resultado = await useCase.execute(input);

    expect(resultado).toBeInstanceOf(Prova);
    expect(resultado.titulo).toBe('Prova PF - Atualizada');
    expect(resultado.cargo).toBe('Agente');
    expect(resultado.banca.valor).toBe('CEBRASPE');
    expect(resultado.ano.valor).toBe(2024);
    expect(resultado.status.valor).toBe(StatusProvaValor.PUBLICADA);
    expect(resultado.categoria.valor).toBe('DIREITO');
    expect(salvarMock).toHaveBeenCalledTimes(1);
    expect(salvarMock).toHaveBeenCalledWith(resultado);
  });

  it('deve lançar ProvaNaoEncontradaException quando a prova não existir', async () => {
    const input = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      titulo: 'Prova PRF',
      cargo: 'Policial Rodoviário Federal',
      banca: 'FGV',
      ano: 2025,
      categoria: 'Direito',
    };

    buscarPorIdMock.mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(
      ProvaNaoEncontradaException,
    );

    expect(buscarPorIdMock).toHaveBeenCalledWith(input.id);
    expect(salvarMock).not.toHaveBeenCalled();
  });
});
