import { Inject, Injectable } from '@nestjs/common';
import {
  IMPORTACAO_PROVA_REPOSITORY,
  type ImportacaoProvaRepository,
} from '../../domain/repositories/importacao-prova.repository';
import { CriarProvaUseCase } from '../../../provas/application/use-cases/criar-prova.use-case';
import { ImportarQuestaoUseCase } from '../../../questoes/application/use-cases/importar-questao.use-case';
import { ConfirmarImportacaoProvaInput } from './confirmar-importacao-prova.input';
import { ImportacaoException } from '../../domain/exceptions/importacao.exception';
import { TipoQuestaoValor } from '../../../questoes/domain/value-objects/tipo-questao.vo';

@Injectable()
export class ConfirmarImportacaoProvaUseCase {
  constructor(
    @Inject(IMPORTACAO_PROVA_REPOSITORY)
    private readonly importacaoRepository: ImportacaoProvaRepository,

    private readonly criarProvaUseCase: CriarProvaUseCase,
    private readonly importarQuestaoUseCase: ImportarQuestaoUseCase,
  ) {}

  async execute(input: ConfirmarImportacaoProvaInput) {
    const importacao = await this.importacaoRepository.buscarPorId(
      input.importacaoId,
    );

    if (!importacao) {
      throw new ImportacaoException('Importação não encontrada.');
    }

    importacao.validarConfirmacao();

    const prova = await this.criarProvaUseCase.execute({
      titulo: input.titulo,
      cargo: input.cargo,
      banca: input.banca,
      ano: input.ano,
      categoria: input.categoria,
    });

    const questoes = await Promise.all(
      importacao.questoes.map((questaoImportada) =>
        this.importarQuestaoUseCase.execute({
          provaId: prova.id,
          numero: questaoImportada.numero,
          enunciado: questaoImportada.enunciado,
          tipo:
            questaoImportada.tipoSugerido ?? TipoQuestaoValor.MULTIPLA_ESCOLHA,
          alternativas: questaoImportada.alternativas,
          gabarito: undefined,
          disciplina: questaoImportada.disciplina,
          assunto: questaoImportada.assunto,
          textoApoio: questaoImportada.textoApoio,
        }),
      ),
    );

    importacao.confirmar();

    await this.importacaoRepository.salvar(importacao);

    return {
      prova,
      questoes,
    };
  }
}
