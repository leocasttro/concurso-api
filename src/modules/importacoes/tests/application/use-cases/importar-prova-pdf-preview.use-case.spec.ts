import { ImportarProvaPdfPreviewUseCase } from '../../../application/use-cases/importar-prova-pdf-preview.use-case';
import type { PdfTextExtractor } from '../../../application/services/pdf-text-extractor';
import type { ProvaImportadaParser } from '../../../application/services/prova-importada-parser';
import { ImportacaoProva } from '../../../domain/entities/importacao-prova.entity';
import { QuestaoImportada } from '../../../domain/entities/questao-importada.entity';
import type { ImportacaoProvaRepository } from '../../../domain/repositories/importacao-prova.repository';
import { StatusImportacaoValor } from '../../../domain/value-objects/status-importacao.vo';
import { TipoQuestaoValor } from '../../../../questoes/domain/value-objects/tipo-questao.vo';

describe('ImportarProvaPdfPreviewUseCase', () => {
  let useCase: ImportarProvaPdfPreviewUseCase;

  let importacaoRepository: ImportacaoProvaRepository;
  let pdfTextExtractor: PdfTextExtractor;
  let provaImportadaParser: ProvaImportadaParser;

  let salvarMock: jest.MockedFunction<ImportacaoProvaRepository['salvar']>;
  let extractMock: jest.MockedFunction<PdfTextExtractor['extract']>;
  let parseMock: jest.MockedFunction<ProvaImportadaParser['parse']>;

  beforeEach(() => {
    salvarMock = jest.fn();
    extractMock = jest.fn();
    parseMock = jest.fn();

    importacaoRepository = {
      salvar: salvarMock,
      buscarPorId: jest.fn(),
    };

    pdfTextExtractor = {
      extract: extractMock,
    };

    provaImportadaParser = {
      parse: parseMock,
    };

    useCase = new ImportarProvaPdfPreviewUseCase(
      importacaoRepository,
      pdfTextExtractor,
      provaImportadaParser,
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

    extractMock.mockResolvedValue('texto extraído do pdf');
    parseMock.mockResolvedValue({
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

    expect(extractMock).toHaveBeenCalledWith({
      fileBuffer,
    });
    expect(parseMock).toHaveBeenCalledWith({
      texto: 'texto extraído do pdf',
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

    extractMock.mockResolvedValue('texto extraído do pdf');
    parseMock.mockResolvedValue({
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
    extractMock.mockResolvedValue('');
    parseMock.mockResolvedValue({
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
