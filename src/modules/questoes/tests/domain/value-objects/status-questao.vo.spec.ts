import {
  StatusQuestao,
  StatusQuestaoValor,
} from '../../../domain/value-objects/status-questao.vo';
import { QuestaoException } from '../../../domain/exceptions/questao.exception';

describe('StatusQuestao', () => {
  it('deve criar status Rascuho', () => {
    const status = StatusQuestao.rascunho();

    expect(status.valor).toBe(StatusQuestaoValor.RASCUNHO);
  });

  it('deve criar um status IMPORTADA', () => {
    const status = StatusQuestao.importada();

    expect(status.valor).toBe(StatusQuestaoValor.IMPORTADA);
  });

  it('deve criar um status PENDENTE_REVISAO', () => {
    const status = StatusQuestao.pendenteRevisao();

    expect(status.valor).toBe(StatusQuestaoValor.PENDENTE_REVISAO);
  });

  it('dever criar status a partir de um valor válido', () => {
    const status = StatusQuestao.criar(StatusQuestaoValor.PUBLICADA);

    expect(status.valor).toBe(StatusQuestaoValor.PUBLICADA);
  });

  it('deve lançar QuestaoException quando o status for inválido', () => {
    expect(() => StatusQuestao.criar('INVALIDO' as StatusQuestaoValor)).toThrow(
      QuestaoException,
    );
  });
});
