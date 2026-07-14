import {
  TipoQuestao,
  TipoQuestaoValor,
} from '../../../domain/value-objects/tipo-questao.vo';
import { QuestaoException } from '../../../domain/exceptions/questao.exception';

describe('TipoQuestao', () => {
  it('deve criar tipo MULTIPLA_ESCOLHA', () => {
    const tipo = TipoQuestao.criar(TipoQuestaoValor.MULTIPLA_ESCOLHA);

    expect(tipo.valor).toBe(TipoQuestaoValor.MULTIPLA_ESCOLHA);
  });

  it('deve criar tipo MULTIPLAS_CORRETAS', () => {
    const tipo = TipoQuestao.criar(TipoQuestaoValor.MULTIPLAS_CORRETAS);

    expect(tipo.valor).toBe(TipoQuestaoValor.MULTIPLAS_CORRETAS);
  });

  it('deve criar tipo CERTO_ERRADO', () => {
    const tipo = TipoQuestao.criar(TipoQuestaoValor.CERTO_ERRADO);

    expect(tipo.valor).toBe(TipoQuestaoValor.CERTO_ERRADO);
  });

  it('deve criar tipo DISCURSIVA', () => {
    const tipo = TipoQuestao.criar(TipoQuestaoValor.DISCURSIVA);

    expect(tipo.valor).toBe(TipoQuestaoValor.DISCURSIVA);
  });

  it('deve criar tipo padrão de múltipla escolha', () => {
    const tipo = TipoQuestao.multiplaEscolha();

    expect(tipo.valor).toBe(TipoQuestaoValor.MULTIPLA_ESCOLHA);
  });

  it('deve lançar QuestaoException quando o tipo for inválido', () => {
    expect(() => TipoQuestao.criar('INVALIDO' as TipoQuestaoValor)).toThrow(
      QuestaoException,
    );
  });
});
