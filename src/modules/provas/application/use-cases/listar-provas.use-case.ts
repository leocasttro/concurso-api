import { Inject, Injectable } from '@nestjs/common';
import { PROVA_REPOSITORY } from '../../domain/repositories/prova.repository';
import type { ProvaRepository } from '../../domain/repositories/prova.repository';
import { Prova } from '../../domain/entities/prova.entity';

@Injectable()
export class ListarProvasUseCase {
  constructor(
    @Inject(PROVA_REPOSITORY)
    private readonly provaRepository: ProvaRepository,
  ) {}
  async execute(): Promise<Prova[]> {
    return this.provaRepository.listar();
  }
}
