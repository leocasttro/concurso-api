import { NotFoundException } from '../../../../shared/domain/exceptions/not-found.exception';

export class ProvaNaoEncontradaException extends NotFoundException {
  constructor() {
    super('Prova não encontrada.');
    this.name = 'ProvaNaoEncontradaException';
  }
}
