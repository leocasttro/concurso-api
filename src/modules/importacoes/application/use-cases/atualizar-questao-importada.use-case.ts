import { Inject, Injectable } from '@nestjs/common';

import {
  IMPORTACAO_PROVA_REPOSITORY,
  type ImportacaoProvaRepository,
} from '../../domain/repositories/importacao-prova.repository';
import { ImportacaoException } from '../../domain/exceptions/importacao.exception';
import { QuestaoImportada } from '../../domain/entities/questao-importada.entity';
import { AtualizarQuestaoImportadaInput } from './atualizar-questao-importada.input';

@Injectable()
export class AtualizarQuestaoImportadaUseCase {
  constructor(
    @Inject(IMPORTACAO_PROVA_REPOSITORY)
    private readonly importacaoRepository: ImportacaoProvaRepository,
  ) {}

  async execute(
    input: AtualizarQuestaoImportadaInput,
  ): Promise<QuestaoImportada> {
    const importacao = await this.importacaoRepository.buscarPorId(
      input.importacaoId,
    );

    if (!importacao) {
      throw new ImportacaoException('Importação não encontrada.');
    }

    const questao = importacao.atualizarQuestaoImportada(input.questaoId, {
      enunciado: input.enunciado,
      tipoSugerido: input.tipoSugerido,
      alternativas: input.alternativas,
      gabarito: input.gabarito,
      disciplina: input.disciplina,
      assunto: input.assunto,
      textoApoio: input.textoApoio,
      precisaRevisao: input.precisaRevisao,
    });

    await this.importacaoRepository.salvar(importacao);

    return questao;
  }
}
