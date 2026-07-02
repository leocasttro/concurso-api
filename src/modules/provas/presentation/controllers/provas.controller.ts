import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CriarProvaDto } from '../../application/dtos/criar-prova.dto';
import { CriarProvaUseCase } from '../../application/use-cases/criar-prova.use-case';
import { ProvaPresenter } from '../presenters/prova.presenter';
import { ListarProvasUseCase } from '../../application/use-cases/listar-provas.use-case';
import { BuscarProvaPorIdUseCase } from '../../application/use-cases/buscar-prova-por-id.use-case';

@Controller('provas')
export class ProvasController {
  constructor(
    private readonly criarProvaUseCase: CriarProvaUseCase,
    private readonly listarProvasUseCase: ListarProvasUseCase,
    private readonly buscarProvaPorIdUseCase: BuscarProvaPorIdUseCase,
  ) {}

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
  @Get()
  async listar() {
    const provas = await this.listarProvasUseCase.execute();

    return provas.map((prova) => ProvaPresenter.toHTTP(prova));
  }

  @Get(':id')
  async buscarPorId(@Param('id') id: string) {
    const prova = await this.buscarProvaPorIdUseCase.execute({ id });

    return ProvaPresenter.toHTTP(prova);
  }
}
