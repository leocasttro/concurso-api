import { randomUUID } from 'node:crypto';
import { AnoProva } from '../value-objects/ano-prova.vo';
import { Banca } from '../value-objects/banca.vo';
import { ProvaException } from '../exceptions/prova.exception';
import { AggregateRoot } from '../../../../shared/domain/entities/aggregate-root';

export class Prova extends AggregateRoot<string> {
  private constructor(
    id: string,
    public readonly titulo: string,
    public readonly cargo: string,
    public readonly banca: Banca,
    public readonly ano: AnoProva,
    createdAt: Date,
  ) {
    super(id, createdAt);
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

  static reconstituir(input: {
    id: string;
    titulo: string;
    cargo: string;
    banca: string;
    ano: number;
    createdAt: Date;
  }): Prova {
    return new Prova(
      input.id,
      input.titulo,
      input.cargo,
      Banca.criar(input.banca),
      AnoProva.criar(input.ano),
      input.createdAt,
    );
  }
}
