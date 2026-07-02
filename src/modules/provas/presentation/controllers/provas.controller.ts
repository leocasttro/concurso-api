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
    });

    return ProvaPresenter.toHTTP(prova);
  }
  @Get()
  async listar() {
    const provas = await this.listarProvasUseCase.execute();

    return provas.map((prova) => ProvaPresenter.toHTTP(prova));
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
    });

    return ProvaPresenter.toHTTP(prova);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remover(@Param('id', UuidValidationPipe) id: string): Promise<void> {
    await this.removerProvaUseCase.execute({ id });
  }
}
