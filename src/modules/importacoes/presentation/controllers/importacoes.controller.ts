import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { ImportarProvaPdfPreviewUseCase } from '../../application/use-cases/importar-prova-pdf-preview.use-case';
import { ImportacaoProvaPresenter } from '../presenters/importacao-prova.presenter';
import { ConfirmarImportacaoProvaUseCase } from '../../application/use-cases/confirmar-importacao-prova.use-case';
import { ConfirmarImportacaoProvaDto } from '../../application/dtos/confirmar-importacao-prova.dto';
import { ConfirmacaoImportacaoPresenter } from '../presenters/confirmacao-importacao.presenter';
import { UuidValidationPipe } from '../../../../shared/presentation/pipes/uuid-validation.pipe';
import { AtualizarQuestaoImportadaUseCase } from '../../application/use-cases/atualizar-questao-importada.use-case';
import { AtualizarQuestaoImportadaDto } from '../../application/dtos/atualizar-questao-importada.dto';
import { QuestaoImportadaPresenter } from '../presenters/questao-importada.presenter';
import { AplicarGabaritoImportacaoUseCase } from '../../application/use-cases/aplicar-gabarito-importacao.use-case';
import { AplicarGabaritoImportacaoDto } from '../../application/dtos/aplicar-gabarito-importacao.dto';
import {
  IMPORTACAO_PROVA_REVIEW_ANALYZER,
  type ImportacaoProvaReviewAnalyzer,
} from '../../application/services/importacao-prova-review-analyzer';

type UploadedPdfFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
};

@Controller('importacoes')
export class ImportacoesController {
  constructor(
    private readonly importarProvaPdfPreviewUseCase: ImportarProvaPdfPreviewUseCase,
    private readonly confirmarImportacaoProvaUseCase: ConfirmarImportacaoProvaUseCase,
    private readonly atualizarQuestaoImportadaUseCase: AtualizarQuestaoImportadaUseCase,
    private readonly aplicarGabaritoImportacaoUseCase: AplicarGabaritoImportacaoUseCase,

    @Inject(IMPORTACAO_PROVA_REVIEW_ANALYZER)
    private readonly reviewAnalyzer: ImportacaoProvaReviewAnalyzer,
  ) {}

  @Post('provas/pdf/preview')
  @UseInterceptors(FileInterceptor('file'))
  async importarProvaPdfPreview(@UploadedFile() file?: UploadedPdfFile) {
    if (!file) {
      throw new BadRequestException('Arquivo PDF é obrigatório.');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('O arquivo precisa ser um PDF.');
    }

    const importacao = await this.importarProvaPdfPreviewUseCase.execute({
      nomeArquivo: file.originalname,
      tipoArquivo: file.mimetype,
      fileBuffer: file.buffer,
    });

    const itensRevisao = this.reviewAnalyzer.analisar(importacao.questoes);

    return ImportacaoProvaPresenter.toHTTP(importacao, itensRevisao);
  }

  @Post(':id/confirmar')
  async confirmarImportacao(
    @Param('id', UuidValidationPipe) id: string,
    @Body() dto: ConfirmarImportacaoProvaDto,
  ) {
    const resultado = await this.confirmarImportacaoProvaUseCase.execute({
      importacaoId: id,
      titulo: dto.titulo,
      cargo: dto.cargo,
      banca: dto.banca,
      ano: dto.ano,
      categoria: dto.categoria,
    });

    return ConfirmacaoImportacaoPresenter.toHTTP(resultado);
  }

  @Patch(':id/gabarito')
  async aplicarGabaritoImportacao(
    @Param('id', UuidValidationPipe) id: string,
    @Body() dto: AplicarGabaritoImportacaoDto,
  ) {
    const importacao = await this.aplicarGabaritoImportacaoUseCase.execute({
      importacaoId: id,
      respostas: dto.respostas,
    });

    const itensRevisao = this.reviewAnalyzer.analisar(importacao.questoes);

    return ImportacaoProvaPresenter.toHTTP(importacao, itensRevisao);
  }

  @Patch(':importacaoId/questoes/:questaoId')
  async atualizarQuestaoImportada(
    @Param('importacaoId', UuidValidationPipe) importacaoId: string,
    @Param('questaoId', UuidValidationPipe) questaoId: string,
    @Body() dto: AtualizarQuestaoImportadaDto,
  ) {
    const questao = await this.atualizarQuestaoImportadaUseCase.execute({
      importacaoId,
      questaoId,
      enunciado: dto.enunciado,
      tipoSugerido: dto.tipoSugerido,
      alternativas: dto.alternativas,
      gabarito: dto.gabarito,
      disciplina: dto.disciplina,
      assunto: dto.assunto,
      textoApoio: dto.textoApoio,
      precisaRevisao: dto.precisaRevisao,
    });

    return QuestaoImportadaPresenter.toHTTP(questao);
  }
}
