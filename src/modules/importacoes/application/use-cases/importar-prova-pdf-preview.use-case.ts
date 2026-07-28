import { Inject, Injectable } from '@nestjs/common';
import { ImportacaoProva } from '../../domain/entities/importacao-prova.entity';
import { IMPORTACAO_PROVA_REPOSITORY } from '../../domain/repositories/importacao-prova.repository';
import type { ImportacaoProvaRepository } from '../../domain/repositories/importacao-prova.repository';
import type { ExtratorProvaPdf } from '../services/extrator-prova-pdf';

export const EXTRATOR_PROVA_PDF = Symbol('EXTRATOR_PROVA_PDF');

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

    @Inject(EXTRATOR_PROVA_PDF)
    private readonly extratorProvaPdf: ExtratorProvaPdf,
  ) {}

  async execute(input: ImportarProvaPdfPreviewInput): Promise<ImportacaoProva> {
    const importacao = ImportacaoProva.criar({
      nomeArquivo: input.nomeArquivo,
      tipoArquivo: input.tipoArquivo,
    });

    importacao.iniciarProcessamento();

    const resultadoParser = await this.extratorProvaPdf.extrair({
      nomeArquivo: input.nomeArquivo,
      tipoArquivo: input.tipoArquivo,
      fileBuffer: input.fileBuffer,
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
