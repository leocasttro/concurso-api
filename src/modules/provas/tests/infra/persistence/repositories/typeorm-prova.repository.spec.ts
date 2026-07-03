import type { Repository } from 'typeorm';
import { Prova } from '../../../../domain/entities/prova.entity';
import { ProvaOrmEntity } from '../../../../infra/persistence/entities/prova.orm-entity';
import { TypeOrmProvaRepository } from '../../../../infra/persistence/repositories/typeorm-prova.repository';

describe('TypeOrmProvaRepository', () => {
  let repository: TypeOrmProvaRepository;
  let typeOrmRepository: jest.Mocked<
    Pick<Repository<ProvaOrmEntity>, 'save' | 'find' | 'findOne' | 'delete'>
  >;

  beforeEach(() => {
    typeOrmRepository = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };

    repository = new TypeOrmProvaRepository(
      typeOrmRepository as unknown as Repository<ProvaOrmEntity>,
    );
  });

  it('deve salvar uma prova', async () => {
    const prova = Prova.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      titulo: 'Prova PF',
      cargo: 'Agente',
      banca: 'CEBRASPE',
      ano: 2024,
      createdAt: new Date(),
    });

    typeOrmRepository.save.mockImplementation((entity) =>
      Promise.resolve(entity as ProvaOrmEntity),
    );

    const resultado = await repository.salvar(prova);

    expect(typeOrmRepository.save).toHaveBeenCalledTimes(1);
    expect(typeOrmRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: prova.id,
        titulo: prova.titulo,
        cargo: prova.cargo,
        banca: prova.banca.valor,
        ano: prova.ano.valor,
      }),
    );
    expect(resultado).toBeInstanceOf(Prova);
    expect(resultado.id).toBe(prova.id);
  });

  it('deve listar provas ordenadas por data de criação desc', async () => {
    const entity = new ProvaOrmEntity();
    entity.id = '550e8400-e29b-41d4-a716-446655440000';
    entity.titulo = 'Prova PF';
    entity.cargo = 'Agente';
    entity.banca = 'CEBRASPE';
    entity.ano = 2024;
    entity.createdAt = new Date();

    typeOrmRepository.find.mockResolvedValue([entity]);

    const resultado = await repository.listar({});

    expect(typeOrmRepository.find).toHaveBeenCalledWith({
      where: {},
      order: { createdAt: 'DESC' },
      skip: 0,
      take: 12,
    });
    expect(resultado).toHaveLength(1);
    expect(resultado[0]).toBeInstanceOf(Prova);
    expect(resultado[0].id).toBe(entity.id);
  });

  it('deve buscar uma prova por id quando ela existir', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';

    const entity = new ProvaOrmEntity();
    entity.id = id;
    entity.titulo = 'Prova PF';
    entity.cargo = 'Agente';
    entity.banca = 'CEBRASPE';
    entity.ano = 2024;
    entity.createdAt = new Date();

    typeOrmRepository.findOne.mockResolvedValue(entity);

    const resultado = await repository.buscarPorId(id);

    expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
      where: { id },
    });
    expect(resultado).toBeInstanceOf(Prova);
    expect(resultado?.id).toBe(id);
  });

  it('deve retornar null quando a prova não existir', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';

    typeOrmRepository.findOne.mockResolvedValue(null);

    const resultado = await repository.buscarPorId(id);

    expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
      where: { id },
    });
    expect(resultado).toBeNull();
  });

  it('deve remover uma prova por id', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';

    typeOrmRepository.delete.mockResolvedValue({
      raw: [],
      affected: 1,
    });

    await repository.remover(id);

    expect(typeOrmRepository.delete).toHaveBeenCalledWith({ id });
  });
});
