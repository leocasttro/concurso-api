import { BadRequestException } from '@nestjs/common';
import { ImportacoesController } from '../../../../presentation/controllers/importacoes.controller';
import { ImportarProvaPdfPreviewUseCase } from '../../../../application/use-cases/importar-prova-pdf-preview.use-case';
import { QuestaoImportada } from '../../../../domain/entities/questao-importada.entity';
import { TipoQuestaoValor } from '../../../../../questoes/domain/value-objects/tipo-questao.vo';
import { ImportacaoProva } from '../../../../domain/entities/importacao-prova.entity';
import { StatusImportacaoValor } from '../../../../domain/value-objects/status-importacao.vo';

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

  beforeEach(() => {
    importarPreviewExecuteMock = jest.fn();

    controller = new ImportacoesController({
      execute: importarPreviewExecuteMock,
    } as unknown as ImportarProvaPdfPreviewUseCase);
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
      createdAt: importacao.createdAt,
      updatedAt: importacao.updatedAt,
    });
  });

  it('deve lançar erro quando o arquivo não for enviado', async () => {
    await expect(controller.importarProvaPdfPreview()).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(importarPreviewExecuteMock).not.toHaveBeenCalled();
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
  });
});
