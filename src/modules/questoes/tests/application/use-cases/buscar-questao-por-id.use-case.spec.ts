import { BuscarQuestaoPorIdUseCase } from '../../../application/use-cases/buscar-questao-por-id.use-case';
import { Questao } from '../../../domain/entities/questao.entity';
import { QuestaoNaoEncontradaException } from '../../../domain/exceptions/questao-nao-encontrada.exception';
import type { QuestaoRepository } from '../../../domain/repositories/questao.repository';
import { Gabarito } from '../../../domain/value-objects/gabarito.vo';
import { TipoQuestaoValor } from '../../../domain/value-objects/tipo-questao.vo';

describe('BuscarQuestaoPorIdUseCase', () => {
  let useCase: BuscarQuestaoPorIdUseCase;
  let questaoRepository: QuestaoRepository;
  let buscarPorIdMock: jest.MockedFunction<QuestaoRepository['buscarPorId']>;

  beforeEach(() => {
    buscarPorIdMock = jest.fn();

    questaoRepository = {
      salvar: jest.fn(),
      listarPorProvaId: jest.fn(),
      buscarPorId: buscarPorIdMock,
    };

    useCase = new BuscarQuestaoPorIdUseCase(questaoRepository);
  });

  it('deve retornar uma questão quando ela existir', async () => {
    const questao = Questao.criarManual({
      provaId: 'prova-1',
      numero: 1,
      enunciado: 'Questão 1',
      tipo: TipoQuestaoValor.MULTIPLA_ESCOLHA,
      alternativas: [
        { letra: 'A', texto: 'Alternativa A' },
        { letra: 'B', texto: 'Alternativa B' },
      ],
      gabarito: Gabarito.alternativas(['A']),
    });

    buscarPorIdMock.mockResolvedValue(questao);

    const resultado = await useCase.execute({
      id: questao.id,
    });

    expect(resultado).toBe(questao);
    expect(buscarPorIdMock).toHaveBeenCalledWith(questao.id);
  });

  it('deve lançar QuestaoNaoEncontradaException quando a questão não existir', async () => {
    buscarPorIdMock.mockResolvedValue(null);

    await expect(
      useCase.execute({
        id: 'questao-inexistente',
      }),
    ).rejects.toBeInstanceOf(QuestaoNaoEncontradaException);

    expect(buscarPorIdMock).toHaveBeenCalledWith('questao-inexistente');
  });
});
