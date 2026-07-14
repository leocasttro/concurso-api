import { BusinessException } from '../../../../shared/domain/exceptions/business.exception';

export class QuestaoException extends BusinessException {
  constructor(message: string) {
    super(message, 'QUESTAO_ERROR');
    this.name = 'QuestaoException';
  }
}
