import { Prova } from '../../domain/entities/prova.entity';
import { ProvaOrmEntity } from '../persistence/entities/prova.orm-entity';

export class ProvaMapper {
  static toDomain(entity: ProvaOrmEntity): Prova {
    return Prova.reconstituir({
      id: entity.id,
      titulo: entity.titulo,
      cargo: entity.cargo,
      banca: entity.banca,
      ano: entity.ano,
      status: entity.status,
      categoria: entity.categoria,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toPersistence(prova: Prova): ProvaOrmEntity {
    const entity = new ProvaOrmEntity();

    entity.id = prova.id;
    entity.titulo = prova.titulo;
    entity.cargo = prova.cargo;
    entity.banca = prova.banca.valor;
    entity.ano = prova.ano.valor;
    entity.status = prova.status.valor;
    entity.categoria = prova.categoria.valor;
    entity.createdAt = prova.createdAt;
    entity.updatedAt = prova.updatedAt;

    return entity;
  }
}
