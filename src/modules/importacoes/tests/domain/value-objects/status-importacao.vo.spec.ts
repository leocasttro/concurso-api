import { BusinessException } from '../../../../../shared/domain/exceptions/business.exception';
import {
  StatusImportacao,
  StatusImportacaoValor,
} from '../../../domain/value-objects/status-importacao.vo';

describe('StatusImportacao', () => {
  it('deve criar status PENDENTE', () => {
    const status = StatusImportacao.pendente();

    expect(status.valor).toBe(StatusImportacaoValor.PENDENTE);
  });

  it('deve criar status PROCESSANDO', () => {
    const status = StatusImportacao.processando();

    expect(status.valor).toBe(StatusImportacaoValor.PROCESSANDO);
  });

  it('deve criar status AGUARDANDO_REVISAO', () => {
    const status = StatusImportacao.aguardandoRevisao();

    expect(status.valor).toBe(StatusImportacaoValor.AGUARDANDO_REVISAO);
  });

  it('deve criar status CONCLUIDA', () => {
    const status = StatusImportacao.concluida();

    expect(status.valor).toBe(StatusImportacaoValor.CONCLUIDA);
  });

  it('deve criar status FALHOU', () => {
    const status = StatusImportacao.falhou();

    expect(status.valor).toBe(StatusImportacaoValor.FALHOU);
  });

  it('deve criar status CANCELADA', () => {
    const status = StatusImportacao.cancelada();

    expect(status.valor).toBe(StatusImportacaoValor.CANCELADA);
  });

  it('deve criar status a partir de valor válido', () => {
    const status = StatusImportacao.criar(
      StatusImportacaoValor.AGUARDANDO_REVISAO,
    );

    expect(status.valor).toBe(StatusImportacaoValor.AGUARDANDO_REVISAO);
  });

  it('deve lançar BusinessException quando o status for inválido', () => {
    expect(() =>
      StatusImportacao.criar('INVALIDO' as StatusImportacaoValor),
    ).toThrow(BusinessException);
  });
});
