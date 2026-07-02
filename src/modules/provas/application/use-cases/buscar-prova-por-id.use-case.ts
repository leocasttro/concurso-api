import { Inject, Injectable } from '@nestjs/common';
import { PROVA_REPOSITORY } from '../../domain/repositories/prova.repository';
import type { ProvaRepository } from '../../domain/repositories/prova.repository';
import { Prova } from '../../domain/entities/prova.entity';
import { ProvaException } from '../../domain/exceptions/prova.exception';

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
      //transformar em notFound futuramente para evitar 400 generico
      throw new ProvaException('Prova não encontrada.');
    }
    return prova;
  }
}
