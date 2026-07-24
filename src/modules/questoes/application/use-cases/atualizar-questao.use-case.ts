import { Inject, Injectable } from '@nestjs/common';
import { QUESTAO_REPOSITORY } from '../../domain/repositories/questao.repository';
import type { QuestaoRepository } from '../../domain/repositories/questao.repository';
import { AtualizarQuestaoInput } from './atualizar-questao.input';
import { Questao } from '../../domain/entities/questao.entity';
import { QuestaoNaoEncontradaException } from '../../domain/exceptions/questao-nao-encontrada.exception';

@Injectable()
export class AtualizarQuestaoUseCase {
  constructor(
    @Inject(QUESTAO_REPOSITORY)
    private readonly questaoRepository: QuestaoRepository,
  ) {}

  async execute(input: AtualizarQuestaoInput): Promise<Questao> {
    const questao = await this.questaoRepository.buscarPorId(input.id);

    if (!questao) {
      throw new QuestaoNaoEncontradaException();
    }

    questao.atualizar({
      numero: input.numero,
      enunciado: input.enunciado,
      tipo: input.tipo,
      alternativas: input.alternativas,
      gabarito: input.gabarito,
      disciplina: input.disciplina,
      assunto: input.assunto,
      textoApoio: input.textoApoio,
    });

    return this.questaoRepository.salvar(questao);
  }
}
