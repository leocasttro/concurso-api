import { AtualizarQuestaoUseCase } from '../../../application/use-cases/atualizar-questao.use-case';
import { QuestaoRepository } from '../../../domain/repositories/questao.repository';
import { Questao } from '../../../domain/entities/questao.entity';
import { TipoQuestaoValor } from '../../../domain/value-objects/tipo-questao.vo';
import { StatusQuestaoValor } from '../../../domain/value-objects/status-questao.vo';
import {
  Gabarito,
  GabaritoCertoErradoValor,
} from '../../../domain/value-objects/gabarito.vo';
import { QuestaoNaoEncontradaException } from '../../../domain/exceptions/questao-nao-encontrada.exception';

describe('AtualizarQuestaoUseCase', () => {
  let useCase: AtualizarQuestaoUseCase;
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

    useCase = new AtualizarQuestaoUseCase(questaoRepository);
  });

  it('deve atualizar uma questão existente', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';

    const questao = Questao.reconstituir({
      id,
      provaId: '550e8400-e29b-41d4-a716-446655440999',
      numero: 1,
      enunciado: 'Enunciado antigo',
      tipo: TipoQuestaoValor.CERTO_ERRADO,
      status: StatusQuestaoValor.PENDENTE_REVISAO,
      alternativas: [],
      createdAt: new Date(),
    });

    const input = {
      id,
      numero: 2,
      enunciado: ' Enunciado atualizado ',
      tipo: TipoQuestaoValor.CERTO_ERRADO,
      alternativas: [
        { texto: 'Certo', letra: 'C' },
        { texto: 'Errado', letra: 'E' },
      ],
      gabarito: Gabarito.certoErrado(GabaritoCertoErradoValor.CERTO),
      disciplina: ' Direito Constitucional ',
      assunto: ' Constituição ',
      textoApoio: ' Texto de apoio ',
    };

    buscarPorIdMock.mockResolvedValue(questao);
    salvarMock.mockImplementation((questaoAtualizada) =>
      Promise.resolve(questaoAtualizada),
    );

    const resultado = await useCase.execute(input);

    expect(buscarPorIdMock).toHaveBeenCalledWith(id);
    expect(salvarMock).toHaveBeenCalledTimes(1);
    expect(salvarMock).toHaveBeenCalledWith(resultado);

    expect(resultado).toBeInstanceOf(Questao);
    expect(resultado.id).toBe(id);
    expect(resultado.numero).toBe(2);
    expect(resultado.enunciado).toBe('Enunciado atualizado');
    expect(resultado.tipo.valor).toBe(TipoQuestaoValor.CERTO_ERRADO);
    expect(resultado.status.valor).toBe(StatusQuestaoValor.PENDENTE_REVISAO);
    expect(resultado.alternativas).toHaveLength(2);
    expect(resultado.alternativas[0].texto).toBe('Certo');
    expect(resultado.alternativas[0].letra).toBe('C');
    expect(resultado.gabarito?.valores).toEqual([
      GabaritoCertoErradoValor.CERTO,
    ]);
    expect(resultado.disciplina).toBe('Direito Constitucional');
    expect(resultado.assunto).toBe('Constituição');
    expect(resultado.textoApoio).toBe('Texto de apoio');
  });

  it('deve lançar QuestaoNaoEncontradaException quando a questão não existir', async () => {
    const input = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      numero: 1,
      enunciado: 'Enunciado atualizado',
      tipo: TipoQuestaoValor.CERTO_ERRADO,
    };

    buscarPorIdMock.mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(
      QuestaoNaoEncontradaException,
    );

    expect(buscarPorIdMock).toHaveBeenCalledWith(input.id);
    expect(salvarMock).not.toHaveBeenCalled();
  });
});
