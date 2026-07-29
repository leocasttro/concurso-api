import { AggregateRoot } from '../../../../shared/domain/entities/aggregate-root';
import {
  StatusImportacao,
  StatusImportacaoValor,
} from '../value-objects/status-importacao.vo';
import { QuestaoImportada } from './questao-importada.entity';
import { ImportacaoException } from '../exceptions/importacao.exception';
import { randomUUID } from 'node:crypto';

export class ImportacaoProva extends AggregateRoot<string> {
  private constructor(
    id: string,
    public readonly nomeArquivo: string,
    public readonly tipoArquivo: string,
    public status: StatusImportacao,
    public questoes: QuestaoImportada[],
    public erros: string[],
    public avisos: string[],
    createdAt: Date,
    updateAt?: Date,
  ) {
    super(id, createdAt, updateAt);
  }

  static criar(input: {
    nomeArquivo: string;
    tipoArquivo: string;
  }): ImportacaoProva {
    if (!input.nomeArquivo?.trim()) {
      throw new ImportacaoException('Nome do arquivo é obrigatório');
    }

    if (!input.tipoArquivo?.trim()) {
      throw new ImportacaoException('Tipo do arquivo é obrigatório');
    }

    return new ImportacaoProva(
      randomUUID(),
      input.nomeArquivo.trim(),
      input.tipoArquivo.trim(),
      StatusImportacao.pendente(),
      [],
      [],
      [],
      new Date(),
    );
  }

  static reconstituir(input: {
    id: string;
    nomeArquivo: string;
    tipoArquivo: string;
    status: StatusImportacaoValor;
    questoes: QuestaoImportada[];
    erros: string[];
    avisos: string[];
    createdAt: Date;
    updateAt?: Date;
  }): ImportacaoProva {
    return new ImportacaoProva(
      input.id,
      input.nomeArquivo,
      input.tipoArquivo,
      StatusImportacao.criar(input.status),
      input.questoes,
      input.erros,
      input.avisos,
      input.createdAt,
      input.updateAt,
    );
  }

  iniciarProcessamento(): void {
    this.status = StatusImportacao.processando();
  }

  adicionarQuestao(questao: QuestaoImportada): void {
    this.questoes.push(questao);
  }

  adicionarErro(erro: string): void {
    if (!erro.trim()) {
      return;
    }

    this.erros.push(erro.trim());
  }

  adicionarAviso(aviso: string): void {
    if (!aviso.trim()) {
      return;
    }

    this.avisos.push(aviso.trim());
  }

  finalizarProcessamento(): void {
    if (this.erros.length > 0 && this.questoes.length === 0) {
      this.status = StatusImportacao.falhou();
      return;
    }

    if (this.precisaRevisao()) {
      this.status = StatusImportacao.aguardandoRevisao();
      return;
    }

    this.status = StatusImportacao.concluida();
  }

  cancelar(): void {
    if (this.status.valor === StatusImportacaoValor.CONCLUIDA) {
      throw new ImportacaoException(
        'Importação concluída não pode ser cancelada.',
      );
    }

    this.status = StatusImportacao.cancelada();
  }

  precisaRevisao(): boolean {
    if (this.avisos.length > 0) {
      return true;
    }

    if (this.questoes.length === 0) {
      return true;
    }

    return this.questoes.some((questao) => questao.precisaRevisao);
  }

  validarConfirmacao(): void {
    if (this.status.valor === StatusImportacaoValor.CONCLUIDA) {
      throw new ImportacaoException('Importação já foi confirmada.');
    }

    if (this.questoes.length === 0) {
      throw new ImportacaoException(
        'Importação sem questões não pode ser confirmada.',
      );
    }

    if (this.erros.length > 0) {
      throw new ImportacaoException(
        'Importação com erros não pode ser confirmada.',
      );
    }
  }

  confirmar(): void {
    this.validarConfirmacao();
    this.status = StatusImportacao.concluida();
  }
}
