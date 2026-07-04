import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CriarProvaDto } from '../../application/dtos/criar-prova.dto';
import { CriarProvaUseCase } from '../../application/use-cases/criar-prova.use-case';
import { ProvaPresenter } from '../presenters/prova.presenter';
import { ListarProvasUseCase } from '../../application/use-cases/listar-provas.use-case';
import { BuscarProvaPorIdUseCase } from '../../application/use-cases/buscar-prova-por-id.use-case';
import { UuidValidationPipe } from '../../../../shared/presentation/pipes/uuid-validation.pipe';
import { AtualizarProvaUseCase } from '../../application/use-cases/atualizar-prova.use-case';
import { RemoverProvaUseCase } from '../../application/use-cases/remover-prova.use-case';
import { AtualizarProvaDto } from '../../application/dtos/atualizar-prova.dto';
import { ListarProvasQueryDto } from '../../application/dtos/listar-provas-query.dto';

@Controller('provas')
export class ProvasController {
  constructor(
    private readonly criarProvaUseCase: CriarProvaUseCase,
    private readonly listarProvasUseCase: ListarProvasUseCase,
    private readonly buscarProvaPorIdUseCase: BuscarProvaPorIdUseCase,
    private readonly atualizarProvaUseCase: AtualizarProvaUseCase,
    private readonly removerProvaUseCase: RemoverProvaUseCase,
  ) {}

  @Post()
  async criar(@Body() dto: CriarProvaDto) {
    const prova = await this.criarProvaUseCase.execute({
      titulo: dto.titulo,
      cargo: dto.cargo,
      banca: dto.banca,
      ano: dto.ano,
      categoria: dto.categoria,
    });

    return ProvaPresenter.toHTTP(prova);
  }

  @Get()
  async listar(@Query() query: ListarProvasQueryDto) {
    const resultado = await this.listarProvasUseCase.execute({
      search: query.search,
      banca: query.banca,
      cargo: query.cargo,
      ano: query.ano,
      categoria: query.categoria,
      status: query.status,
      page: query.page,
      limit: query.limit,
    });

    return {
      data: resultado.data.map((prova) => ProvaPresenter.toHTTP(prova)),
      meta: resultado.meta,
    };
  }

  @Get(':id')
  async buscarPorId(@Param('id', UuidValidationPipe) id: string) {
    const prova = await this.buscarProvaPorIdUseCase.execute({ id });

    return ProvaPresenter.toHTTP(prova);
  }

  @Put(':id')
  async atualizar(
    @Param('id', UuidValidationPipe) id: string,
    @Body() dto: AtualizarProvaDto,
  ) {
    const prova = await this.atualizarProvaUseCase.execute({
      id,
      titulo: dto.titulo,
      cargo: dto.cargo,
      banca: dto.banca,
      ano: dto.ano,
      categoria: dto.categoria,
    });

    return ProvaPresenter.toHTTP(prova);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remover(@Param('id', UuidValidationPipe) id: string): Promise<void> {
    await this.removerProvaUseCase.execute({ id });
  }
}
