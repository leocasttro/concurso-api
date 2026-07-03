import { ListarProvasUseCase } from '../../../application/use-cases/listar-provas.use-case';
import { Prova } from '../../../domain/entities/prova.entity';
import type { ProvaRepository } from '../../../domain/repositories/prova.repository';
import { StatusProvaValor } from '../../../domain/value-objects/status-prova.vo';

describe('ListarProvasUseCase', () => {
  let useCase: ListarProvasUseCase;
  let provaRepository: ProvaRepository;
  let listarMock: jest.MockedFunction<ProvaRepository['listar']>;

  beforeEach(() => {
    listarMock = jest.fn();

    provaRepository = {
      salvar: jest.fn(),
      listar: listarMock,
      buscarPorId: jest.fn(),
      remover: jest.fn(),
    };

    useCase = new ListarProvasUseCase(provaRepository);
  });

  it('deve listar todas as provas', async () => {
    const input = {};

    const provas = [
      Prova.reconstituir({
        id: '550e8400-e29b-41d4-a716-446655440000',
        titulo: 'Prova PF',
        cargo: 'Agente',
        banca: 'CEBRASPE',
        ano: 2024,
        status: StatusProvaValor.PUBLICADA,
        categoria: 'SEGURANÇA',
        createdAt: new Date(),
      }),
      Prova.reconstituir({
        id: '550e8400-e29b-41d4-a716-446655440001',
        titulo: 'Prova PRF',
        cargo: 'Policial Rodoviário Federal',
        banca: 'FGV',
        ano: 2025,
        status: StatusProvaValor.RASCUNHO,
        categoria: 'DIREITO',
        createdAt: new Date(),
      }),
    ];

    listarMock.mockResolvedValue(provas);

    const resultado = await useCase.execute(input);

    expect(resultado).toHaveLength(2);
    expect(resultado).toBe(provas);
    expect(listarMock).toHaveBeenCalledTimes(1);
    expect(listarMock).toHaveBeenCalledWith(input);
  });

  it('deve repassar filtros para o repositório', async () => {
    const input = {
      search: 'agente',
      banca: 'CEBRASPE',
      cargo: 'Agente',
      ano: 2024,
      categoria: 'Segurança',
      page: 2,
      limit: 12,
    };

    listarMock.mockResolvedValue([]);

    const resultado = await useCase.execute(input);

    expect(resultado).toEqual([]);
    expect(listarMock).toHaveBeenCalledWith(input);
  });

  it('deve retornar uma lista vazia quando não houver provas', async () => {
    const input = {};

    listarMock.mockResolvedValue([]);

    const resultado = await useCase.execute(input);

    expect(resultado).toEqual([]);
    expect(listarMock).toHaveBeenCalledTimes(1);
    expect(listarMock).toHaveBeenCalledWith(input);
  });
});
