import { BusinessException } from '../../../../shared/domain/exceptions/business.exception';

export class ImportacaoException extends BusinessException {
  constructor(message: string) {
    super(message, 'IMPORTACAO_ERROR');
    this.name = 'ImportacaoException';
  }
}
