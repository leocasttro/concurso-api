import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  PDF_TEXT_EXTRACTOR,
  PROVA_IMPORTADA_PARSER,
  ImportarProvaPdfPreviewUseCase,
} from './application/use-cases/importar-prova-pdf-preview.use-case';
import { IMPORTACAO_PROVA_REPOSITORY } from './domain/repositories/importacao-prova.repository';
import { PdfParseTextExtractor } from './infra/services/pdf-parse-text.extractor';
import { SimpleProvaImportadaParser } from './infra/services/simple-prova-importada.parser';
import { ImportacaoProvaOrmEntity } from './infra/persistence/entities/importacao-prova.orm-entity';
import { QuestaoImportadaOrmEntity } from './infra/persistence/entities/questao-importada.orm-entity';
import { TypeOrmImportacaoProvaRepository } from './infra/persistence/repositories/typeorm-importacao-prova.repository';
import { ImportacoesController } from './presentation/controllers/importacoes.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ImportacaoProvaOrmEntity,
      QuestaoImportadaOrmEntity,
    ]),
  ],
  controllers: [ImportacoesController],
  providers: [
    ImportarProvaPdfPreviewUseCase,
    {
      provide: IMPORTACAO_PROVA_REPOSITORY,
      useClass: TypeOrmImportacaoProvaRepository,
    },
    {
      provide: PDF_TEXT_EXTRACTOR,
      useClass: PdfParseTextExtractor,
    },
    {
      provide: PROVA_IMPORTADA_PARSER,
      useClass: SimpleProvaImportadaParser,
    },
  ],
  exports: [ImportarProvaPdfPreviewUseCase],
})
export class ImportacoesModule {}
