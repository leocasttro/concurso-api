import { Questao } from '../../domain/entities/questao.entity';
import { StatusQuestaoValor } from '../../domain/value-objects/status-questao.vo';
import { TipoQuestaoValor } from '../../domain/value-objects/tipo-questao.vo';
import { TipoGabaritoValor } from '../../domain/value-objects/gabarito.vo';

export type QuestaoHttpResponse = {
  id: string;
  provaId: string;
  numero?: number;
  enunciado: string;
  tipo: TipoQuestaoValor;
  status: StatusQuestaoValor;
  alternativas: Array<{
    id: string;
    texto: string;
    letra?: string;
  }>;
  gabarito?: {
    tipo: TipoGabaritoValor;
    valores: string[];
  };
  disciplina?: string;
  assunto?: string;
  textoApoio?: string;
  createdAt: Date;
  updatedAt?: Date;
};

export class QuestaoPresenter {
  static toHTTP(questao: Questao): QuestaoHttpResponse {
    return {
      id: questao.id,
      provaId: questao.provaId,
      numero: questao.numero,
      enunciado: questao.enunciado,
      tipo: questao.tipo.valor,
      status: questao.status.valor,
      alternativas: questao.alternativas.map((alternativa) => ({
        id: alternativa.id,
        texto: alternativa.texto,
        letra: alternativa.letra,
      })),
      gabarito: questao.gabarito
        ? {
            tipo: questao.gabarito.tipo,
            valores: questao.gabarito.valores,
          }
        : undefined,
      disciplina: questao.disciplina,
      assunto: questao.assunto,
      textoApoio: questao.textoApoio,
      createdAt: questao.createdAt,
      updatedAt: questao.updatedAt,
    };
  }
}
