import { randomUUID } from 'node:crypto';
import { AggregateRoot } from '../../../../shared/domain/entities/aggregate-root';
import { QuestaoException } from '../exceptions/questao.exception';
import { Alternativa } from './alternativa.entity';
import { Gabarito } from '../value-objects/gabarito.vo';
import {
  StatusQuestao,
  StatusQuestaoValor,
} from '../value-objects/status-questao.vo';
import {
  TipoQuestao,
  TipoQuestaoValor,
} from '../value-objects/tipo-questao.vo';

export class Questao extends AggregateRoot<string> {
  private constructor(
    id: string,
    public readonly provaId: string,
    public numero: number | undefined,
    public enunciado: string,
    public tipo: TipoQuestao,
    public status: StatusQuestao,
    public alternativas: Alternativa[],
    public gabarito: Gabarito | undefined,
    public disciplina: string | undefined,
    public assunto: string | undefined,
    public textoApoio: string | undefined,
    createdAt: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
  }

  static importar(input: {
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
  }): Questao {
    if (!input.provaId?.trim()) {
      throw new QuestaoException('Prova da questão é obrigatória.');
    }

    if (!input.enunciado?.trim()) {
      throw new QuestaoException('Enunciado da questão é obrigatório.');
    }

    const alternativas = (input.alternativas ?? []).map((alternativa) =>
      Alternativa.criar(alternativa),
    );

    const questao = new Questao(
      randomUUID(),
      input.provaId,
      input.numero,
      input.enunciado.trim(),
      TipoQuestao.criar(input.tipo),
      StatusQuestao.importada(),
      alternativas,
      input.gabarito,
      input.disciplina?.trim(),
      input.assunto?.trim(),
      input.textoApoio?.trim(),
      new Date(),
    );

    if (questao.precisaRevisao()) {
      questao.enviarParaRevisao();
    }

    return questao;
  }

  static criarManual(input: {
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
  }): Questao {
    if (!input.provaId?.trim()) {
      throw new QuestaoException('Prova da questão é obrigatória.');
    }

    if (!input.enunciado?.trim()) {
      throw new QuestaoException('Enunciado da questão é obrigatório.');
    }

    const alternativas = (input.alternativas ?? []).map((alternativa) =>
      Alternativa.criar(alternativa),
    );

    return new Questao(
      randomUUID(),
      input.provaId,
      input.numero,
      input.enunciado.trim(),
      TipoQuestao.criar(input.tipo),
      StatusQuestao.rascunho(),
      alternativas,
      input.gabarito,
      input.disciplina?.trim(),
      input.assunto?.trim(),
      input.textoApoio?.trim(),
      new Date(),
    );
  }

  static reconstituir(input: {
    id: string;
    provaId: string;
    numero?: number;
    enunciado: string;
    tipo: TipoQuestaoValor;
    status: StatusQuestaoValor;
    alternativas: Alternativa[];
    gabarito?: Gabarito;
    disciplina?: string;
    assunto?: string;
    textoApoio?: string;
    createdAt: Date;
    updatedAt?: Date;
  }): Questao {
    return new Questao(
      input.id,
      input.provaId,
      input.numero,
      input.enunciado,
      TipoQuestao.criar(input.tipo),
      StatusQuestao.criar(input.status),
      input.alternativas,
      input.gabarito,
      input.disciplina,
      input.assunto,
      input.textoApoio,
      input.createdAt,
      input.updatedAt,
    );
  }

  publicar(): void {
    this.validarPublicacao();
    this.status = StatusQuestao.criar(StatusQuestaoValor.PUBLICADA);
  }

  enviarParaRevisao(): void {
    this.status = StatusQuestao.pendenteRevisao();
  }

  anular(): void {
    this.status = StatusQuestao.criar(StatusQuestaoValor.ANULADA);
  }

  private precisaRevisao(): boolean {
    if (!this.gabarito) {
      return true;
    }

    if (this.exigeAlternativas() && this.alternativas.length < 2) {
      return true;
    }

    return false;
  }

  private validarPublicacao(): void {
    if (!this.gabarito) {
      throw new QuestaoException('Questão publicada precisa de gabarito.');
    }

    if (this.exigeAlternativas() && this.alternativas.length < 2) {
      throw new QuestaoException(
        'Questão objetiva precisa ter pelo menos 2 alternativas.',
      );
    }

    if (
      this.tipo.valor === TipoQuestaoValor.MULTIPLA_ESCOLHA &&
      this.gabarito.valores.length !== 1
    ) {
      throw new QuestaoException(
        'Questão de múltipla escolha deve ter exatamente uma alternativa correta.',
      );
    }

    if (
      this.tipo.valor === TipoQuestaoValor.MULTIPLAS_CORRETAS &&
      this.gabarito.valores.length < 1
    ) {
      throw new QuestaoException(
        'Questão de múltiplas corretas deve ter ao menos uma alternativa correta.',
      );
    }
  }

  private exigeAlternativas(): boolean {
    return [
      TipoQuestaoValor.MULTIPLA_ESCOLHA,
      TipoQuestaoValor.MULTIPLAS_CORRETAS,
    ].includes(this.tipo.valor);
  }
}
