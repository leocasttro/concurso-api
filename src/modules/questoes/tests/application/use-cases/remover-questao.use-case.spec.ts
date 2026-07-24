import { RemoverQuestaoUseCase } from '../../../application/use-cases/remover-questao.use-case';
import { Questao } from '../../../domain/entities/questao.entity';
import { QuestaoNaoEncontradaException } from '../../../domain/exceptions/questao-nao-encontrada.exception';
import type { QuestaoRepository } from '../../../domain/repositories/questao.repository';
import { StatusQuestaoValor } from '../../../domain/value-objects/status-questao.vo';
import { TipoQuestaoValor } from '../../../domain/value-objects/tipo-questao.vo';

describe('RemoverQuestaoUseCase', () => {
  let useCase: RemoverQuestaoUseCase;
  let questaoRepository: QuestaoRepository;
  let buscarPorIdMock: jest.MockedFunction<QuestaoRepository['buscarPorId']>;
  let removerMock: jest.MockedFunction<QuestaoRepository['remover']>;

  beforeEach(() => {
    buscarPorIdMock = jest.fn();
    removerMock = jest.fn();

    questaoRepository = {
      salvar: jest.fn(),
      listarPorProvaId: jest.fn(),
      buscarPorId: buscarPorIdMock,
      remover: removerMock,
    };

    useCase = new RemoverQuestaoUseCase(questaoRepository);
  });

  it('deve remover uma questão existente', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';

    const questao = Questao.reconstituir({
      id,
      provaId: '550e8400-e29b-41d4-a716-446655440999',
      numero: 1,
      enunciado: 'Questão para remover',
      tipo: TipoQuestaoValor.CERTO_ERRADO,
      status: StatusQuestaoValor.PENDENTE_REVISAO,
      alternativas: [],
      createdAt: new Date(),
    });

    buscarPorIdMock.mockResolvedValue(questao);
    removerMock.mockResolvedValue();

    await useCase.execute({ id });

    expect(buscarPorIdMock).toHaveBeenCalledWith(id);
    expect(removerMock).toHaveBeenCalledWith(id);
    expect(removerMock).toHaveBeenCalledTimes(1);
  });

  it('deve lançar QuestaoNaoEncontradaException quando a questão não existir', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';

    buscarPorIdMock.mockResolvedValue(null);

    await expect(useCase.execute({ id })).rejects.toBeInstanceOf(
      QuestaoNaoEncontradaException,
    );

    expect(buscarPorIdMock).toHaveBeenCalledWith(id);
    expect(removerMock).not.toHaveBeenCalled();
  });
});
