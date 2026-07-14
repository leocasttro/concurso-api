import { Questao } from '../../domain/entities/questao.entity';
import { TipoQuestaoValor } from '../../domain/value-objects/tipo-questao.vo';
import { StatusQuestaoValor } from '../../domain/value-objects/status-questao.vo';
import { Alternativa } from '../../domain/entities/alternativa.entity';
import {
  Gabarito,
  TipoGabaritoValor,
} from '../../domain/value-objects/gabarito.vo';
import { QuestaoPresenter } from '../../presentation/presenters/questao.presenter';

describe('QuestaoPresenter', () => {
  it('deve converter uma questão para resposta HTTP', () => {
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

    const resultado = QuestaoPresenter.toHTTP(questao);

    expect(resultado).toEqual({
      id: '550e8400-e29b-41d4-a716-446655440000',
      provaId: '550e8400-e29b-41d4-a716-446655440999',
      numero: 1,
      enunciado: 'Qual alternativa está correta?',
      tipo: TipoQuestaoValor.MULTIPLA_ESCOLHA,
      status: StatusQuestaoValor.PUBLICADA,
      alternativas: [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          texto: 'Alternativa A',
          letra: 'A',
        },
      ],
      gabarito: {
        tipo: TipoGabaritoValor.ALTERNATIVAS,
        valores: ['A'],
      },
      disciplina: 'Português',
      assunto: 'Interpretação de texto',
      textoApoio: 'Texto de apoio',
      createdAt,
      updatedAt,
    });
  });

  it('deve retornar gabarito undefined quando a questão não possuir gabarito', () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');

    const questao = Questao.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      provaId: '550e8400-e29b-41d4-a716-446655440999',
      numero: 1,
      enunciado: 'Questão pendente de revisão',
      tipo: TipoQuestaoValor.MULTIPLA_ESCOLHA,
      status: StatusQuestaoValor.PENDENTE_REVISAO,
      alternativas: [],
      createdAt,
    });

    const resultado = QuestaoPresenter.toHTTP(questao);

    expect(resultado.gabarito).toBeUndefined();
    expect(resultado.alternativas).toEqual([]);
    expect(resultado.status).toBe(StatusQuestaoValor.PENDENTE_REVISAO);
  });
});
