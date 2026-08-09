import { CriarProvaUseCase } from '../../../../provas/application/use-cases/criar-prova.use-case';
import { Prova } from '../../../../provas/domain/entities/prova.entity';
import { StatusProvaValor } from '../../../../provas/domain/value-objects/status-prova.vo';
import { ImportarQuestaoUseCase } from '../../../../questoes/application/use-cases/importar-questao.use-case';
import { Questao } from '../../../../questoes/domain/entities/questao.entity';
import { Alternativa } from '../../../../questoes/domain/entities/alternativa.entity';
import { StatusQuestaoValor } from '../../../../questoes/domain/value-objects/status-questao.vo';
import { TipoQuestaoValor } from '../../../../questoes/domain/value-objects/tipo-questao.vo';
import { Gabarito } from '../../../../questoes/domain/value-objects/gabarito.vo';
import { ConfirmarImportacaoProvaUseCase } from '../../../application/use-cases/confirmar-importacao-prova.use-case';
import { ImportacaoException } from '../../../domain/exceptions/importacao.exception';
import { ImportacaoProva } from '../../../domain/entities/importacao-prova.entity';
import { QuestaoImportada } from '../../../domain/entities/questao-importada.entity';
import type { ImportacaoProvaRepository } from '../../../domain/repositories/importacao-prova.repository';
import { StatusImportacaoValor } from '../../../domain/value-objects/status-importacao.vo';

describe('ConfirmarImportacaoProvaUseCase', () => {
  let useCase: ConfirmarImportacaoProvaUseCase;

  let importacaoRepository: ImportacaoProvaRepository;
  let buscarPorIdMock: jest.MockedFunction<
    ImportacaoProvaRepository['buscarPorId']
  >;
  let salvarMock: jest.MockedFunction<ImportacaoProvaRepository['salvar']>;
  let criarProvaExecuteMock: jest.MockedFunction<CriarProvaUseCase['execute']>;
  let importarQuestaoExecuteMock: jest.MockedFunction<
    ImportarQuestaoUseCase['execute']
  >;

  beforeEach(() => {
    buscarPorIdMock = jest.fn();
    salvarMock = jest.fn();
    criarProvaExecuteMock = jest.fn();
    importarQuestaoExecuteMock = jest.fn();

    importacaoRepository = {
      salvar: salvarMock,
      buscarPorId: buscarPorIdMock,
    };

    useCase = new ConfirmarImportacaoProvaUseCase(
      importacaoRepository,
      {
        execute: criarProvaExecuteMock,
      } as unknown as CriarProvaUseCase,
      {
        execute: importarQuestaoExecuteMock,
      } as unknown as ImportarQuestaoUseCase,
    );
  });

  it('deve confirmar importação criando prova e importando questões', async () => {
    const questaoImportada = QuestaoImportada.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440001',
      numero: 1,
      enunciado: 'Texto da questão importada',
      tipoSugerido: TipoQuestaoValor.MULTIPLA_ESCOLHA,
      alternativas: [
        {
          letra: 'A',
          texto: 'Alternativa A',
        },
        {
          letra: 'B',
          texto: 'Alternativa B',
        },
      ],
      gabarito: {
        tipo: 'ALTERNATIVAS',
        valores: ['B'],
      },
      disciplina: 'Português',
      assunto: 'Interpretação de texto',
      textoApoio: 'Texto de apoio importado',
      confianca: 0.95,
      precisaRevisao: false,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    const importacao = ImportacaoProva.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      nomeArquivo: 'prova.pdf',
      tipoArquivo: 'application/pdf',
      status: StatusImportacaoValor.AGUARDANDO_REVISAO,
      questoes: [questaoImportada],
      erros: [],
      avisos: [],
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    const prova = Prova.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440010',
      titulo: 'PCDF - Agente de Polícia',
      cargo: 'Agente de Polícia',
      banca: 'NCE/UFRJ',
      ano: 2004,
      categoria: 'Policial',
      status: StatusProvaValor.RASCUNHO,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    const questao = Questao.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440020',
      provaId: prova.id,
      numero: 1,
      enunciado: 'Texto da questão importada',
      tipo: TipoQuestaoValor.MULTIPLA_ESCOLHA,
      status: StatusQuestaoValor.PENDENTE_REVISAO,
      alternativas: [
        Alternativa.criar({
          letra: 'A',
          texto: 'Alternativa A',
        }),
        Alternativa.criar({
          letra: 'B',
          texto: 'Alternativa B',
        }),
      ],
      gabarito: Gabarito.alternativas(['B']),
      disciplina: 'Português',
      assunto: 'Interpretação de texto',
      textoApoio: 'Texto de apoio importado',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    buscarPorIdMock.mockResolvedValue(importacao);
    salvarMock.mockImplementation((importacaoSalva) =>
      Promise.resolve(importacaoSalva),
    );
    criarProvaExecuteMock.mockResolvedValue(prova);
    importarQuestaoExecuteMock.mockResolvedValue(questao);

    const resultado = await useCase.execute({
      importacaoId: importacao.id,
      titulo: 'PCDF - Agente de Polícia',
      cargo: 'Agente de Polícia',
      banca: 'NCE/UFRJ',
      ano: 2004,
      categoria: 'Policial',
    });

    expect(buscarPorIdMock).toHaveBeenCalledWith(importacao.id);
    expect(criarProvaExecuteMock).toHaveBeenCalledWith({
      titulo: 'PCDF - Agente de Polícia',
      cargo: 'Agente de Polícia',
      banca: 'NCE/UFRJ',
      ano: 2004,
      categoria: 'Policial',
    });
    expect(importarQuestaoExecuteMock).toHaveBeenCalledWith({
      provaId: prova.id,
      numero: 1,
      enunciado: 'Texto da questão importada',
      tipo: TipoQuestaoValor.MULTIPLA_ESCOLHA,
      alternativas: [
        {
          letra: 'A',
          texto: 'Alternativa A',
        },
        {
          letra: 'B',
          texto: 'Alternativa B',
        },
      ],
      gabarito: expect.any(Gabarito),
      disciplina: 'Português',
      assunto: 'Interpretação de texto',
      textoApoio: 'Texto de apoio importado',
    });
    const inputImportacaoQuestao = importarQuestaoExecuteMock.mock.calls[0][0];

    expect(inputImportacaoQuestao.gabarito?.tipo).toBe('ALTERNATIVAS');
    expect(inputImportacaoQuestao.gabarito?.valores).toEqual(['B']);
    expect(importacao.status.valor).toBe(StatusImportacaoValor.CONCLUIDA);
    expect(salvarMock).toHaveBeenCalledTimes(1);
    expect(salvarMock).toHaveBeenCalledWith(importacao);
    expect(resultado).toEqual({
      prova,
      questoes: [questao],
    });
  });

  it('deve lançar erro quando a importação não existir', async () => {
    buscarPorIdMock.mockResolvedValue(null);

    await expect(
      useCase.execute({
        importacaoId: '550e8400-e29b-41d4-a716-446655440000',
        titulo: 'PCDF - Agente de Polícia',
        cargo: 'Agente de Polícia',
        banca: 'NCE/UFRJ',
        ano: 2004,
        categoria: 'Policial',
      }),
    ).rejects.toThrow(new ImportacaoException('Importação não encontrada.'));

    expect(criarProvaExecuteMock).not.toHaveBeenCalled();
    expect(importarQuestaoExecuteMock).not.toHaveBeenCalled();
    expect(salvarMock).not.toHaveBeenCalled();
  });

  it('deve lançar erro quando a importação não possuir questões', async () => {
    const importacao = ImportacaoProva.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      nomeArquivo: 'prova.pdf',
      tipoArquivo: 'application/pdf',
      status: StatusImportacaoValor.FALHOU,
      questoes: [],
      erros: ['Nenhuma questão foi identificada.'],
      avisos: [],
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    buscarPorIdMock.mockResolvedValue(importacao);

    await expect(
      useCase.execute({
        importacaoId: importacao.id,
        titulo: 'PCDF - Agente de Polícia',
        cargo: 'Agente de Polícia',
        banca: 'NCE/UFRJ',
        ano: 2004,
        categoria: 'Policial',
      }),
    ).rejects.toThrow(
      new ImportacaoException(
        'Importação sem questões não pode ser confirmada.',
      ),
    );

    expect(criarProvaExecuteMock).not.toHaveBeenCalled();
    expect(importarQuestaoExecuteMock).not.toHaveBeenCalled();
    expect(salvarMock).not.toHaveBeenCalled();
  });

  it('deve impedir confirmar importação já concluída', async () => {
    const questaoImportada = QuestaoImportada.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440001',
      numero: 1,
      enunciado: 'Texto da questão importada',
      tipoSugerido: TipoQuestaoValor.MULTIPLA_ESCOLHA,
      alternativas: [
        {
          letra: 'A',
          texto: 'Alternativa A',
        },
      ],
      gabarito: undefined,
      disciplina: undefined,
      assunto: undefined,
      textoApoio: undefined,
      confianca: 0.95,
      precisaRevisao: false,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    const importacao = ImportacaoProva.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      nomeArquivo: 'prova.pdf',
      tipoArquivo: 'application/pdf',
      status: StatusImportacaoValor.CONCLUIDA,
      questoes: [questaoImportada],
      erros: [],
      avisos: [],
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    buscarPorIdMock.mockResolvedValue(importacao);

    await expect(
      useCase.execute({
        importacaoId: importacao.id,
        titulo: 'PCDF - Agente de Polícia',
        cargo: 'Agente de Polícia',
        banca: 'NCE/UFRJ',
        ano: 2004,
        categoria: 'Policial',
      }),
    ).rejects.toThrow(new ImportacaoException('Importação já foi confirmada.'));

    expect(criarProvaExecuteMock).not.toHaveBeenCalled();
    expect(importarQuestaoExecuteMock).not.toHaveBeenCalled();
    expect(salvarMock).not.toHaveBeenCalled();
  });

  it('deve usar MULTIPLA_ESCOLHA quando a questão importada não possuir tipo sugerido', async () => {
    const questaoImportada = QuestaoImportada.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440001',
      numero: 1,
      enunciado: 'Texto da questão importada',
      tipoSugerido: undefined,
      alternativas: [
        {
          letra: 'A',
          texto: 'Alternativa A',
        },
      ],
      gabarito: undefined,
      disciplina: undefined,
      assunto: undefined,
      textoApoio: undefined,
      confianca: 0.7,
      precisaRevisao: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    const importacao = ImportacaoProva.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      nomeArquivo: 'prova.pdf',
      tipoArquivo: 'application/pdf',
      status: StatusImportacaoValor.AGUARDANDO_REVISAO,
      questoes: [questaoImportada],
      erros: [],
      avisos: [],
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    const prova = Prova.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440010',
      titulo: 'PCDF - Agente de Polícia',
      cargo: 'Agente de Polícia',
      banca: 'NCE/UFRJ',
      ano: 2004,
      categoria: 'Policial',
      status: StatusProvaValor.RASCUNHO,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    const questao = Questao.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440020',
      provaId: prova.id,
      numero: 1,
      enunciado: 'Texto da questão importada',
      tipo: TipoQuestaoValor.MULTIPLA_ESCOLHA,
      status: StatusQuestaoValor.PENDENTE_REVISAO,
      alternativas: [
        Alternativa.criar({
          letra: 'A',
          texto: 'Alternativa A',
        }),
      ],
      gabarito: undefined,
      disciplina: undefined,
      assunto: undefined,
      textoApoio: undefined,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    buscarPorIdMock.mockResolvedValue(importacao);
    salvarMock.mockImplementation((importacaoSalva) =>
      Promise.resolve(importacaoSalva),
    );
    criarProvaExecuteMock.mockResolvedValue(prova);
    importarQuestaoExecuteMock.mockResolvedValue(questao);

    await useCase.execute({
      importacaoId: importacao.id,
      titulo: 'PCDF - Agente de Polícia',
      cargo: 'Agente de Polícia',
      banca: 'NCE/UFRJ',
      ano: 2004,
      categoria: 'Policial',
    });

    expect(importarQuestaoExecuteMock).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: TipoQuestaoValor.MULTIPLA_ESCOLHA,
      }),
    );
    expect(salvarMock).toHaveBeenCalledWith(importacao);
  });
});
