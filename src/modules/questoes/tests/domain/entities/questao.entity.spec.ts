import { Questao } from '../../../domain/entities/questao.entity';
import { QuestaoException } from '../../../domain/exceptions/questao.exception';
import { Gabarito } from '../../../domain/value-objects/gabarito.vo';
import { StatusQuestaoValor } from '../../../domain/value-objects/status-questao.vo';
import { TipoQuestaoValor } from '../../../domain/value-objects/tipo-questao.vo';

describe('Questao', () => {
  it('deve importar uma questão completa como IMPORTADA', () => {
    const questao = Questao.importar({
      provaId: 'prova-1',
      numero: 1,
      enunciado: 'Qual é o princípio básico da administração pública?',
      tipo: TipoQuestaoValor.MULTIPLA_ESCOLHA,
      alternativas: [
        { letra: 'A', texto: 'Legalidade' },
        { letra: 'B', texto: 'Aleatoriedade' },
      ],
      gabarito: Gabarito.alternativas(['A']),
      disciplina: 'Direito Administrativo',
      assunto: 'Princípios',
      textoApoio: 'Texto de apoio da questão',
    });

    expect(questao.id).toBeDefined();
    expect(questao.provaId).toBe('prova-1');
    expect(questao.numero).toBe(1);
    expect(questao.enunciado).toBe(
      'Qual é o princípio básico da administração pública?',
    );
    expect(questao.tipo.valor).toBe(TipoQuestaoValor.MULTIPLA_ESCOLHA);
    expect(questao.status.valor).toBe(StatusQuestaoValor.IMPORTADA);
    expect(questao.alternativas).toHaveLength(2);
    expect(questao.gabarito?.valores).toEqual(['A']);
    expect(questao.disciplina).toBe('Direito Administrativo');
    expect(questao.assunto).toBe('Princípios');
    expect(questao.textoApoio).toBe('Texto de apoio da questão');
  });

  it('deve importar questão sem gabarito como PENDENTE_REVISAO', () => {
    const questao = Questao.importar({
      provaId: 'prova-1',
      numero: 2,
      enunciado: 'Questão importada sem gabarito',
      tipo: TipoQuestaoValor.MULTIPLA_ESCOLHA,
      alternativas: [
        { letra: 'A', texto: 'Alternativa A' },
        { letra: 'B', texto: 'Alternativa B' },
      ],
    });

    expect(questao.status.valor).toBe(StatusQuestaoValor.PENDENTE_REVISAO);
    expect(questao.gabarito).toBeUndefined();
  });

  it('deve importar questão objetiva com poucas alternativas como PENDENTE_REVISAO', () => {
    const questao = Questao.importar({
      provaId: 'prova-1',
      numero: 3,
      enunciado: 'Questão com alternativas incompletas',
      tipo: TipoQuestaoValor.MULTIPLA_ESCOLHA,
      alternativas: [{ letra: 'A', texto: 'Alternativa A' }],
      gabarito: Gabarito.alternativas(['A']),
    });

    expect(questao.status.valor).toBe(StatusQuestaoValor.PENDENTE_REVISAO);
  });

  it('deve criar questão manual como RASCUNHO', () => {
    const questao = Questao.criarManual({
      provaId: 'prova-1',
      enunciado: 'Questão manual',
      tipo: TipoQuestaoValor.DISCURSIVA,
    });

    expect(questao.id).toBeDefined();
    expect(questao.status.valor).toBe(StatusQuestaoValor.RASCUNHO);
    expect(questao.tipo.valor).toBe(TipoQuestaoValor.DISCURSIVA);
  });

  it('deve publicar uma questão objetiva válida', () => {
    const questao = Questao.criarManual({
      provaId: 'prova-1',
      enunciado: 'Questão pronta para publicação',
      tipo: TipoQuestaoValor.MULTIPLA_ESCOLHA,
      alternativas: [
        { letra: 'A', texto: 'Alternativa A' },
        { letra: 'B', texto: 'Alternativa B' },
      ],
      gabarito: Gabarito.alternativas(['A']),
    });

    questao.publicar();

    expect(questao.status.valor).toBe(StatusQuestaoValor.PUBLICADA);
  });

  it('deve impedir publicar questão sem gabarito', () => {
    const questao = Questao.criarManual({
      provaId: 'prova-1',
      enunciado: 'Questão sem gabarito',
      tipo: TipoQuestaoValor.MULTIPLA_ESCOLHA,
      alternativas: [
        { letra: 'A', texto: 'Alternativa A' },
        { letra: 'B', texto: 'Alternativa B' },
      ],
    });

    expect(() => questao.publicar()).toThrow(QuestaoException);
  });

  it('deve impedir publicar múltipla escolha com mais de um gabarito', () => {
    const questao = Questao.criarManual({
      provaId: 'prova-1',
      enunciado: 'Questão com gabarito inválido',
      tipo: TipoQuestaoValor.MULTIPLA_ESCOLHA,
      alternativas: [
        { letra: 'A', texto: 'Alternativa A' },
        { letra: 'B', texto: 'Alternativa B' },
      ],
      gabarito: Gabarito.alternativas(['A', 'B']),
    });

    expect(() => questao.publicar()).toThrow(QuestaoException);
  });

  it('deve publicar questão de múltiplas corretas com mais de um gabarito', () => {
    const questao = Questao.criarManual({
      provaId: 'prova-1',
      enunciado: 'Questão de múltiplas corretas',
      tipo: TipoQuestaoValor.MULTIPLAS_CORRETAS,
      alternativas: [
        { letra: 'A', texto: 'Alternativa A' },
        { letra: 'B', texto: 'Alternativa B' },
        { letra: 'C', texto: 'Alternativa C' },
      ],
      gabarito: Gabarito.alternativas(['A', 'C']),
    });

    questao.publicar();

    expect(questao.status.valor).toBe(StatusQuestaoValor.PUBLICADA);
  });

  it('deve anular uma questão', () => {
    const questao = Questao.criarManual({
      provaId: 'prova-1',
      enunciado: 'Questão a ser anulada',
      tipo: TipoQuestaoValor.DISCURSIVA,
      gabarito: Gabarito.discursivo('Resposta esperada'),
    });

    questao.anular();

    expect(questao.status.valor).toBe(StatusQuestaoValor.ANULADA);
  });

  it('deve lançar QuestaoException quando provaId for vazio', () => {
    expect(() =>
      Questao.importar({
        provaId: '',
        enunciado: 'Enunciado',
        tipo: TipoQuestaoValor.DISCURSIVA,
      }),
    ).toThrow(QuestaoException);
  });

  it('deve lançar QuestaoException quando enunciado for vazio', () => {
    expect(() =>
      Questao.importar({
        provaId: 'prova-1',
        enunciado: '',
        tipo: TipoQuestaoValor.DISCURSIVA,
      }),
    ).toThrow(QuestaoException);
  });
});
