import { QuestoesController } from '../../../presentation/controllers/questoes.controller';
import { PublicarQuestaoUseCase } from '../../../application/use-cases/publicar-questao.use-case';
import { EnviarQuestaoParaRevisaoUseCase } from '../../../application/use-cases/enviar-questao-para-revisao.use-case';
import { AnularQuestaoUseCase } from '../../../application/use-cases/anular-questao.use-case';
import { ImportarQuestaoUseCase } from '../../../application/use-cases/importar-questao.use-case';
import { CriarQuestaoUseCase } from '../../../application/use-cases/criar-questao.use-case';
import { ListarQuestoesPorProvaUseCase } from '../../../application/use-cases/listar-questoes-por-prova.use-case';
import { BuscarQuestaoPorIdUseCase } from '../../../application/use-cases/buscar-questao-por-id.use-case';
import { Questao } from '../../../domain/entities/questao.entity';
import { TipoQuestaoValor } from '../../../domain/value-objects/tipo-questao.vo';
import {
  Gabarito,
  GabaritoCertoErradoValor,
  TipoGabaritoValor,
} from '../../../domain/value-objects/gabarito.vo';
import { StatusQuestaoValor } from '../../../domain/value-objects/status-questao.vo';
import { Alternativa } from '../../../domain/entities/alternativa.entity';

describe('QuestoesController', () => {
  let controller: QuestoesController;

  let criarExecuteMock: jest.MockedFunction<CriarQuestaoUseCase['execute']>;
  let importarExecuteMock: jest.MockedFunction<
    ImportarQuestaoUseCase['execute']
  >;
  let listarPorProvaIdMock: jest.MockedFunction<
    ListarQuestoesPorProvaUseCase['execute']
  >;
  let buscarPorIdMock: jest.MockedFunction<
    BuscarQuestaoPorIdUseCase['execute']
  >;
  let publicarQuestaoMock: jest.MockedFunction<
    PublicarQuestaoUseCase['execute']
  >;
  let enviarParaRevisaoMock: jest.MockedFunction<
    EnviarQuestaoParaRevisaoUseCase['execute']
  >;
  let anularQuestaoMock: jest.MockedFunction<AnularQuestaoUseCase['execute']>;

  beforeEach(() => {
    criarExecuteMock = jest.fn();
    importarExecuteMock = jest.fn();
    listarPorProvaIdMock = jest.fn();
    buscarPorIdMock = jest.fn();
    publicarQuestaoMock = jest.fn();
    enviarParaRevisaoMock = jest.fn();
    anularQuestaoMock = jest.fn();

    controller = new QuestoesController(
      { execute: criarExecuteMock } as unknown as CriarQuestaoUseCase,
      { execute: importarExecuteMock } as unknown as ImportarQuestaoUseCase,
      {
        execute: listarPorProvaIdMock,
      } as unknown as ListarQuestoesPorProvaUseCase,
      { execute: buscarPorIdMock } as unknown as BuscarQuestaoPorIdUseCase,
      { execute: publicarQuestaoMock } as unknown as PublicarQuestaoUseCase,
      {
        execute: enviarParaRevisaoMock,
      } as unknown as EnviarQuestaoParaRevisaoUseCase,
      { execute: anularQuestaoMock } as unknown as AnularQuestaoUseCase,
    );
  });

  it('deve criar questão manualmente', async () => {
    const questao = Questao.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      provaId: '550e8400-e29b-41d4-a716-446655440999',
      numero: 1,
      enunciado: 'Constituição Federal de 88 é rígida?',
      tipo: TipoQuestaoValor.CERTO_ERRADO,
      status: StatusQuestaoValor.PUBLICADA,
      alternativas: [
        Alternativa.reconstituir({
          id: '550e8400-e29b-41d4-a716-446655440001',
          texto: 'Certo',
          letra: 'C',
        }),
        Alternativa.reconstituir({
          id: '550e8400-e29b-41d4-a716-446655440002',
          texto: 'Errado',
          letra: 'E',
        }),
      ],
      gabarito: Gabarito.certoErrado(GabaritoCertoErradoValor.CERTO),
      disciplina: 'Direito Constitucional',
      assunto: 'Constituição',
      textoApoio: 'Texto de apoio',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
    });

    criarExecuteMock.mockResolvedValue(questao);

    const resultado = await controller.criar({
      provaId: '550e8400-e29b-41d4-a716-446655440999',
      numero: 1,
      enunciado: 'Constituição Federal de 88 é rígida?',
      tipo: TipoQuestaoValor.CERTO_ERRADO,
      alternativas: [
        { texto: 'Certo', letra: 'C' },
        { texto: 'Errado', letra: 'E' },
      ],
      gabarito: {
        tipo: TipoGabaritoValor.CERTO_ERRADO,
        valores: ['CERTO'],
      },
      disciplina: 'Direito Constitucional',
      assunto: 'Constituição',
      textoApoio: 'Texto de apoio',
    });

    expect(criarExecuteMock).toHaveBeenCalledTimes(1);

    const input = criarExecuteMock.mock.calls[0][0];

    expect(input).toMatchObject({
      provaId: questao.provaId,
      numero: questao.numero,
      enunciado: questao.enunciado,
      tipo: TipoQuestaoValor.CERTO_ERRADO,
      alternativas: [
        { texto: 'Certo', letra: 'C' },
        { texto: 'Errado', letra: 'E' },
      ],
      disciplina: 'Direito Constitucional',
      assunto: 'Constituição',
      textoApoio: 'Texto de apoio',
    });

    expect(input.gabarito?.tipo).toBe(TipoGabaritoValor.CERTO_ERRADO);
    expect(input.gabarito?.valores).toEqual(['CERTO']);

    expect(resultado).toEqual({
      id: questao.id,
      provaId: questao.provaId,
      numero: questao.numero,
      enunciado: questao.enunciado,
      tipo: questao.tipo.valor,
      status: questao.status.valor,
      alternativas: [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          texto: 'Certo',
          letra: 'C',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          texto: 'Errado',
          letra: 'E',
        },
      ],
      gabarito: {
        tipo: TipoGabaritoValor.CERTO_ERRADO,
        valores: ['CERTO'],
      },
      disciplina: questao.disciplina,
      assunto: questao.assunto,
      textoApoio: questao.textoApoio,
      createdAt: questao.createdAt,
      updatedAt: questao.updatedAt,
    });
  });

  it('deve importar questão', async () => {
    const questao = Questao.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      provaId: '550e8400-e29b-41d4-a716-446655440999',
      numero: 1,
      enunciado: 'Constituição Federal de 88 é rígida?',
      tipo: TipoQuestaoValor.CERTO_ERRADO,
      status: StatusQuestaoValor.IMPORTADA,
      alternativas: [],
      gabarito: Gabarito.certoErrado(GabaritoCertoErradoValor.CERTO),
      disciplina: 'Direito Constitucional',
      assunto: 'Constituição',
      textoApoio: 'Texto de apoio',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
    });

    importarExecuteMock.mockResolvedValue(questao);

    const resultado = await controller.importar({
      provaId: questao.provaId,
      numero: questao.numero,
      enunciado: questao.enunciado,
      tipo: TipoQuestaoValor.CERTO_ERRADO,
      gabarito: {
        tipo: TipoGabaritoValor.CERTO_ERRADO,
        valores: ['CERTO'],
      },
      disciplina: questao.disciplina,
      assunto: questao.assunto,
      textoApoio: questao.textoApoio,
    });

    expect(importarExecuteMock).toHaveBeenCalledTimes(1);

    const input = importarExecuteMock.mock.calls[0][0];

    expect(input).toMatchObject({
      provaId: questao.provaId,
      numero: questao.numero,
      enunciado: questao.enunciado,
      tipo: TipoQuestaoValor.CERTO_ERRADO,
      disciplina: questao.disciplina,
      assunto: questao.assunto,
      textoApoio: questao.textoApoio,
    });

    expect(input.gabarito?.tipo).toBe(TipoGabaritoValor.CERTO_ERRADO);
    expect(input.gabarito?.valores).toEqual(['CERTO']);
    expect(resultado.id).toBe(questao.id);
  });

  it('deve listar questões por prova', async () => {
    const questao = Questao.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      provaId: '550e8400-e29b-41d4-a716-446655440999',
      numero: 1,
      enunciado: 'Constituição Federal de 88 é rígida?',
      tipo: TipoQuestaoValor.CERTO_ERRADO,
      status: StatusQuestaoValor.PUBLICADA,
      alternativas: [],
      createdAt: new Date(),
    });

    listarPorProvaIdMock.mockResolvedValue([questao]);

    const resultado = await controller.listarPorProva(questao.provaId);

    expect(listarPorProvaIdMock).toHaveBeenCalledWith({
      provaId: questao.provaId,
    });
    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe(questao.id);
  });

  it('deve buscar questão por id', async () => {
    const questao = Questao.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      provaId: '550e8400-e29b-41d4-a716-446655440999',
      numero: 1,
      enunciado: 'Constituição Federal de 88 é rígida?',
      tipo: TipoQuestaoValor.CERTO_ERRADO,
      status: StatusQuestaoValor.PUBLICADA,
      alternativas: [],
      createdAt: new Date(),
    });

    buscarPorIdMock.mockResolvedValue(questao);

    const resultado = await controller.buscarPorId(questao.id);

    expect(buscarPorIdMock).toHaveBeenCalledWith({ id: questao.id });
    expect(resultado.id).toBe(questao.id);
  });

  it('deve publicar questão', async () => {
    const questao = Questao.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      provaId: '550e8400-e29b-41d4-a716-446655440999',
      enunciado: 'Questão publicada',
      tipo: TipoQuestaoValor.CERTO_ERRADO,
      status: StatusQuestaoValor.PUBLICADA,
      alternativas: [],
      createdAt: new Date(),
    });

    publicarQuestaoMock.mockResolvedValue(questao);

    const resultado = await controller.publicar(questao.id);

    expect(publicarQuestaoMock).toHaveBeenCalledWith({ id: questao.id });
    expect(resultado.id).toBe(questao.id);
  });

  it('deve enviar questão para revisão', async () => {
    const questao = Questao.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      provaId: '550e8400-e29b-41d4-a716-446655440999',
      enunciado: 'Questão em revisão',
      tipo: TipoQuestaoValor.CERTO_ERRADO,
      status: StatusQuestaoValor.PENDENTE_REVISAO,
      alternativas: [],
      createdAt: new Date(),
    });

    enviarParaRevisaoMock.mockResolvedValue(questao);

    const resultado = await controller.enviarParaRevisao(questao.id);

    expect(enviarParaRevisaoMock).toHaveBeenCalledWith({ id: questao.id });
    expect(resultado.id).toBe(questao.id);
  });

  it('deve anular questão', async () => {
    const questao = Questao.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      provaId: '550e8400-e29b-41d4-a716-446655440999',
      enunciado: 'Questão anulada',
      tipo: TipoQuestaoValor.CERTO_ERRADO,
      status: StatusQuestaoValor.ANULADA,
      alternativas: [],
      createdAt: new Date(),
    });

    anularQuestaoMock.mockResolvedValue(questao);

    const resultado = await controller.anular(questao.id);

    expect(anularQuestaoMock).toHaveBeenCalledWith({ id: questao.id });
    expect(resultado.id).toBe(questao.id);
  });
});
