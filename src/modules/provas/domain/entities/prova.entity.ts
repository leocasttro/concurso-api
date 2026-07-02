import { randomUUID } from 'node:crypto';
import { AnoProva } from '../value-objects/ano-prova.vo';
import { Banca } from '../value-objects/banca.vo';
import { ProvaException } from '../exceptions/prova.exception';
import { AggregateRoot } from '../../../../shared/domain/entities/aggregate-root';

export class Prova extends AggregateRoot<string> {
  private constructor(
    id: string,
    public titulo: string,
    public cargo: string,
    public banca: Banca,
    public ano: AnoProva,
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
      new Date(),
    );
  }

  atualizar(input: {
    titulo: string;
    cargo: string;
    banca: string;
    ano: number;
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
  }

  static reconstituir(input: {
    id: string;
    titulo: string;
    cargo: string;
    banca: string;
    ano: number;
    createdAt: Date;
    updatedAt?: Date;
  }): Prova {
    return new Prova(
      input.id,
      input.titulo,
      input.cargo,
      Banca.criar(input.banca),
      AnoProva.criar(input.ano),
      input.createdAt,
      input.updatedAt,
    );
  }
}
