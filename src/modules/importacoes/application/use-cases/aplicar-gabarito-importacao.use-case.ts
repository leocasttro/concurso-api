import { Inject, Injectable } from '@nestjs/common';
import {
  IMPORTACAO_PROVA_REPOSITORY,
  type ImportacaoProvaRepository,
} from '../../domain/repositories/importacao-prova.repository';
import { AplicarGabaritoImportacaoInput } from './aplicar-gabarito-importacao.input';
import { ImportacaoProva } from '../../domain/entities/importacao-prova.entity';
import { ImportacaoException } from '../../domain/exceptions/importacao.exception';

@Injectable()
export class AplicarGabaritoImportacaoUseCase {
  constructor(
    @Inject(IMPORTACAO_PROVA_REPOSITORY)
    private readonly importacaoRepository: ImportacaoProvaRepository,
  ) {}

  async execute(
    input: AplicarGabaritoImportacaoInput,
  ): Promise<ImportacaoProva> {
    const importacao = await this.importacaoRepository.buscarPorId(
      input.importacaoId,
    );

    if (!importacao) {
      throw new ImportacaoException('Importação não encontrada.');
    }

    importacao.aplicarGabarito(input.respostas);

    return this.importacaoRepository.salvar(importacao);
  }
}
