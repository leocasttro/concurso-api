import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ImportacaoProva } from '../../../domain/entities/importacao-prova.entity';
import { ImportacaoProvaRepository } from '../../../domain/repositories/importacao-prova.repository';
import { ImportacaoProvaMapper } from '../../mappers/importacao-prova.mapper';
import { ImportacaoProvaOrmEntity } from '../entities/importacao-prova.orm-entity';

@Injectable()
export class TypeOrmImportacaoProvaRepository implements ImportacaoProvaRepository {
  constructor(
    @InjectRepository(ImportacaoProvaOrmEntity)
    private readonly repository: Repository<ImportacaoProvaOrmEntity>,
  ) {}

  async salvar(importacao: ImportacaoProva): Promise<ImportacaoProva> {
    const entity = ImportacaoProvaMapper.toPersistence(importacao);

    const importacaoSalva = await this.repository.save(entity);

    return ImportacaoProvaMapper.toDomain(importacaoSalva);
  }

  async buscarPorId(id: string): Promise<ImportacaoProva | null> {
    const entity = await this.repository.findOne({
      where: { id },
    });

    if (!entity) {
      return null;
    }

    return ImportacaoProvaMapper.toDomain(entity);
  }
}
