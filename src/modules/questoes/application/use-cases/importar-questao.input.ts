import { Gabarito } from '../../domain/value-objects/gabarito.vo';
import { TipoQuestaoValor } from '../../domain/value-objects/tipo-questao.vo';

export type ImportarQuestaoInput = {
  provaId: string;
  numero?: number;
  enunciado: string;
  tipo: TipoQuestaoValor;
  alternativas?: Array<{
    texto: string;
    letra?: string;
  }>;
  gabarito?: Gabarito;
  disciplina?: string;
  assunto?: string;
  textoApoio?: string;
};
