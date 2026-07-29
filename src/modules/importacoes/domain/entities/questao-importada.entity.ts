import { randomUUID } from 'node:crypto';
import { BaseEntity } from '../../../../shared/domain/entities/base-entity';
import { TipoQuestaoValor } from '../../../questoes/domain/value-objects/tipo-questao.vo';
import { ImportacaoException } from '../exceptions/importacao.exception';

export class QuestaoImportada extends BaseEntity<string> {
  private constructor(
    id: string,
    public readonly numero: number | undefined,
    public enunciado: string,
    public tipoSugerido: TipoQuestaoValor | undefined,
    public alternativas: Array<{
      texto: string;
      letra?: string;
    }>,
    public gabarito:
      | {
          tipo: string;
          valores: string[];
        }
      | undefined,
    public disciplina: string | undefined,
    public assunto: string | undefined,
    public textoApoio: string | undefined,
    public confianca: number,
    public precisaRevisao: boolean,
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

  atualizar(input: {
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
  }): void {
    if (input.enunciado !== undefined) {
      if (!input.enunciado.trim()) {
        throw new ImportacaoException(
          'Enunciado da questão importada é obrigatório.',
        );
      }

      this.enunciado = input.enunciado.trim();
    }

    if (input.tipoSugerido !== undefined) {
      this.tipoSugerido = input.tipoSugerido;
    }

    if (input.alternativas !== undefined) {
      this.alternativas = input.alternativas.map((alternativa) => ({
        letra: alternativa.letra?.trim(),
        texto: alternativa.texto.trim(),
      }));
    }

    if (input.gabarito !== undefined) {
      this.gabarito = input.gabarito;
    }

    if (input.disciplina !== undefined) {
      this.disciplina = input.disciplina.trim() || undefined;
    }

    if (input.assunto !== undefined) {
      this.assunto = input.assunto.trim() || undefined;
    }

    if (input.textoApoio !== undefined) {
      this.textoApoio = input.textoApoio.trim() || undefined;
    }

    if (input.precisaRevisao !== undefined) {
      this.precisaRevisao = input.precisaRevisao;
    }
  }
}
