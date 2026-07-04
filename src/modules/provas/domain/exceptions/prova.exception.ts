import { BusinessException } from '../../../../shared/domain/exceptions/business.exception';

export class ProvaException extends BusinessException {
  constructor(message: string) {
    super(message, 'PROVA_ERROR');
    this.name = 'ProvaException';
  }
}
