import { FindOperator } from 'typeorm';
import { StatusProvaValor } from '../../../../domain/value-objects/status-prova.vo';
import { TypeOrmProvaListQueryBuilder } from '../../../../infra/persistence/queries/typeorm-prova-list-query.builder';

describe('TypeOrmProvaListQueryBuilder', () => {
  it('deve criar query padrão quando não houver filtros', () => {
    const query = TypeOrmProvaListQueryBuilder.build({});

    expect(query).toEqual({
      where: {},
      order: { createdAt: 'DESC' },
      skip: 0,
      take: 12,
    });
  });

  it('deve criar query com paginação', () => {
    const query = TypeOrmProvaListQueryBuilder.build({
      page: 3,
      limit: 10,
    });

    expect(query.skip).toBe(20);
    expect(query.take).toBe(10);
  });

  it('deve criar query com filtros diretos', () => {
    const query = TypeOrmProvaListQueryBuilder.build({
      banca: ' cebraspe ',
      ano: 2024,
      status: StatusProvaValor.PUBLICADA,
    });

    expect(query.where).toEqual({
      banca: 'CEBRASPE',
      ano: 2024,
      status: StatusProvaValor.PUBLICADA,
    });
  });

  it('deve criar query com busca textual em título, cargo e banca', () => {
    const query = TypeOrmProvaListQueryBuilder.build({
      search: 'agente',
    });

    expect(Array.isArray(query.where)).toBe(true);

    const where = query.where as Array<Record<string, unknown>>;

    expect(where).toHaveLength(3);
    expect(where[0]).toHaveProperty('titulo');
    expect(where[1]).toHaveProperty('cargo');
    expect(where[2]).toHaveProperty('banca');

    expect(where[0].titulo).toBeInstanceOf(FindOperator);
    expect(where[1].cargo).toBeInstanceOf(FindOperator);
    expect(where[2].banca).toBeInstanceOf(FindOperator);
  });

  it('deve combinar filtros diretos com busca textual', () => {
    const query = TypeOrmProvaListQueryBuilder.build({
      search: 'agente',
      banca: 'cebraspe',
      ano: 2024,
      status: StatusProvaValor.PUBLICADA,
    });

    expect(Array.isArray(query.where)).toBe(true);

    const where = query.where as Array<Record<string, unknown>>;

    expect(where).toHaveLength(2);
    expect(where[0]).toMatchObject({
      banca: 'CEBRASPE',
      ano: 2024,
      status: StatusProvaValor.PUBLICADA,
    });
    expect(where[1]).toMatchObject({
      banca: 'CEBRASPE',
      ano: 2024,
      status: StatusProvaValor.PUBLICADA,
    });

    expect(where[0]).toHaveProperty('titulo');
    expect(where[1]).toHaveProperty('cargo');
  });
});
