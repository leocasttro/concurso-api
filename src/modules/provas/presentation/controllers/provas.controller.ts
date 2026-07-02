import { Body, Controller, Post } from '@nestjs/common';
import { CriarProvaDto } from '../../application/dtos/criar-prova.dto';
import { CriarProvaUseCase } from '../../application/use-cases/criar-prova.use-case';
import { ProvaPresenter } from '../presenters/prova.presenter';

@Controller('provas')
export class ProvasController {
  constructor(private readonly criarProvaUseCase: CriarProvaUseCase) {}

  @Post()
  async criar(@Body() dto: CriarProvaDto) {
    const prova = await this.criarProvaUseCase.execute({
      titulo: dto.titulo,
      cargo: dto.cargo,
      banca: dto.banca,
      ano: dto.ano,
    });

    return ProvaPresenter.toHTTP(prova);
  }
}
