import { AplicarGabaritoImportacaoUseCase } from '../../../application/use-cases/aplicar-gabarito-importacao.use-case';
import { ImportacaoProva } from '../../../domain/entities/importacao-prova.entity';
import { QuestaoImportada } from '../../../domain/entities/questao-importada.entity';
import { ImportacaoException } from '../../../domain/exceptions/importacao.exception';
import type { ImportacaoProvaRepository } from '../../../domain/repositories/importacao-prova.repository';
import { StatusImportacaoValor } from '../../../domain/value-objects/status-importacao.vo';
import { TipoQuestaoValor } from '../../../../questoes/domain/value-objects/tipo-questao.vo';

describe('AplicarGabaritoImportacaoUseCase', () => {
  let useCase: AplicarGabaritoImportacaoUseCase;
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

    useCase = new AplicarGabaritoImportacaoUseCase(importacaoRepository);
  });

  it('deve aplicar gabarito na importação e salvar', async () => {
    const questao = QuestaoImportada.criar({
      numero: 1,
      enunciado: 'Questão importada',
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
      confianca: 0.7,
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
      respostas: [
        {
          numero: 1,
          valor: 'b',
        },
      ],
    });

    expect(buscarPorIdMock).toHaveBeenCalledWith(importacao.id);
    expect(salvarMock).toHaveBeenCalledWith(importacao);
    expect(resultado).toBe(importacao);
    expect(questao.gabarito).toEqual({
      tipo: 'ALTERNATIVAS',
      valores: ['B'],
    });
    expect(questao.precisaRevisao).toBe(false);
  });

  it('deve lançar erro quando a importação não existir', async () => {
    buscarPorIdMock.mockResolvedValue(null);

    await expect(
      useCase.execute({
        importacaoId: '550e8400-e29b-41d4-a716-446655440000',
        respostas: [
          {
            numero: 1,
            valor: 'A',
          },
        ],
      }),
    ).rejects.toThrow(new ImportacaoException('Importação não encontrada.'));

    expect(salvarMock).not.toHaveBeenCalled();
  });
});
