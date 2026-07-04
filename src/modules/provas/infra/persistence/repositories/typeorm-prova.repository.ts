import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prova } from '../../../domain/entities/prova.entity';
import type { ProvaRepository } from '../../../domain/repositories/prova.repository';
import { ProvaOrmEntity } from '../entities/prova.orm-entity';
import { ProvaMapper } from '../../mappers/prova.mapper';
import { ListarProvasInput } from '../../../application/use-cases/listar-provas.input';
import { TypeOrmProvaListQueryBuilder } from '../queries/typeorm-prova-list-query.builder';
import { PaginatedResult } from '../../../../../shared/application/pagination/paginated-result';

@Injectable()
export class TypeOrmProvaRepository implements ProvaRepository {
  constructor(
    @InjectRepository(ProvaOrmEntity)
    private readonly repository: Repository<ProvaOrmEntity>,
  ) {}

  async salvar(prova: Prova): Promise<Prova> {
    const entity = ProvaMapper.toPersistence(prova);
    const saved = await this.repository.save(entity);
    return ProvaMapper.toDomain(saved);
  }

  async listar(input: ListarProvasInput): Promise<PaginatedResult<Prova>> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 12;

    const [entities, total] = await this.repository.findAndCount(
      TypeOrmProvaListQueryBuilder.build(input),
    );

    return {
      data: entities.map((entity) => ProvaMapper.toDomain(entity)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async buscarPorId(id: string): Promise<Prova | null> {
    const entity = await this.repository.findOne({ where: { id } });

    return entity ? ProvaMapper.toDomain(entity) : null;
  }

  async remover(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}
