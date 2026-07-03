import { Prova } from '../../../domain/entities/prova.entity';
import { AtualizarProvaUseCase } from '../../../application/use-cases/atualizar-prova.use-case';
import { BuscarProvaPorIdUseCase } from '../../../application/use-cases/buscar-prova-por-id.use-case';
import { CriarProvaUseCase } from '../../../application/use-cases/criar-prova.use-case';
import { ListarProvasUseCase } from '../../../application/use-cases/listar-provas.use-case';
import { RemoverProvaUseCase } from '../../../application/use-cases/remover-prova.use-case';
import { ProvasController } from '../../../presentation/controllers/provas.controller';
import { StatusProvaValor } from '../../../domain/value-objects/status-prova.vo';

describe('ProvasController', () => {
  let controller: ProvasController;

  let criarExecuteMock: jest.MockedFunction<CriarProvaUseCase['execute']>;
  let listarExecuteMock: jest.MockedFunction<ListarProvasUseCase['execute']>;
  let buscarExecuteMock: jest.MockedFunction<
    BuscarProvaPorIdUseCase['execute']
  >;
  let atualizarExecuteMock: jest.MockedFunction<
    AtualizarProvaUseCase['execute']
  >;
  let removerExecuteMock: jest.MockedFunction<RemoverProvaUseCase['execute']>;

  beforeEach(() => {
    criarExecuteMock = jest.fn();
    listarExecuteMock = jest.fn();
    buscarExecuteMock = jest.fn();
    atualizarExecuteMock = jest.fn();
    removerExecuteMock = jest.fn();

    controller = new ProvasController(
      { execute: criarExecuteMock } as unknown as CriarProvaUseCase,
      { execute: listarExecuteMock } as unknown as ListarProvasUseCase,
      { execute: buscarExecuteMock } as unknown as BuscarProvaPorIdUseCase,
      { execute: atualizarExecuteMock } as unknown as AtualizarProvaUseCase,
      { execute: removerExecuteMock } as unknown as RemoverProvaUseCase,
    );
  });

  it('deve criar uma prova', async () => {
    const prova = Prova.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      titulo: 'Prova PF',
      cargo: 'Agente',
      banca: 'CEBRASPE',
      ano: 2024,
      status: StatusProvaValor.RASCUNHO,
      categoria: 'SEGURANÇA',
      createdAt: new Date(),
    });

    criarExecuteMock.mockResolvedValue(prova);

    const resultado = await controller.criar({
      titulo: 'Prova PF',
      cargo: 'Agente',
      banca: 'CEBRASPE',
      ano: 2024,
      categoria: 'Segurança',
    });

    expect(criarExecuteMock).toHaveBeenCalledWith({
      titulo: 'Prova PF',
      cargo: 'Agente',
      banca: 'CEBRASPE',
      ano: 2024,
      categoria: 'Segurança',
    });
    expect(resultado).toEqual({
      id: prova.id,
      titulo: prova.titulo,
      cargo: prova.cargo,
      banca: prova.banca.valor,
      ano: prova.ano.valor,
      status: prova.status.valor,
      categoria: prova.categoria.valor,
      createdAt: prova.createdAt,
    });
  });

  it('deve listar provas', async () => {
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

    listarExecuteMock.mockResolvedValue([prova]);

    const resultado = await controller.listar({});

    expect(listarExecuteMock).toHaveBeenCalledWith({
      search: undefined,
      banca: undefined,
      cargo: undefined,
      ano: undefined,
      categoria: undefined,
      status: undefined,
      page: undefined,
      limit: undefined,
    });
    expect(resultado).toEqual([
      {
        id: prova.id,
        titulo: prova.titulo,
        cargo: prova.cargo,
        banca: prova.banca.valor,
        ano: prova.ano.valor,
        status: prova.status.valor,
        categoria: prova.categoria.valor,
        createdAt: prova.createdAt,
      },
    ]);
  });

  it('deve buscar prova por id', async () => {
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

    buscarExecuteMock.mockResolvedValue(prova);

    const resultado = await controller.buscarPorId(id);

    expect(buscarExecuteMock).toHaveBeenCalledWith({ id });
    expect(resultado.id).toBe(id);
  });

  it('deve atualizar uma prova', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';

    const prova = Prova.reconstituir({
      id,
      titulo: 'Prova PRF',
      cargo: 'Policial Rodoviário Federal',
      banca: 'FGV',
      ano: 2025,
      status: StatusProvaValor.REVISAO,
      categoria: 'DIREITO',
      createdAt: new Date(),
    });

    atualizarExecuteMock.mockResolvedValue(prova);

    const resultado = await controller.atualizar(id, {
      titulo: 'Prova PRF',
      cargo: 'Policial Rodoviário Federal',
      banca: 'FGV',
      ano: 2025,
      categoria: 'Direito',
    });

    expect(atualizarExecuteMock).toHaveBeenCalledWith({
      id,
      titulo: 'Prova PRF',
      cargo: 'Policial Rodoviário Federal',
      banca: 'FGV',
      ano: 2025,
      categoria: 'Direito',
    });
    expect(resultado.id).toBe(id);
  });

  it('deve remover uma prova', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';

    removerExecuteMock.mockResolvedValue();

    await controller.remover(id);

    expect(removerExecuteMock).toHaveBeenCalledWith({ id });
  });
});
