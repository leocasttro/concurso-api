import { AnularQuestaoUseCase } from '../../../application/use-cases/anular-questao.use-case';
import type { QuestaoRepository } from '../../../domain/repositories/questao.repository';
import { Questao } from '../../../domain/entities/questao.entity';
import { TipoQuestaoValor } from '../../../domain/value-objects/tipo-questao.vo';
import { Gabarito } from '../../../domain/value-objects/gabarito.vo';
import { StatusQuestaoValor } from '../../../domain/value-objects/status-questao.vo';
import { QuestaoNaoEncontradaException } from '../../../domain/exceptions/questao-nao-encontrada.exception';

describe('AnularQuestaoUseCase', () => {
  let useCase: AnularQuestaoUseCase;
  let questaoRepository: QuestaoRepository;
  let buscarPorIdMock: jest.MockedFunction<QuestaoRepository['buscarPorId']>;
  let salvarMock: jest.MockedFunction<QuestaoRepository['salvar']>;

  beforeEach(() => {
    buscarPorIdMock = jest.fn();
    salvarMock = jest.fn();

    questaoRepository = {
      salvar: salvarMock,
      listarPorProvaId: jest.fn(),
      buscarPorId: buscarPorIdMock,
    };

    useCase = new AnularQuestaoUseCase(questaoRepository);
  });

  it('deve anular questão existente', async () => {
    const questao = Questao.criarManual({
      provaId: 'prova-1',
      enunciado: 'Questão que será anulada',
      tipo: TipoQuestaoValor.MULTIPLA_ESCOLHA,
      alternativas: [
        { letra: 'A', texto: 'Alternativa A' },
        { letra: 'B', texto: 'Alternativa B' },
      ],
      gabarito: Gabarito.alternativas(['A']),
    });

    buscarPorIdMock.mockResolvedValue(questao);
    salvarMock.mockImplementation((questaoSalva) =>
      Promise.resolve(questaoSalva),
    );

    const resultado = await useCase.execute({ id: questao.id });

    expect(resultado.status.valor).toBe(StatusQuestaoValor.ANULADA);
    expect(buscarPorIdMock).toHaveBeenCalledWith(questao.id);
    expect(salvarMock).toHaveBeenCalledWith(questao);
    expect(salvarMock).toHaveBeenCalledTimes(1);
  });

  it('deve lançar QuestaoNaoEncontradaException quando a questão não existir', async () => {
    buscarPorIdMock.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'questao-1' })).rejects.toBeInstanceOf(
      QuestaoNaoEncontradaException,
    );

    expect(buscarPorIdMock).toHaveBeenCalledWith('questao-1');
    expect(salvarMock).not.toHaveBeenCalled();
  });
});
