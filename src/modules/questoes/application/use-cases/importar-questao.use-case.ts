import { Inject, Injectable } from '@nestjs/common';
import { QUESTAO_REPOSITORY } from '../../domain/repositories/questao.repository';
import type { QuestaoRepository } from '../../domain/repositories/questao.repository';
import type { ImportarQuestaoInput } from './importar-questao.input';
import { Questao } from '../../domain/entities/questao.entity';

@Injectable()
export class ImportarQuestaoUseCase {
  constructor(
    @Inject(QUESTAO_REPOSITORY)
    private readonly questaoRepository: QuestaoRepository,
  ) {}

  async execute(input: ImportarQuestaoInput): Promise<Questao> {
    const questao = Questao.importar(input);

    return this.questaoRepository.salvar(questao);
  }
}
