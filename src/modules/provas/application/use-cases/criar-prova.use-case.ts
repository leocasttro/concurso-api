import { Inject, Injectable } from '@nestjs/common';
import { Prova } from '../../domain/entities/prova.entity';
import { PROVA_REPOSITORY } from '../../domain/repositories/prova.repository';
import type { ProvaRepository } from '../../domain/repositories/prova.repository';
import { CriarProvaDto } from '../dtos/criar-prova.dto';

@Injectable()
export class CriarProvaUseCase {
  constructor(
    @Inject(PROVA_REPOSITORY)
    private readonly provaRepository: ProvaRepository,
  ) {}

  async execute(input: CriarProvaDto): Promise<Prova> {
    const prova = Prova.criar(input);
    return this.provaRepository.salvar(prova);
  }
}
