import { ImportarProvaPdfPreviewUseCase } from '../../../application/use-cases/importar-prova-pdf-preview.use-case';
import { ImportacaoProva } from '../../../domain/entities/importacao-prova.entity';
import { QuestaoImportada } from '../../../domain/entities/questao-importada.entity';
import type { ImportacaoProvaRepository } from '../../../domain/repositories/importacao-prova.repository';
import { StatusImportacaoValor } from '../../../domain/value-objects/status-importacao.vo';
import { TipoQuestaoValor } from '../../../../questoes/domain/value-objects/tipo-questao.vo';
import type { ExtratorProvaPdf } from '../../../application/services/extrator-prova-pdf';

describe('ImportarProvaPdfPreviewUseCase', () => {
  let useCase: ImportarProvaPdfPreviewUseCase;

  let importacaoRepository: ImportacaoProvaRepository;

  let extratorProvaPdf: ExtratorProvaPdf;
  let extrairMock: jest.MockedFunction<ExtratorProvaPdf['extrair']>;

  let salvarMock: jest.MockedFunction<ImportacaoProvaRepository['salvar']>;

  beforeEach(() => {
    salvarMock = jest.fn();
    extrairMock = jest.fn();

    importacaoRepository = {
      salvar: salvarMock,
      buscarPorId: jest.fn(),
    };

    extratorProvaPdf = {
      extrair: extrairMock,
    };

    useCase = new ImportarProvaPdfPreviewUseCase(
      importacaoRepository,
      extratorProvaPdf,
    );
  });

  it('deve importar PDF e salvar preview concluído quando não houver erros ou revisão', async () => {
    const fileBuffer = Buffer.from('pdf fake');

    const questao = QuestaoImportada.criar({
      numero: 1,
      enunciado: 'Questão importada',
      tipoSugerido: TipoQuestaoValor.CERTO_ERRADO,
      confianca: 0.95,
      precisaRevisao: false,
    });

    extrairMock.mockResolvedValue({
      questoes: [questao],
      avisos: [],
      erros: [],
    });

    salvarMock.mockImplementation((importacao) => Promise.resolve(importacao));

    const resultado = await useCase.execute({
      nomeArquivo: 'prova.pdf',
      tipoArquivo: 'application/pdf',
      fileBuffer,
    });

    expect(extrairMock).toHaveBeenCalledWith({
      nomeArquivo: 'prova.pdf',
      tipoArquivo: 'application/pdf',
      fileBuffer,
    });
    expect(salvarMock).toHaveBeenCalledTimes(1);
    expect(salvarMock).toHaveBeenCalledWith(resultado);

    expect(resultado).toBeInstanceOf(ImportacaoProva);
    expect(resultado.nomeArquivo).toBe('prova.pdf');
    expect(resultado.tipoArquivo).toBe('application/pdf');
    expect(resultado.questoes).toHaveLength(1);
    expect(resultado.avisos).toEqual([]);
    expect(resultado.erros).toEqual([]);
    expect(resultado.status.valor).toBe(StatusImportacaoValor.CONCLUIDA);
  });

  it('deve salvar preview aguardando revisão quando o parser retornar avisos', async () => {
    const questao = QuestaoImportada.criar({
      numero: 1,
      enunciado: 'Questão importada',
      tipoSugerido: TipoQuestaoValor.CERTO_ERRADO,
      confianca: 0.95,
      precisaRevisao: false,
    });

    extrairMock.mockResolvedValue({
      questoes: [questao],
      avisos: ['Questão sem gabarito detectado.'],
      erros: [],
    });
    salvarMock.mockImplementation((importacao) => Promise.resolve(importacao));

    const resultado = await useCase.execute({
      nomeArquivo: 'prova.pdf',
      tipoArquivo: 'application/pdf',
      fileBuffer: Buffer.from('pdf fake'),
    });

    expect(resultado.avisos).toEqual(['Questão sem gabarito detectado.']);
    expect(resultado.status.valor).toBe(
      StatusImportacaoValor.AGUARDANDO_REVISAO,
    );
  });

  it('deve salvar preview como falhou quando parser retornar erro e nenhuma questão', async () => {
    extrairMock.mockResolvedValue({
      questoes: [],
      avisos: [],
      erros: ['Não foi possível identificar questões.'],
    });
    salvarMock.mockImplementation((importacao) => Promise.resolve(importacao));

    const resultado = await useCase.execute({
      nomeArquivo: 'prova.pdf',
      tipoArquivo: 'application/pdf',
      fileBuffer: Buffer.from('pdf fake'),
    });

    expect(resultado.questoes).toEqual([]);
    expect(resultado.erros).toEqual(['Não foi possível identificar questões.']);
    expect(resultado.status.valor).toBe(StatusImportacaoValor.FALHOU);
  });
});
