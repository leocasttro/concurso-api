import { AtualizarQuestaoImportadaUseCase } from '../../../application/use-cases/atualizar-questao-importada.use-case';
import { ImportacaoProva } from '../../../domain/entities/importacao-prova.entity';
import { QuestaoImportada } from '../../../domain/entities/questao-importada.entity';
import { ImportacaoException } from '../../../domain/exceptions/importacao.exception';
import type { ImportacaoProvaRepository } from '../../../domain/repositories/importacao-prova.repository';
import { StatusImportacaoValor } from '../../../domain/value-objects/status-importacao.vo';
import { TipoQuestaoValor } from '../../../../questoes/domain/value-objects/tipo-questao.vo';

describe('AtualizarQuestaoImportadaUseCase', () => {
  let useCase: AtualizarQuestaoImportadaUseCase;
  let importacaoRepository: ImportacaoProvaRepository;
  let buscarPorIdMock: jest.MockedFunction<
    ImportacaoProvaRepository['buscarPorId']
  >;
  let salvarMock: jest.MockedFunction<ImportacaoProvaRepository['salvar']>;

  beforeEach(() => {
    buscarPorIdMock = jest.fn();
    salvarMock = jest.fn();

    importacaoRepository = {
      buscarPorId: buscarPorIdMock,
      salvar: salvarMock,
    };

    useCase = new AtualizarQuestaoImportadaUseCase(importacaoRepository);
  });

  it('deve atualizar questão importada e salvar importação', async () => {
    const questao = QuestaoImportada.criar({
      numero: 1,
      enunciado: 'Enunciado original da questão importada',
      tipoSugerido: TipoQuestaoValor.MULTIPLA_ESCOLHA,
      alternativas: [
        {
          letra: 'A',
          texto: 'Alternativa original',
        },
      ],
      confianca: 0.65,
      precisaRevisao: true,
    });

    const importacao = ImportacaoProva.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      nomeArquivo: 'prova.pdf',
      tipoArquivo: 'application/pdf',
      status: StatusImportacaoValor.AGUARDANDO_REVISAO,
      questoes: [questao],
      erros: [],
      avisos: [],
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    buscarPorIdMock.mockResolvedValue(importacao);
    salvarMock.mockImplementation((importacaoSalva) =>
      Promise.resolve(importacaoSalva),
    );

    const resultado = await useCase.execute({
      importacaoId: importacao.id,
      questaoId: questao.id,
      enunciado: 'Enunciado corrigido da questão importada',
      alternativas: [
        {
          letra: 'A',
          texto: 'Alternativa corrigida',
        },
        {
          letra: 'B',
          texto: 'Nova alternativa',
        },
      ],
      disciplina: 'Português',
      assunto: 'Interpretação de texto',
      textoApoio: 'Texto de apoio corrigido',
      precisaRevisao: false,
    });

    expect(buscarPorIdMock).toHaveBeenCalledWith(importacao.id);
    expect(salvarMock).toHaveBeenCalledWith(importacao);
    expect(resultado).toBe(questao);
    expect(resultado.enunciado).toBe(
      'Enunciado corrigido da questão importada',
    );
    expect(resultado.alternativas).toEqual([
      {
        letra: 'A',
        texto: 'Alternativa corrigida',
      },
      {
        letra: 'B',
        texto: 'Nova alternativa',
      },
    ]);
    expect(resultado.disciplina).toBe('Português');
    expect(resultado.assunto).toBe('Interpretação de texto');
    expect(resultado.textoApoio).toBe('Texto de apoio corrigido');
    expect(resultado.precisaRevisao).toBe(false);
  });

  it('deve lançar erro quando a importação não existir', async () => {
    buscarPorIdMock.mockResolvedValue(null);

    await expect(
      useCase.execute({
        importacaoId: '550e8400-e29b-41d4-a716-446655440000',
        questaoId: '550e8400-e29b-41d4-a716-446655440001',
        enunciado: 'Enunciado corrigido',
      }),
    ).rejects.toThrow(new ImportacaoException('Importação não encontrada.'));

    expect(salvarMock).not.toHaveBeenCalled();
  });

  it('deve lançar erro quando a questão importada não existir', async () => {
    const importacao = ImportacaoProva.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      nomeArquivo: 'prova.pdf',
      tipoArquivo: 'application/pdf',
      status: StatusImportacaoValor.AGUARDANDO_REVISAO,
      questoes: [],
      erros: [],
      avisos: [],
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    buscarPorIdMock.mockResolvedValue(importacao);

    await expect(
      useCase.execute({
        importacaoId: importacao.id,
        questaoId: '550e8400-e29b-41d4-a716-446655440001',
        enunciado: 'Enunciado corrigido',
      }),
    ).rejects.toThrow(
      new ImportacaoException('Questão importada não encontrada.'),
    );

    expect(salvarMock).not.toHaveBeenCalled();
  });
});
