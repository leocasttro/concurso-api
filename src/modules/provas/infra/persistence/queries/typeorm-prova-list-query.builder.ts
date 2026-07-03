import { FindManyOptions, FindOptionsWhere, ILike } from 'typeorm';
import { ListarProvasInput } from '../../../application/use-cases/listar-provas.input';
import { ProvaOrmEntity } from '../entities/prova.orm-entity';

export class TypeOrmProvaListQueryBuilder {
  static build(input: ListarProvasInput): FindManyOptions<ProvaOrmEntity> {
    return {
      where: this.buildWhere(input),
      order: { createdAt: 'DESC' },
      skip: this.getSkip(input),
      take: this.getTake(input),
    };
  }

  private static buildWhere(
    input: ListarProvasInput,
  ): FindOptionsWhere<ProvaOrmEntity>[] | FindOptionsWhere<ProvaOrmEntity> {
    const baseWhere = this.buildBaseWhere(input);

    if (!input.search?.trim()) {
      return baseWhere;
    }

    const search = input.search.trim();

    const searchWhere: FindOptionsWhere<ProvaOrmEntity>[] = [
      {
        ...baseWhere,
        titulo: ILike(`%${search}%`),
      },
      {
        ...baseWhere,
        cargo: ILike(`%${search}%`),
      },
    ];

    if (!input.banca?.trim()) {
      searchWhere.push({
        ...baseWhere,
        banca: ILike(`%${search}%`),
      });
    }

    return searchWhere;
  }

  private static buildBaseWhere(
    input: ListarProvasInput,
  ): FindOptionsWhere<ProvaOrmEntity> {
    const where: FindOptionsWhere<ProvaOrmEntity> = {};

    if (input.banca?.trim()) {
      where.banca = input.banca.trim().toUpperCase();
    }

    if (input.cargo?.trim()) {
      where.cargo = ILike(`%${input.cargo.trim()}%`);
    }

    if (input.ano) {
      where.ano = input.ano;
    }

    return where;
  }

  private static getTake(input: ListarProvasInput): number {
    return input.limit ?? 12;
  }

  private static getSkip(input: ListarProvasInput): number {
    const page = input.page ?? 1;
    const take = this.getTake(input);

    return (page - 1) * take;
  }
}
