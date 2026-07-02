import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prova } from '../../../domain/entities/prova.entity';
import type { ProvaRepository } from '../../../domain/repositories/prova.repository';
import { ProvaOrmEntity } from '../entities/prova.orm-entity';
import { ProvaMapper } from '../../mappers/prova.mapper';

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

  async listar(): Promise<Prova[]> {
    const entities = await this.repository.find({
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => ProvaMapper.toDomain(entity));
  }

  async buscarPorId(id: string): Promise<Prova | null> {
    const entity = await this.repository.findOne({ where: { id } });

    return entity ? ProvaMapper.toDomain(entity) : null;
  }

  async remover(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}
