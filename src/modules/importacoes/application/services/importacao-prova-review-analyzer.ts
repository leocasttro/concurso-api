import { QuestaoImportada } from '../../domain/entities/questao-importada.entity';

export const IMPORTACAO_PROVA_REVIEW_ANALYZER = Symbol(
  'IMPORTACAO_PROVA_REVIEW_ANALYZER',
);

export type RevisaoImportacaoCampo =
  'enunciado' | 'alternativas' | 'textoApoio' | 'confianca';

export type RevisaoImportacaoItem = {
  questaoId: string;
  numero?: number;
  campo: RevisaoImportacaoCampo;
  problema: string;
  valorAtual?: string;
};

export interface ImportacaoProvaReviewAnalyzer {
  analisar(questoes: QuestaoImportada[]): RevisaoImportacaoItem[];
}
