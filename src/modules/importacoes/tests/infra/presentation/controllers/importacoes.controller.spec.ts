import { BadRequestException } from '@nestjs/common';
import { ImportacoesController } from '../../../../presentation/controllers/importacoes.controller';
import { ImportarProvaPdfPreviewUseCase } from '../../../../application/use-cases/importar-prova-pdf-preview.use-case';
import { ConfirmarImportacaoProvaUseCase } from '../../../../application/use-cases/confirmar-importacao-prova.use-case';
import { QuestaoImportada } from '../../../../domain/entities/questao-importada.entity';
import { TipoQuestaoValor } from '../../../../../questoes/domain/value-objects/tipo-questao.vo';
import { ImportacaoProva } from '../../../../domain/entities/importacao-prova.entity';
import { StatusImportacaoValor } from '../../../../domain/value-objects/status-importacao.vo';
import type { ImportacaoProvaReviewAnalyzer } from '../../../../application/services/importacao-prova-review-analyzer';
import { Prova } from '../../../../../provas/domain/entities/prova.entity';
import { StatusProvaValor } from '../../../../../provas/domain/value-objects/status-prova.vo';
import { Questao } from '../../../../../questoes/domain/entities/questao.entity';
import { Alternativa } from '../../../../../questoes/domain/entities/alternativa.entity';
import { StatusQuestaoValor } from '../../../../../questoes/domain/value-objects/status-questao.vo';

type UploadedPdfFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
};

describe('ImportacoesController', () => {
  let controller: ImportacoesController;
  let importarPreviewExecuteMock: jest.MockedFunction<
    ImportarProvaPdfPreviewUseCase['execute']
  >;
  let confirmarImportacaoExecuteMock: jest.MockedFunction<
    ConfirmarImportacaoProvaUseCase['execute']
  >;
  let reviewAnalyzerMock: jest.MockedFunction<
    ImportacaoProvaReviewAnalyzer['analisar']
  >;

  beforeEach(() => {
    importarPreviewExecuteMock = jest.fn();
    confirmarImportacaoExecuteMock = jest.fn();
    reviewAnalyzerMock = jest.fn();

    controller = new ImportacoesController(
      {
        execute: importarPreviewExecuteMock,
      } as unknown as ImportarProvaPdfPreviewUseCase,
      {
        execute: confirmarImportacaoExecuteMock,
      } as unknown as ConfirmarImportacaoProvaUseCase,
      {
        analisar: reviewAnalyzerMock,
      } as unknown as ImportacaoProvaReviewAnalyzer,
    );
  });

  it('deve importar uma prova em PDF para preview', async () => {
    const file: UploadedPdfFile = {
      originalname: 'prova.pdf',
      mimetype: 'application/pdf',
      buffer: Buffer.from('conteudo do pdf'),
    };

    const questao = QuestaoImportada.reconstituir({
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
      disciplina: 'Português',
      assunto: 'Interpretação de texto',
      textoApoio: undefined,
      confianca: 0.75,
      precisaRevisao: true,
      createdAt: new Date(),
    });

    const importacao = ImportacaoProva.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      nomeArquivo: 'prova.pdf',
      tipoArquivo: 'application/pdf',
      status: StatusImportacaoValor.AGUARDANDO_REVISAO,
      questoes: [questao],
      erros: [],
      avisos: ['Questão 1 precisa de revisão.'],
      createdAt: new Date(),
    });

    importarPreviewExecuteMock.mockResolvedValue(importacao);

    const itensRevisao = [
      {
        questaoId: questao.id,
        numero: 1,
        campo: 'alternativas' as const,
        problema: 'Questão possui apenas 1 alternativa.',
        valorAtual: 'A: Alternativa A',
      },
    ];

    reviewAnalyzerMock.mockReturnValue(itensRevisao);

    const resultado = await controller.importarProvaPdfPreview(file);

    expect(importarPreviewExecuteMock).toHaveBeenCalledWith({
      nomeArquivo: 'prova.pdf',
      tipoArquivo: 'application/pdf',
      fileBuffer: file.buffer,
    });

    expect(resultado).toEqual({
      id: importacao.id,
      nomeArquivo: importacao.nomeArquivo,
      tipoArquivo: importacao.tipoArquivo,
      status: importacao.status.valor,
      questoes: [
        {
          id: questao.id,
          numero: questao.numero,
          enunciado: questao.enunciado,
          tipoSugerido: questao.tipoSugerido,
          alternativas: questao.alternativas,
          gabarito: questao.gabarito,
          disciplina: questao.disciplina,
          assunto: questao.assunto,
          textoApoio: questao.textoApoio,
          confianca: questao.confianca,
          precisaRevisao: questao.precisaRevisao,
          createdAt: questao.createdAt,
          updatedAt: questao.updatedAt,
        },
      ],
      erros: importacao.erros,
      avisos: importacao.avisos,
      revisao: {
        totalPendencias: 1,
        itens: itensRevisao,
      },
      createdAt: importacao.createdAt,
      updatedAt: importacao.updatedAt,
    });

    expect(reviewAnalyzerMock).toHaveBeenCalledWith(importacao.questoes);
  });

  it('deve lançar erro quando o arquivo não for enviado', async () => {
    await expect(controller.importarProvaPdfPreview()).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(importarPreviewExecuteMock).not.toHaveBeenCalled();
    expect(reviewAnalyzerMock).not.toHaveBeenCalled();
  });

  it('deve lançar erro quando o arquivo não for PDF', async () => {
    const file: UploadedPdfFile = {
      originalname: 'prova.txt',
      mimetype: 'text/plain',
      buffer: Buffer.from('conteudo'),
    };

    await expect(
      controller.importarProvaPdfPreview(file),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(importarPreviewExecuteMock).not.toHaveBeenCalled();
    expect(reviewAnalyzerMock).not.toHaveBeenCalled();
  });

  it('deve confirmar uma importação criando prova e questões definitivas', async () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');

    const prova = Prova.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440010',
      titulo: 'PCDF - Agente de Polícia',
      cargo: 'Agente de Polícia',
      banca: 'NCE/UFRJ',
      ano: 2004,
      categoria: 'Policial',
      status: StatusProvaValor.RASCUNHO,
      createdAt,
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
      disciplina: 'Português',
      assunto: 'Interpretação de texto',
      textoApoio: 'Texto de apoio',
      createdAt,
    });

    confirmarImportacaoExecuteMock.mockResolvedValue({
      prova,
      questoes: [questao],
    });

    const resultado = await controller.confirmarImportacao(
      '550e8400-e29b-41d4-a716-446655440000',
      {
        titulo: 'PCDF - Agente de Polícia',
        cargo: 'Agente de Polícia',
        banca: 'NCE/UFRJ',
        ano: 2004,
        categoria: 'Policial',
      },
    );

    expect(confirmarImportacaoExecuteMock).toHaveBeenCalledWith({
      importacaoId: '550e8400-e29b-41d4-a716-446655440000',
      titulo: 'PCDF - Agente de Polícia',
      cargo: 'Agente de Polícia',
      banca: 'NCE/UFRJ',
      ano: 2004,
      categoria: 'Policial',
    });
    expect(resultado).toEqual({
      prova: {
        id: prova.id,
        titulo: prova.titulo,
        cargo: prova.cargo,
        banca: prova.banca.valor,
        ano: prova.ano.valor,
        status: prova.status.valor,
        categoria: prova.categoria.valor,
        createdAt: prova.createdAt,
      },
      questoes: [
        {
          id: questao.id,
          provaId: questao.provaId,
          numero: questao.numero,
          enunciado: questao.enunciado,
          tipo: questao.tipo.valor,
          status: questao.status.valor,
          alternativas: questao.alternativas.map((alternativa) => ({
            id: alternativa.id,
            texto: alternativa.texto,
            letra: alternativa.letra,
          })),
          gabarito: undefined,
          disciplina: questao.disciplina,
          assunto: questao.assunto,
          textoApoio: questao.textoApoio,
          createdAt: questao.createdAt,
          updatedAt: questao.updatedAt,
        },
      ],
    });
  });
});
