import { Inject, Injectable } from '@nestjs/common';
import { QUESTAO_REPOSITORY } from '../../domain/repositories/questao.repository';
import type { QuestaoRepository } from '../../domain/repositories/questao.repository';
import { PublicarQuestaoInput } from './publicar-questao.input';
import { Questao } from '../../domain/entities/questao.entity';
import { QuestaoNaoEncontradaException } from '../../domain/exceptions/questao-nao-encontrada.exception';

@Injectable()
export class PublicarQuestaoUseCase {
  constructor(
    @Inject(QUESTAO_REPOSITORY)
    private readonly questaoRepository: QuestaoRepository,
  ) {}

  async execute(input: PublicarQuestaoInput): Promise<Questao> {
    const questao = await this.questaoRepository.buscarPorId(input.id);

    if (!questao) {
      throw new QuestaoNaoEncontradaException();
    }

    questao.publicar();

    return this.questaoRepository.salvar(questao);
  }
}
