import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CriarQuestaoDto } from '../../application/dtos/criar-questao.dto';
import { ImportarQuestaoDto } from '../../application/dtos/importar-questao.dto';
import { AnularQuestaoUseCase } from '../../application/use-cases/anular-questao.use-case';
import { BuscarQuestaoPorIdUseCase } from '../../application/use-cases/buscar-questao-por-id.use-case';
import { CriarQuestaoUseCase } from '../../application/use-cases/criar-questao.use-case';
import { EnviarQuestaoParaRevisaoUseCase } from '../../application/use-cases/enviar-questao-para-revisao.use-case';
import { ImportarQuestaoUseCase } from '../../application/use-cases/importar-questao.use-case';
import { ListarQuestoesPorProvaUseCase } from '../../application/use-cases/listar-questoes-por-prova.use-case';
import { PublicarQuestaoUseCase } from '../../application/use-cases/publicar-questao.use-case';
import { GabaritoHttpMapper } from '../mappers/gabarito-http.mapper';
import { QuestaoPresenter } from '../presenters/questao.presenter';
import { UuidValidationPipe } from '../../../../shared/presentation/pipes/uuid-validation.pipe';

@Controller('questoes')
export class QuestoesController {
  constructor(
    private readonly criarQuestaoUseCase: CriarQuestaoUseCase,
    private readonly importarQuestaoUseCase: ImportarQuestaoUseCase,
    private readonly listarQuestoesPorProvaUseCase: ListarQuestoesPorProvaUseCase,
    private readonly buscarQuestaoPorIdUseCase: BuscarQuestaoPorIdUseCase,
    private readonly publicarQuestaoUseCase: PublicarQuestaoUseCase,
    private readonly enviarQuestaoParaRevisaoUseCase: EnviarQuestaoParaRevisaoUseCase,
    private readonly anularQuestaoUseCase: AnularQuestaoUseCase,
  ) {}

  @Post()
  async criar(@Body() dto: CriarQuestaoDto) {
    const questao = await this.criarQuestaoUseCase.execute({
      provaId: dto.provaId,
      numero: dto.numero,
      enunciado: dto.enunciado,
      tipo: dto.tipo,
      alternativas: dto.alternativas,
      gabarito: GabaritoHttpMapper.toDomain(dto.gabarito),
      disciplina: dto.disciplina,
      assunto: dto.assunto,
      textoApoio: dto.textoApoio,
    });

    return QuestaoPresenter.toHTTP(questao);
  }

  @Post('importar')
  async importar(@Body() dto: ImportarQuestaoDto) {
    const questao = await this.importarQuestaoUseCase.execute({
      provaId: dto.provaId,
      numero: dto.numero,
      enunciado: dto.enunciado,
      tipo: dto.tipo,
      alternativas: dto.alternativas,
      gabarito: GabaritoHttpMapper.toDomain(dto.gabarito),
      disciplina: dto.disciplina,
      assunto: dto.assunto,
      textoApoio: dto.textoApoio,
    });

    return QuestaoPresenter.toHTTP(questao);
  }

  @Get('prova/:provaId')
  async listarPorProva(@Param('provaId', UuidValidationPipe) provaId: string) {
    const questoes = await this.listarQuestoesPorProvaUseCase.execute({
      provaId,
    });

    return questoes.map((questao) => QuestaoPresenter.toHTTP(questao));
  }

  @Get(':id')
  async buscarPorId(@Param('id', UuidValidationPipe) id: string) {
    const questao = await this.buscarQuestaoPorIdUseCase.execute({ id });

    return QuestaoPresenter.toHTTP(questao);
  }

  @Patch(':id/publicar')
  async publicar(@Param('id', UuidValidationPipe) id: string) {
    const questao = await this.publicarQuestaoUseCase.execute({ id });

    return QuestaoPresenter.toHTTP(questao);
  }

  @Patch(':id/revisao')
  async enviarParaRevisao(@Param('id', UuidValidationPipe) id: string) {
    const questao = await this.enviarQuestaoParaRevisaoUseCase.execute({ id });

    return QuestaoPresenter.toHTTP(questao);
  }

  @Patch(':id/anular')
  async anular(@Param('id', UuidValidationPipe) id: string) {
    const questao = await this.anularQuestaoUseCase.execute({ id });

    return QuestaoPresenter.toHTTP(questao);
  }
}
