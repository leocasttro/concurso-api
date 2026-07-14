import { Inject, Injectable } from '@nestjs/common';
import { QUESTAO_REPOSITORY } from '../../domain/repositories/questao.repository';
import type { QuestaoRepository } from '../../domain/repositories/questao.repository';
import { CriarQuestaoInput } from './criar-questao.input';
import { Questao } from '../../domain/entities/questao.entity';

@Injectable()
export class CriarQuestaoUseCase {
  constructor(
    @Inject(QUESTAO_REPOSITORY)
    private readonly questaoRepository: QuestaoRepository,
  ) {}

  async execute(input: CriarQuestaoInput): Promise<Questao> {
    const questao = Questao.criarManual(input);

    return this.questaoRepository.salvar(questao);
  }
}
