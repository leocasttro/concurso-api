import { CriarQuestaoUseCase } from '../../../application/use-cases/criar-questao.use-case';
import { QuestaoRepository } from '../../../domain/repositories/questao.repository';
import { TipoQuestaoValor } from '../../../domain/value-objects/tipo-questao.vo';
import { Gabarito } from '../../../domain/value-objects/gabarito.vo';
import { Questao } from '../../../domain/entities/questao.entity';
import { StatusQuestaoValor } from '../../../domain/value-objects/status-questao.vo';

describe('CriarQuestaoUseCase', () => {
  let useCase: CriarQuestaoUseCase;
  let questaoRepository: QuestaoRepository;
  let salvarMock: jest.MockedFunction<QuestaoRepository['salvar']>;

  beforeEach(() => {
    salvarMock = jest.fn();

    questaoRepository = {
      salvar: salvarMock,
      listarPorProvaId: jest.fn(),
      buscarPorId: jest.fn(),
    };

    useCase = new CriarQuestaoUseCase(questaoRepository);
  });

  it('deve criar uma questão manual', async () => {
    const input = {
      provaId: 'prova-1',
      numero: 1,
      enunciado: 'Qual é o princício básico da administração pública?',
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
      'Qual é o princício básico da administração pública?',
    );
    expect(resultado.tipo.valor).toBe(TipoQuestaoValor.MULTIPLA_ESCOLHA);
    expect(resultado.status.valor).toBe(StatusQuestaoValor.RASCUNHO);
    expect(resultado.alternativas).toHaveLength(2);
    expect(resultado.gabarito?.valores).toEqual(['A']);
    expect(resultado.disciplina).toBe('Direito Administrativo');
    expect(resultado.assunto).toBe('Princípios');
    expect(resultado.textoApoio).toBe('Texto de apoio');

    expect(salvarMock).toHaveBeenCalledTimes(1);
    expect(salvarMock).toHaveBeenCalledWith(resultado);
  });
});
