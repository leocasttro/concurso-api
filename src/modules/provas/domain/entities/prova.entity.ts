import { randomUUID } from 'node:crypto';
import { AnoProva } from '../value-objects/ano-prova.vo';
import { Banca } from '../value-objects/banca.vo';
import { ProvaException } from '../exceptions/prova.exception';
import { AggregateRoot } from '../../../../shared/domain/entities/aggregate-root';
import {
  StatusProva,
  StatusProvaValor,
} from '../value-objects/status-prova.vo';
import { CategoriaProvaVO } from '../value-objects/categoria-prova.vo';

export class Prova extends AggregateRoot<string> {
  private constructor(
    id: string,
    public titulo: string,
    public cargo: string,
    public banca: Banca,
    public ano: AnoProva,
    public status: StatusProva,
    public categoria: CategoriaProvaVO,
    createdAt: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
  }

  static criar(input: {
    titulo: string;
    cargo: string;
    banca: string;
    ano: number;
    categoria: string;
  }): Prova {
    if (!input.titulo?.trim()) {
      throw new ProvaException('Título da prova é obrigatório.');
    }

    if (!input.cargo?.trim()) {
      throw new ProvaException('Cargo é obrigatório.');
    }

    return new Prova(
      randomUUID(),
      input.titulo.trim(),
      input.cargo.trim(),
      Banca.criar(input.banca),
      AnoProva.criar(input.ano),
      StatusProva.rascunho(),
      CategoriaProvaVO.criar(input.categoria),
      new Date(),
    );
  }

  atualizar(input: {
    titulo: string;
    cargo: string;
    banca: string;
    ano: number;
    categoria: string;
  }): void {
    if (!input.titulo?.trim()) {
      throw new ProvaException('Título da prova é obrigatório.');
    }
    if (!input.cargo?.trim()) {
      throw new ProvaException('Cargo é obrigatório');
    }
    this.titulo = input.titulo.trim();
    this.cargo = input.cargo.trim();
    this.banca = Banca.criar(input.banca);
    this.ano = AnoProva.criar(input.ano);
    this.categoria = CategoriaProvaVO.criar(input.categoria);
  }

  static reconstituir(input: {
    id: string;
    titulo: string;
    cargo: string;
    banca: string;
    ano: number;
    status: StatusProvaValor;
    categoria: string;
    createdAt: Date;
    updatedAt?: Date;
  }): Prova {
    return new Prova(
      input.id,
      input.titulo,
      input.cargo,
      Banca.criar(input.banca),
      AnoProva.criar(input.ano),
      StatusProva.criar(input.status),
      CategoriaProvaVO.criar(input.categoria),
      input.createdAt,
      input.updatedAt,
    );
  }

  publicar(): void {
    this.status = StatusProva.criar(StatusProvaValor.PUBLICADA);
  }

  enviarParaRevisao(): void {
    this.status = StatusProva.criar(StatusProvaValor.REVISAO);
  }

  voltarParaRascunho(): void {
    this.status = StatusProva.rascunho();
  }
}
