import type { Repository } from 'typeorm';
import { Questao } from '../../../../domain/entities/questao.entity';
import { Gabarito } from '../../../../domain/value-objects/gabarito.vo';
import { StatusQuestaoValor } from '../../../../domain/value-objects/status-questao.vo';
import { TipoQuestaoValor } from '../../../../domain/value-objects/tipo-questao.vo';
import { AlternativaOrmEntity } from '../../../../infra/persistence/entities/alternativa.orm-entity';
import { QuestaoOrmEntity } from '../../../../infra/persistence/entities/questao.orm-entity';
import { TypeormQuestaoRepository } from '../../../../infra/persistence/repositories/typeorm-questao.repository';

describe('TypeormQuestaoRepository', () => {
  let repository: TypeormQuestaoRepository;
  let typeOrmRepository: jest.Mocked<
    Pick<Repository<QuestaoOrmEntity>, 'save' | 'find' | 'findOne'>
  >;

  beforeEach(() => {
    typeOrmRepository = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    repository = new TypeormQuestaoRepository(
      typeOrmRepository as unknown as Repository<QuestaoOrmEntity>,
    );
  });

  it('deve salvar uma questão', async () => {
    const questao = Questao.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      provaId: '550e8400-e29b-41d4-a716-446655440999',
      numero: 1,
      enunciado: 'Qual alternativa está correta?',
      tipo: TipoQuestaoValor.MULTIPLA_ESCOLHA,
      status: StatusQuestaoValor.PUBLICADA,
      alternativas: [],
      gabarito: Gabarito.alternativas(['A']),
      disciplina: 'Português',
      assunto: 'Interpretação',
      textoApoio: 'Texto de apoio',
      createdAt: new Date(),
    });

    typeOrmRepository.save.mockImplementation((entity) =>
      Promise.resolve(entity as QuestaoOrmEntity),
    );

    const resultado = await repository.salvar(questao);

    expect(typeOrmRepository.save).toHaveBeenCalledTimes(1);
    expect(typeOrmRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: questao.id,
        provaId: questao.provaId,
        numero: questao.numero,
        enunciado: questao.enunciado,
        tipo: questao.tipo.valor,
        status: questao.status.valor,
        gabaritoValores: ['A'],
      }),
    );
    expect(resultado).toBeInstanceOf(Questao);
    expect(resultado.id).toBe(questao.id);
  });

  it('deve listar questões por prova ordenadas por número e data de criação', async () => {
    const entity = new QuestaoOrmEntity();
    entity.id = '550e8400-e29b-41d4-a716-446655440000';
    entity.provaId = '550e8400-e29b-41d4-a716-446655440999';
    entity.numero = 1;
    entity.enunciado = 'Qual alternativa está correta?';
    entity.tipo = TipoQuestaoValor.MULTIPLA_ESCOLHA;
    entity.status = StatusQuestaoValor.PUBLICADA;
    entity.alternativas = [];
    entity.disciplina = 'Português';
    entity.assunto = 'Interpretação';
    entity.textoApoio = 'Texto de apoio';
    entity.createdAt = new Date();

    typeOrmRepository.find.mockResolvedValue([entity]);

    const resultado = await repository.listarPorProvaId(entity.provaId);

    expect(typeOrmRepository.find).toHaveBeenCalledWith({
      where: { provaId: entity.provaId },
      order: {
        numero: 'ASC',
        createdAt: 'ASC',
      },
    });
    expect(resultado).toHaveLength(1);
    expect(resultado[0]).toBeInstanceOf(Questao);
    expect(resultado[0].id).toBe(entity.id);
  });

  it('deve buscar uma questão por id quando ela existir', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';

    const alternativa = new AlternativaOrmEntity();
    alternativa.id = '550e8400-e29b-41d4-a716-446655440001';
    alternativa.questaoId = id;
    alternativa.texto = 'Alternativa A';
    alternativa.letra = 'A';

    const entity = new QuestaoOrmEntity();
    entity.id = id;
    entity.provaId = '550e8400-e29b-41d4-a716-446655440999';
    entity.numero = 1;
    entity.enunciado = 'Qual alternativa está correta?';
    entity.tipo = TipoQuestaoValor.MULTIPLA_ESCOLHA;
    entity.status = StatusQuestaoValor.PUBLICADA;
    entity.alternativas = [alternativa];
    entity.createdAt = new Date();

    typeOrmRepository.findOne.mockResolvedValue(entity);

    const resultado = await repository.buscarPorId(id);

    expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
      where: { id },
    });
    expect(resultado).toBeInstanceOf(Questao);
    expect(resultado?.id).toBe(id);
    expect(resultado?.alternativas).toHaveLength(1);
  });

  it('deve retornar null quando a questão não existir', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';

    typeOrmRepository.findOne.mockResolvedValue(null);

    const resultado = await repository.buscarPorId(id);

    expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
      where: { id },
    });
    expect(resultado).toBeNull();
  });
});
