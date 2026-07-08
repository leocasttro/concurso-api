import { NotFoundException } from '../../../../shared/domain/exceptions/not-found.exception';

export class QuestaoNaoEncontradaException extends NotFoundException {
  constructor() {
    super('Questão não encontrada.');
    this.name = 'QuestaoNaoEncontradaException';
  }
}
