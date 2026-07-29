import { QuestaoImportada } from '../../../domain/entities/questao-importada.entity';
import { ImportacaoException } from '../../../domain/exceptions/importacao.exception';
import { TipoQuestaoValor } from '../../../../questoes/domain/value-objects/tipo-questao.vo';

describe('QuestaoImportada', () => {
  it('deve criar uma questão importada com dados válidos', () => {
    const questao = QuestaoImportada.criar({
      numero: 1,
      enunciado: ' Qual alternativa está correta? ',
      tipoSugerido: TipoQuestaoValor.MULTIPLA_ESCOLHA,
      alternativas: [
        { texto: 'Alternativa A', letra: 'A' },
        { texto: 'Alternativa B', letra: 'B' },
      ],
      gabarito: {
        tipo: 'ALTERNATIVAS',
        valores: ['A'],
      },
      disciplina: ' Português ',
      assunto: ' Interpretação ',
      textoApoio: ' Texto de apoio ',
      confianca: 0.95,
      precisaRevisao: false,
    });

    expect(questao.id).toBeDefined();
    expect(questao.numero).toBe(1);
    expect(questao.enunciado).toBe('Qual alternativa está correta?');
    expect(questao.tipoSugerido).toBe(TipoQuestaoValor.MULTIPLA_ESCOLHA);
    expect(questao.alternativas).toHaveLength(2);
    expect(questao.gabarito).toEqual({
      tipo: 'ALTERNATIVAS',
      valores: ['A'],
    });
    expect(questao.disciplina).toBe('Português');
    expect(questao.assunto).toBe('Interpretação');
    expect(questao.textoApoio).toBe('Texto de apoio');
    expect(questao.confianca).toBe(0.95);
    expect(questao.precisaRevisao).toBe(false);
  });

  it('deve marcar como precisa revisão quando confiança for menor que 0.8', () => {
    const questao = QuestaoImportada.criar({
      numero: 2,
      enunciado: 'Questão com baixa confiança',
      tipoSugerido: TipoQuestaoValor.CERTO_ERRADO,
      confianca: 0.5,
    });

    expect(questao.precisaRevisao).toBe(true);
  });

  it('deve respeitar precisaRevisao informado explicitamente', () => {
    const questao = QuestaoImportada.criar({
      numero: 3,
      enunciado: 'Questão conferida manualmente',
      tipoSugerido: TipoQuestaoValor.CERTO_ERRADO,
      confianca: 0.5,
      precisaRevisao: false,
    });

    expect(questao.precisaRevisao).toBe(false);
  });

  it('deve usar confiança zero quando não for informada', () => {
    const questao = QuestaoImportada.criar({
      enunciado: 'Questão sem confiança informada',
    });

    expect(questao.confianca).toBe(0);
    expect(questao.precisaRevisao).toBe(true);
  });

  it('deve impedir criação sem enunciado', () => {
    expect(() =>
      QuestaoImportada.criar({
        enunciado: '',
      }),
    ).toThrow(ImportacaoException);
  });

  it('deve reconstituir uma questão importada existente', () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    const updatedAt = new Date('2024-01-02T00:00:00.000Z');

    const questao = QuestaoImportada.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      numero: 10,
      enunciado: 'Questão reconstituída',
      tipoSugerido: TipoQuestaoValor.DISCURSIVA,
      alternativas: [],
      gabarito: {
        tipo: 'DISCURSIVO',
        valores: ['Resposta esperada'],
      },
      disciplina: 'Direito Administrativo',
      assunto: 'Atos administrativos',
      textoApoio: 'Texto base',
      confianca: 0.9,
      precisaRevisao: false,
      createdAt,
      updatedAt,
    });

    expect(questao.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(questao.numero).toBe(10);
    expect(questao.enunciado).toBe('Questão reconstituída');
    expect(questao.tipoSugerido).toBe(TipoQuestaoValor.DISCURSIVA);
    expect(questao.gabarito).toEqual({
      tipo: 'DISCURSIVO',
      valores: ['Resposta esperada'],
    });
    expect(questao.createdAt).toBe(createdAt);
    expect(questao.updatedAt).toBe(updatedAt);
  });
});
