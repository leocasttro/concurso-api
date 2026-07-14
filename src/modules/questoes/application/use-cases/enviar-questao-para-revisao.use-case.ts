import { Inject, Injectable } from '@nestjs/common';
import { Questao } from '../../domain/entities/questao.entity';
import { QuestaoNaoEncontradaException } from '../../domain/exceptions/questao-nao-encontrada.exception';
import { QUESTAO_REPOSITORY } from '../../domain/repositories/questao.repository';
import type { QuestaoRepository } from '../../domain/repositories/questao.repository';
import type { EnviarQuestaoParaRevisaoInput } from './enviar-questao-para-revisao.input';

@Injectable()
export class EnviarQuestaoParaRevisaoUseCase {
  constructor(
    @Inject(QUESTAO_REPOSITORY)
    private readonly questaoRepository: QuestaoRepository,
  ) {}

  async execute(input: EnviarQuestaoParaRevisaoInput): Promise<Questao> {
    const questao = await this.questaoRepository.buscarPorId(input.id);

    if (!questao) {
      throw new QuestaoNaoEncontradaException();
    }

    questao.enviarParaRevisao();

    return this.questaoRepository.salvar(questao);
  }
}
