import { Inject, Injectable } from '@nestjs/common';
import { ProvaNaoEncontradaException } from '../../domain/exceptions/prova-nao-encontrada.exception';
import { PROVA_REPOSITORY } from '../../domain/repositories/prova.repository';
import type { ProvaRepository } from '../../domain/repositories/prova.repository';
import type { RemoverProvaInput } from './remover-prova.input';

@Injectable()
export class RemoverProvaUseCase {
  constructor(
    @Inject(PROVA_REPOSITORY)
    private readonly provaRepository: ProvaRepository,
  ) {}

  async execute(input: RemoverProvaInput): Promise<void> {
    const prova = await this.provaRepository.buscarPorId(input.id);

    if (!prova) {
      throw new ProvaNaoEncontradaException();
    }

    await this.provaRepository.remover(input.id);
  }
}
