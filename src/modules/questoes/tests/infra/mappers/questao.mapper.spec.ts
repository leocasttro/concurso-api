import { Alternativa } from '../../../domain/entities/alternativa.entity';
import { Questao } from '../../../domain/entities/questao.entity';
import {
  Gabarito,
  TipoGabaritoValor,
} from '../../../domain/value-objects/gabarito.vo';
import { StatusQuestaoValor } from '../../../domain/value-objects/status-questao.vo';
import { TipoQuestaoValor } from '../../../domain/value-objects/tipo-questao.vo';
import { QuestaoMapper } from '../../../infra/mappers/questao.mapper';
import { AlternativaOrmEntity } from '../../../infra/persistence/entities/alternativa.orm-entity';
import { QuestaoOrmEntity } from '../../../infra/persistence/entities/questao.orm-entity';

describe('QuestaoMapper', () => {
  it('deve converter QuestaoOrmEntity para Questao de domínio', () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    const updatedAt = new Date('2024-01-02T00:00:00.000Z');

    const alternativa = new AlternativaOrmEntity();
    alternativa.id = '550e8400-e29b-41d4-a716-446655440001';
    alternativa.questaoId = '550e8400-e29b-41d4-a716-446655440000';
    alternativa.texto = 'Alternativa A';
    alternativa.letra = 'A';

    const entity = new QuestaoOrmEntity();
    entity.id = '550e8400-e29b-41d4-a716-446655440000';
    entity.provaId = '550e8400-e29b-41d4-a716-446655440999';
    entity.numero = 1;
    entity.enunciado = 'Qual alternativa está correta?';
    entity.tipo = TipoQuestaoValor.MULTIPLA_ESCOLHA;
    entity.status = StatusQuestaoValor.PUBLICADA;
    entity.alternativas = [alternativa];
    entity.gabaritoTipo = TipoGabaritoValor.ALTERNATIVAS;
    entity.gabaritoValores = ['A'];
    entity.disciplina = 'Português';
    entity.assunto = 'Interpretação de texto';
    entity.textoApoio = 'Texto de apoio';
    entity.createdAt = createdAt;
    entity.updatedAt = updatedAt;

    const questao = QuestaoMapper.toDomain(entity);

    expect(questao).toBeInstanceOf(Questao);
    expect(questao.id).toBe(entity.id);
    expect(questao.provaId).toBe(entity.provaId);
    expect(questao.numero).toBe(1);
    expect(questao.enunciado).toBe('Qual alternativa está correta?');
    expect(questao.tipo.valor).toBe(TipoQuestaoValor.MULTIPLA_ESCOLHA);
    expect(questao.status.valor).toBe(StatusQuestaoValor.PUBLICADA);
    expect(questao.alternativas).toHaveLength(1);
    expect(questao.alternativas[0].letra).toBe('A');
    expect(questao.gabarito?.tipo).toBe(TipoGabaritoValor.ALTERNATIVAS);
    expect(questao.gabarito?.valores).toEqual(['A']);
    expect(questao.createdAt).toBe(createdAt);
    expect(questao.updatedAt).toBe(updatedAt);
  });

  it('deve converter Questao de domínio para QuestaoOrmEntity', () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    const updatedAt = new Date('2024-01-02T00:00:00.000Z');

    const questao = Questao.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      provaId: '550e8400-e29b-41d4-a716-446655440999',
      numero: 1,
      enunciado: 'Qual alternativa está correta?',
      tipo: TipoQuestaoValor.MULTIPLA_ESCOLHA,
      status: StatusQuestaoValor.PUBLICADA,
      alternativas: [
        Alternativa.reconstituir({
          id: '550e8400-e29b-41d4-a716-446655440001',
          texto: 'Alternativa A',
          letra: 'A',
        }),
      ],
      gabarito: Gabarito.alternativas(['A']),
      disciplina: 'Português',
      assunto: 'Interpretação de texto',
      textoApoio: 'Texto de apoio',
      createdAt,
      updatedAt,
    });

    const entity = QuestaoMapper.toPersistence(questao);

    expect(entity).toBeInstanceOf(QuestaoOrmEntity);
    expect(entity.id).toBe(questao.id);
    expect(entity.provaId).toBe(questao.provaId);
    expect(entity.tipo).toBe(TipoQuestaoValor.MULTIPLA_ESCOLHA);
    expect(entity.status).toBe(StatusQuestaoValor.PUBLICADA);
    expect(entity.alternativas).toHaveLength(1);
    expect(entity.alternativas[0]).toBeInstanceOf(AlternativaOrmEntity);
    expect(entity.alternativas[0].questaoId).toBe(questao.id);
    expect(entity.gabaritoTipo).toBe(TipoGabaritoValor.ALTERNATIVAS);
    expect(entity.gabaritoValores).toEqual(['A']);
  });
});
