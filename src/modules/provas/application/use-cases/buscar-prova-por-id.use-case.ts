import { Inject, Injectable } from '@nestjs/common';
import { Prova } from '../../domain/entities/prova.entity';
import { ProvaNaoEncontradaException } from '../../domain/exceptions/prova-nao-encontrada.exception';
import { PROVA_REPOSITORY } from '../../domain/repositories/prova.repository';
import type { ProvaRepository } from '../../domain/repositories/prova.repository';
import type { BuscarProvaPorIdInput } from './buscar-prova-por-id.input';

@Injectable()
export class BuscarProvaPorIdUseCase {
  constructor(
    @Inject(PROVA_REPOSITORY)
    private readonly provaRepository: ProvaRepository,
  ) {}

  async execute(input: BuscarProvaPorIdInput): Promise<Prova> {
    const prova = await this.provaRepository.buscarPorId(input.id);

    if (!prova) {
      throw new ProvaNaoEncontradaException();
    }

    return prova;
  }
}
