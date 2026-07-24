import { ImportacaoProva } from '../../domain/entities/importacao-prova.entity';
import { StatusImportacaoValor } from '../../domain/value-objects/status-importacao.vo';
import { TipoQuestaoValor } from '../../../questoes/domain/value-objects/tipo-questao.vo';

export type ImportacaoProvaHttpResponse = {
  id: string;
  nomeArquivo: string;
  tipoArquivo: string;
  status: StatusImportacaoValor;
  questoes: Array<{
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
  }>;
  erros: string[];
  avisos: string[];
  createdAt: Date;
  updatedAt?: Date;
};

export class ImportacaoProvaPresenter {
  static toHTTP(importacao: ImportacaoProva): ImportacaoProvaHttpResponse {
    return {
      id: importacao.id,
      nomeArquivo: importacao.nomeArquivo,
      tipoArquivo: importacao.tipoArquivo,
      status: importacao.status.valor,
      questoes: importacao.questoes.map((questao) => ({
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
      })),
      erros: importacao.erros,
      avisos: importacao.avisos,
      createdAt: importacao.createdAt,
      updatedAt: importacao.updatedAt,
    };
  }
}
