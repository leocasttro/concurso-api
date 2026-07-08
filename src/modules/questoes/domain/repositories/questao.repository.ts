import { Questao } from '../entities/questao.entity';

export const QUESTAO_REPOSITORY = Symbol('QUESTAO_REPOSITORY');

export interface QuestaoRepository {
  salvar(questao: Questao): Promise<Questao>;
  listarPorProvaId(provaId: string): Promise<Questao[]>;
  buscarPorId(id: string): Promise<Questao | null>;
}
