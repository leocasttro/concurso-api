import { Inject, Injectable } from '@nestjs/common';
import { QUESTAO_REPOSITORY } from '../../domain/repositories/questao.repository';
import type { QuestaoRepository } from '../../domain/repositories/questao.repository';
import { RemoverQuestaoInput } from './remover-questao.input';
import { QuestaoNaoEncontradaException } from '../../domain/exceptions/questao-nao-encontrada.exception';

@Injectable()
export class RemoverQuestaoUseCase {
  constructor(
    @Inject(QUESTAO_REPOSITORY)
    private readonly questaoRepository: QuestaoRepository,
  ) {}

  async execute(input: RemoverQuestaoInput): Promise<void> {
    const questao = await this.questaoRepository.buscarPorId(input.id);

    if (!questao) {
      throw new QuestaoNaoEncontradaException();
    }

    await this.questaoRepository.remover(input.id);
  }
}
