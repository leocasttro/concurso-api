import { Inject, Injectable } from '@nestjs/common';
import { QUESTAO_REPOSITORY } from '../../domain/repositories/questao.repository';
import { Questao } from '../../domain/entities/questao.entity';
import { QuestaoException } from '../../domain/exceptions/questao.exception';
import type { QuestaoRepository } from '../../domain/repositories/questao.repository';
import type { ListarQuestoesPorProvaInput } from './listar-questoes-por-prova.input';

@Injectable()
export class ListarQuestoesPorProvaUseCase {
  constructor(
    @Inject(QUESTAO_REPOSITORY)
    private readonly questaoRepository: QuestaoRepository,
  ) {}

  async execute(input: ListarQuestoesPorProvaInput): Promise<Questao[]> {
    if (!input.provaId.trim()) {
      throw new QuestaoException('Prova é obrigatória para listar questões.');
    }

    return this.questaoRepository.listarPorProvaId(input.provaId);
  }
}
