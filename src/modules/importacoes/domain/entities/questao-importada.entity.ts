import { randomUUID } from 'node:crypto';
import { BaseEntity } from '../../../../shared/domain/entities/base-entity';
import { TipoQuestaoValor } from '../../../questoes/domain/value-objects/tipo-questao.vo';
import { ImportacaoException } from '../exceptions/importacao.exception';

export class QuestaoImportada extends BaseEntity<string> {
  private constructor(
    id: string,
    public readonly numero: number | undefined,
    public readonly enunciado: string,
    public readonly tipoSugerido: TipoQuestaoValor | undefined,
    public readonly alternativas: Array<{
      texto: string;
      letra?: string;
    }>,
    public readonly gabarito:
      | {
          tipo: string;
          valores: string[];
        }
      | undefined,
    public readonly disciplina: string | undefined,
    public readonly assunto: string | undefined,
    public readonly textoApoio: string | undefined,
    public readonly confianca: number,
    public readonly precisaRevisao: boolean,
    createdAt: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
  }

  static criar(input: {
    numero?: number;
    enunciado: string;
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
    confianca?: number;
    precisaRevisao?: boolean;
  }): QuestaoImportada {
    if (!input.enunciado?.trim()) {
      throw new ImportacaoException(
        'Enunciado da questão importada é obrigatório.',
      );
    }

    const confianca = input.confianca ?? 0;

    return new QuestaoImportada(
      randomUUID(),
      input.numero,
      input.enunciado.trim(),
      input.tipoSugerido,
      input.alternativas ?? [],
      input.gabarito,
      input.disciplina?.trim(),
      input.assunto?.trim(),
      input.textoApoio?.trim(),
      confianca,
      input.precisaRevisao ?? confianca < 0.8,
      new Date(),
    );
  }

  static reconstituir(input: {
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
  }): QuestaoImportada {
    return new QuestaoImportada(
      input.id,
      input.numero,
      input.enunciado,
      input.tipoSugerido,
      input.alternativas,
      input.gabarito,
      input.disciplina,
      input.assunto,
      input.textoApoio,
      input.confianca,
      input.precisaRevisao,
      input.createdAt,
      input.updatedAt,
    );
  }
}
