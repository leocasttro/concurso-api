import { TipoQuestaoValor } from '../../../questoes/domain/value-objects/tipo-questao.vo';
import { QuestaoImportada } from '../../domain/entities/questao-importada.entity';

export type QuestaoImportadaHttpResponse = {
  id: string;
  numero?: number;
  enunciado: string;
  tipoSugerido?: TipoQuestaoValor;
  alternativas: Array<{
    texto: string;
    letra?: string;
  }>;
  gabarito?: {
    tipo: string;
    valores: string[];
  };
  disciplina?: string;
  assunto?: string;
  textoApoio?: string;
  confianca: number;
  precisaRevisao: boolean;
  createdAt: Date;
  updatedAt?: Date;
};

export class QuestaoImportadaPresenter {
  static toHTTP(questao: QuestaoImportada): QuestaoImportadaHttpResponse {
    return {
      id: questao.id,
      numero: questao.numero,
      enunciado: questao.enunciado,
      tipoSugerido: questao.tipoSugerido,
      alternativas: questao.alternativas,
      gabarito: questao.gabarito,
      disciplina: questao.disciplina,
      assunto: questao.assunto,
      textoApoio: questao.textoApoio,
      confianca: questao.confianca,
      precisaRevisao: questao.precisaRevisao,
      createdAt: questao.createdAt,
      updatedAt: questao.updatedAt,
    };
  }
}
