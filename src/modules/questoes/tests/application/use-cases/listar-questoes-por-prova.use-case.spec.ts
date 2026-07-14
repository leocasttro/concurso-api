import { ListarQuestoesPorProvaUseCase } from '../../../application/use-cases/listar-questoes-por-prova.use-case';
import type { QuestaoRepository } from '../../../domain/repositories/questao.repository';
import { Questao } from '../../../domain/entities/questao.entity';
import { TipoQuestaoValor } from '../../../domain/value-objects/tipo-questao.vo';
import { Gabarito } from '../../../domain/value-objects/gabarito.vo';
import { QuestaoException } from '../../../domain/exceptions/questao.exception';

describe('ListarQuestoesPorProvaUseCase', () => {
  let useCase: ListarQuestoesPorProvaUseCase;
  let questaoRepository: QuestaoRepository;
  let listarPorProvaIdMock: jest.MockedFunction<
    QuestaoRepository['listarPorProvaId']
  >;

  beforeEach(() => {
    listarPorProvaIdMock = jest.fn();

    questaoRepository = {
      salvar: jest.fn(),
      listarPorProvaId: listarPorProvaIdMock,
      buscarPorId: jest.fn(),
    };

    useCase = new ListarQuestoesPorProvaUseCase(questaoRepository);
  });

  it('deve listar questões de uma prova', async () => {
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

    listarPorProvaIdMock.mockResolvedValue([questao]);

    const resultado = await useCase.execute({
      provaId: 'prova-1',
    });

    expect(resultado).toEqual([questao]);
    expect(listarPorProvaIdMock).toHaveBeenCalledWith('prova-1');
    expect(listarPorProvaIdMock).toHaveBeenCalledTimes(1);
  });

  it('deve retornar lista vazia quando a prova não tiver questões', async () => {
    listarPorProvaIdMock.mockResolvedValue([]);

    const resultado = await useCase.execute({
      provaId: 'prova-1',
    });

    expect(resultado).toEqual([]);
    expect(listarPorProvaIdMock).toHaveBeenCalledWith('prova-1');
  });

  it('deve lançar QuestaoException quando provaId for vazio', async () => {
    await expect(
      useCase.execute({
        provaId: '',
      }),
    ).rejects.toBeInstanceOf(QuestaoException);

    expect(listarPorProvaIdMock).not.toHaveBeenCalled();
  });
});
