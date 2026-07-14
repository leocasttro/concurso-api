import { PublicarQuestaoUseCase } from '../../../application/use-cases/publicar-questao.use-case';
import { Questao } from '../../../domain/entities/questao.entity';
import { QuestaoNaoEncontradaException } from '../../../domain/exceptions/questao-nao-encontrada.exception';
import type { QuestaoRepository } from '../../../domain/repositories/questao.repository';
import { Gabarito } from '../../../domain/value-objects/gabarito.vo';
import { StatusQuestaoValor } from '../../../domain/value-objects/status-questao.vo';
import { TipoQuestaoValor } from '../../../domain/value-objects/tipo-questao.vo';

describe('PublicarQuestaoUseCase', () => {
  let useCase: PublicarQuestaoUseCase;
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

    useCase = new PublicarQuestaoUseCase(questaoRepository);
  });

  it('deve publicar uma questão válida', async () => {
    const questao = Questao.criarManual({
      provaId: 'prova-1',
      enunciado: 'Questão válida',
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

    expect(resultado.status.valor).toBe(StatusQuestaoValor.PUBLICADA);
    expect(buscarPorIdMock).toHaveBeenCalledWith(questao.id);
    expect(salvarMock).toHaveBeenCalledWith(questao);
  });

  it('deve lançar QuestaoNaoEncontradaException quando a questão não existir', async () => {
    buscarPorIdMock.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'questao-1' })).rejects.toBeInstanceOf(
      QuestaoNaoEncontradaException,
    );

    expect(salvarMock).not.toHaveBeenCalled();
  });
});
