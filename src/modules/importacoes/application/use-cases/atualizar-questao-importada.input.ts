import { TipoQuestaoValor } from '../../../questoes/domain/value-objects/tipo-questao.vo';
import { GabaritoImportado } from '../../domain/entities/questao-importada.entity';

export type AtualizarQuestaoImportadaInput = {
  importacaoId: string;
  questaoId: string;
  enunciado?: string;
  tipoSugerido?: TipoQuestaoValor;
  alternativas?: Array<{
    texto: string;
    letra?: string;
  }>;
  gabarito?: GabaritoImportado;
  disciplina?: string;
  assunto?: string;
  textoApoio?: string;
  precisaRevisao?: boolean;
};
