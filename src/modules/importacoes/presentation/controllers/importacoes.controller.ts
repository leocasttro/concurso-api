import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { ImportarProvaPdfPreviewUseCase } from '../../application/use-cases/importar-prova-pdf-preview.use-case';
import { ImportacaoProvaPresenter } from '../presenters/importacao-prova.presenter';

type UploadedPdfFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
};

@Controller('importacoes')
export class ImportacoesController {
  constructor(
    private readonly importarProvaPdfPreviewUseCase: ImportarProvaPdfPreviewUseCase,
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

    return ImportacaoProvaPresenter.toHTTP(importacao);
  }
}
