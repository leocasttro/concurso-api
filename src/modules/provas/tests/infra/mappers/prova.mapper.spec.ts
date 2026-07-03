import { Prova } from '../../../domain/entities/prova.entity';
import { ProvaMapper } from '../../../infra/mappers/prova.mapper';
import { ProvaOrmEntity } from '../../../infra/persistence/entities/prova.orm-entity';

describe('ProvaMapper', () => {
  it('deve converter ProvaOrmEntity para Prova de domínio', () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    const updatedAt = new Date('2024-01-02T00:00:00.000Z');

    const entity = new ProvaOrmEntity();
    entity.id = '550e8400-e29b-41d4-a716-446655440000';
    entity.titulo = 'Prova PF';
    entity.cargo = 'Agente';
    entity.banca = 'CEBRASPE';
    entity.ano = 2024;
    entity.createdAt = createdAt;
    entity.updatedAt = updatedAt;

    const prova = ProvaMapper.toDomain(entity);

    expect(prova).toBeInstanceOf(Prova);
    expect(prova.id).toBe(entity.id);
    expect(prova.titulo).toBe('Prova PF');
    expect(prova.cargo).toBe('Agente');
    expect(prova.banca.valor).toBe('CEBRASPE');
    expect(prova.ano.valor).toBe(2024);
    expect(prova.createdAt).toBe(createdAt);
    expect(prova.updatedAt).toBe(updatedAt);
  });

  it('deve converter Prova de domínio para ProvaOrmEntity', () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    const updatedAt = new Date('2024-01-02T00:00:00.000Z');

    const prova = Prova.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      titulo: 'Prova PF',
      cargo: 'Agente',
      banca: 'CEBRASPE',
      ano: 2024,
      createdAt,
      updatedAt,
    });

    const entity = ProvaMapper.toPersistence(prova);

    expect(entity).toBeInstanceOf(ProvaOrmEntity);
    expect(entity.id).toBe(prova.id);
    expect(entity.titulo).toBe('Prova PF');
    expect(entity.cargo).toBe('Agente');
    expect(entity.banca).toBe('CEBRASPE');
    expect(entity.ano).toBe(2024);
    expect(entity.createdAt).toBe(createdAt);
    expect(entity.updatedAt).toBe(updatedAt);
  });
});
