import { Inject, Injectable } from '@nestjs/common';
import { QUESTAO_REPOSITORY } from '../../domain/repositories/questao.repository';
import type { QuestaoRepository } from '../../domain/repositories/questao.repository';
import type { AnularQuestaoInput } from './anular-questao.input';
import { Questao } from '../../domain/entities/questao.entity';
import { QuestaoNaoEncontradaException } from '../../domain/exceptions/questao-nao-encontrada.exception';

@Injectable()
export class AnularQuestaoUseCase {
  constructor(
    @Inject(QUESTAO_REPOSITORY)
    private readonly questaoRepository: QuestaoRepository,
  ) {}

  async execute(input: AnularQuestaoInput): Promise<Questao> {
    const questao = await this.questaoRepository.buscarPorId(input.id);

    if (!questao) {
      throw new QuestaoNaoEncontradaException();
    }

    questao.anular();

    return this.questaoRepository.salvar(questao);
  }
}
