import { TipoQuestaoValor } from '../../../questoes/domain/value-objects/tipo-questao.vo';

export type AtualizarQuestaoImportadaInput = {
  importacaoId: string;
  questaoId: string;
  enunciado?: string;
  tipoSugerido?: TipoQuestaoValor;
  alternativas?: Array<{
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
  precisaRevisao?: boolean;
};
