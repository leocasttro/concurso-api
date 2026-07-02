import { Inject, Injectable } from '@nestjs/common';
import { PROVA_REPOSITORY } from '../../domain/repositories/prova.repository';
import type { ProvaRepository } from '../../domain/repositories/prova.repository';
import { Prova } from '../../domain/entities/prova.entity';
import { ProvaNaoEncontradaException } from '../../domain/exceptions/prova-nao-encontrada.exception';

type BuscarProvaPorIdInput = { id: string };

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
