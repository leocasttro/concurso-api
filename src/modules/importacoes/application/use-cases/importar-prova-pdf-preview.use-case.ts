import { Inject, Injectable } from '@nestjs/common';
import { ImportacaoProva } from '../../domain/entities/importacao-prova.entity';
import { IMPORTACAO_PROVA_REPOSITORY } from '../../domain/repositories/importacao-prova.repository';
import type { ImportacaoProvaRepository } from '../../domain/repositories/importacao-prova.repository';
import type { PdfTextExtractor } from '../services/pdf-text-extractor';
import type { ProvaImportadaParser } from '../services/prova-importada-parser';

export const PDF_TEXT_EXTRACTOR = Symbol('PDF_TEXT_EXTRACTOR');
export const PROVA_IMPORTADA_PARSER = Symbol('PROVA_IMPORTADA_PARSER');

export type ImportarProvaPdfPreviewInput = {
  nomeArquivo: string;
  tipoArquivo: string;
  fileBuffer: Buffer;
};

@Injectable()
export class ImportarProvaPdfPreviewUseCase {
  constructor(
    @Inject(IMPORTACAO_PROVA_REPOSITORY)
    private readonly importacaoRepository: ImportacaoProvaRepository,

    @Inject(PDF_TEXT_EXTRACTOR)
    private readonly pdfTextExtractor: PdfTextExtractor,

    @Inject(PROVA_IMPORTADA_PARSER)
    private readonly provaImportadaParser: ProvaImportadaParser,
  ) {}

  async execute(input: ImportarProvaPdfPreviewInput): Promise<ImportacaoProva> {
    const importacao = ImportacaoProva.criar({
      nomeArquivo: input.nomeArquivo,
      tipoArquivo: input.tipoArquivo,
    });

    importacao.iniciarProcessamento();

    const texto = await this.pdfTextExtractor.extract({
      fileBuffer: input.fileBuffer,
    });

    const resultadoParser = await this.provaImportadaParser.parse({
      texto,
    });

    resultadoParser.questoes.forEach((questao) => {
      importacao.adicionarQuestao(questao);
    });

    resultadoParser.avisos.forEach((aviso) => {
      importacao.adicionarAviso(aviso);
    });

    resultadoParser.erros.forEach((erro) => {
      importacao.adicionarErro(erro);
    });

    importacao.finalizarProcessamento();

    return this.importacaoRepository.salvar(importacao);
  }
}
