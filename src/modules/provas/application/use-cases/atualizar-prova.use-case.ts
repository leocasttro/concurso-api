import { Inject, Injectable } from '@nestjs/common';
import { Prova } from '../../domain/entities/prova.entity';
import { ProvaNaoEncontradaException } from '../../domain/exceptions/prova-nao-encontrada.exception';
import { PROVA_REPOSITORY } from '../../domain/repositories/prova.repository';
import type { ProvaRepository } from '../../domain/repositories/prova.repository';
import type { AtualizarProvaInput } from './atualizar-prova.input';

@Injectable()
export class AtualizarProvaUseCase {
  constructor(
    @Inject(PROVA_REPOSITORY)
    private readonly provaRepository: ProvaRepository,
  ) {}

  async execute(input: AtualizarProvaInput): Promise<Prova> {
    const prova = await this.provaRepository.buscarPorId(input.id);

    if (!prova) {
      throw new ProvaNaoEncontradaException();
    }

    prova.atualizar({
      titulo: input.titulo,
      cargo: input.cargo,
      banca: input.banca,
      ano: input.ano,
      categoria: input.categoria,
    });

    return this.provaRepository.salvar(prova);
  }
}
