import { Inject, Injectable } from '@nestjs/common';
import { PROVA_REPOSITORY } from '../../domain/repositories/prova.repository';
import type { ProvaRepository } from '../../domain/repositories/prova.repository';
import { Prova } from '../../domain/entities/prova.entity';
import { ListarProvasInput } from './listar-provas.input';
import { PaginatedResult } from '../../../../shared/application/pagination/paginated-result';

@Injectable()
export class ListarProvasUseCase {
  constructor(
    @Inject(PROVA_REPOSITORY)
    private readonly provaRepository: ProvaRepository,
  ) {}
  async execute(input: ListarProvasInput): Promise<PaginatedResult<Prova>> {
    return this.provaRepository.listar(input);
  }
}
