import { BusinessException } from './business.exception';
import { ErrorStatus } from './error-status';

export class NotFoundException extends BusinessException {
  constructor(message = 'Recurso não encontrado.') {
    super(message, 'NOT_FOUND', ErrorStatus.NOT_FOUND);
    this.name = 'NotFoundException';
  }
}
