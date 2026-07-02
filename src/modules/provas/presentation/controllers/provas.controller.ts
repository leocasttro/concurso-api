import { Body, Controller, Post } from '@nestjs/common';
import { CriarProvaDto } from '../../application/dtos/criar-prova.dto';
import { CriarProvaUseCase } from '../../application/use-cases/criar-prova.use-case';

@Controller('provas')
export class ProvasController {
  constructor(private readonly criarProvaUseCase: CriarProvaUseCase) {}

  @Post()
  async criar(@Body() dto: CriarProvaDto) {
    const prova = await this.criarProvaUseCase.execute(dto);

    return {
      id: prova.id,
      titulo: prova.titulo,
      cargo: prova.cargo,
      banca: prova.banca.valor,
      ano: prova.ano.valor,
      createdAt: prova.createdAt,
    };
  }
}
