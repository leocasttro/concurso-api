import { CriarProvaUseCase } from '../../../application/use-cases/criar-prova.use-case';
import { ProvaRepository } from '../../../domain/repositories/prova.repository';
import { Prova } from '../../../domain/entities/prova.entity';
import { StatusProvaValor } from '../../../domain/value-objects/status-prova.vo';

describe('CriarProvaUseCase', () => {
  let useCase: CriarProvaUseCase;
  let provaRepository: ProvaRepository;
  let salvarMock: jest.MockedFunction<ProvaRepository['salvar']>;

  beforeEach(() => {
    salvarMock = jest.fn();

    provaRepository = {
      salvar: salvarMock,
      listar: jest.fn(),
      buscarPorId: jest.fn(),
      remover: jest.fn(),
    };

    useCase = new CriarProvaUseCase(provaRepository);
  });

  it('deve criar uma nova prova', async () => {
    const input = {
      titulo: 'Prova PF',
      cargo: 'Agente',
      banca: 'CEBRASPE',
      ano: 2024,
    };

    salvarMock.mockImplementation((prova) => Promise.resolve(prova));

    const resultado = await useCase.execute(input);

    expect(resultado).toBeInstanceOf(Prova);
    expect(resultado.titulo).toBe('Prova PF');
    expect(resultado.cargo).toBe('Agente');
    expect(resultado.banca.valor).toBe('CEBRASPE');
    expect(resultado.status.valor).toBe(StatusProvaValor.RASCUNHO);
    expect(resultado.ano.valor).toBe(2024);
    expect(salvarMock).toHaveBeenCalledTimes(1);
    expect(salvarMock).toHaveBeenCalledWith(resultado);
  });
});
