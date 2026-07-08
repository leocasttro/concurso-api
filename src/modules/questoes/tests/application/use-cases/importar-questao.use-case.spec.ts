import { ImportarQuestaoUseCase } from '../../../application/use-cases/importar-questao.use-case';
import { Questao } from '../../../domain/entities/questao.entity';
import type { QuestaoRepository } from '../../../domain/repositories/questao.repository';
import { Gabarito } from '../../../domain/value-objects/gabarito.vo';
import { StatusQuestaoValor } from '../../../domain/value-objects/status-questao.vo';
import { TipoQuestaoValor } from '../../../domain/value-objects/tipo-questao.vo';

describe('ImportarQuestaoUseCase', () => {
  let useCase: ImportarQuestaoUseCase;
  let questaoRepository: QuestaoRepository;
  let salvarMock: jest.MockedFunction<QuestaoRepository['salvar']>;

  beforeEach(() => {
    salvarMock = jest.fn();

    questaoRepository = {
      salvar: salvarMock,
      listarPorProvaId: jest.fn(),
      buscarPorId: jest.fn(),
    };

    useCase = new ImportarQuestaoUseCase(questaoRepository);
  });

  it('deve importar uma questão completa como IMPORTADA', async () => {
    const input = {
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
      textoApoio: 'Texto de apoio',
    };

    salvarMock.mockImplementation((questao) => Promise.resolve(questao));

    const resultado = await useCase.execute(input);

    expect(resultado).toBeInstanceOf(Questao);
    expect(resultado.provaId).toBe('prova-1');
    expect(resultado.numero).toBe(1);
    expect(resultado.enunciado).toBe(
      'Qual é o princípio básico da administração pública?',
    );
    expect(resultado.tipo.valor).toBe(TipoQuestaoValor.MULTIPLA_ESCOLHA);
    expect(resultado.status.valor).toBe(StatusQuestaoValor.IMPORTADA);
    expect(resultado.alternativas).toHaveLength(2);
    expect(resultado.gabarito?.valores).toEqual(['A']);
    expect(resultado.disciplina).toBe('Direito Administrativo');
    expect(resultado.assunto).toBe('Princípios');
    expect(resultado.textoApoio).toBe('Texto de apoio');

    expect(salvarMock).toHaveBeenCalledTimes(1);
    expect(salvarMock).toHaveBeenCalledWith(resultado);
  });

  it('deve importar uma questão incompleta como PENDENTE_REVISAO', async () => {
    const input = {
      provaId: 'prova-1',
      numero: 2,
      enunciado: 'Questão importada sem gabarito',
      tipo: TipoQuestaoValor.MULTIPLA_ESCOLHA,
      alternativas: [
        { letra: 'A', texto: 'Alternativa A' },
        { letra: 'B', texto: 'Alternativa B' },
      ],
    };

    salvarMock.mockImplementation((questao) => Promise.resolve(questao));

    const resultado = await useCase.execute(input);

    expect(resultado).toBeInstanceOf(Questao);
    expect(resultado.status.valor).toBe(StatusQuestaoValor.PENDENTE_REVISAO);
    expect(resultado.gabarito).toBeUndefined();

    expect(salvarMock).toHaveBeenCalledTimes(1);
    expect(salvarMock).toHaveBeenCalledWith(resultado);
  });

  it('deve importar questão objetiva com poucas alternativas como PENDENTE_REVISAO', async () => {
    const input = {
      provaId: 'prova-1',
      numero: 3,
      enunciado: 'Questão com alternativas incompletas',
      tipo: TipoQuestaoValor.MULTIPLA_ESCOLHA,
      alternativas: [{ letra: 'A', texto: 'Alternativa A' }],
      gabarito: Gabarito.alternativas(['A']),
    };

    salvarMock.mockImplementation((questao) => Promise.resolve(questao));

    const resultado = await useCase.execute(input);

    expect(resultado).toBeInstanceOf(Questao);
    expect(resultado.status.valor).toBe(StatusQuestaoValor.PENDENTE_REVISAO);

    expect(salvarMock).toHaveBeenCalledTimes(1);
    expect(salvarMock).toHaveBeenCalledWith(resultado);
  });
});
