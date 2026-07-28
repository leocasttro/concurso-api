import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  ImportarProvaPdfPreviewUseCase,
  EXTRATOR_PROVA_PDF,
} from './application/use-cases/importar-prova-pdf-preview.use-case';
import { IMPORTACAO_PROVA_REPOSITORY } from './domain/repositories/importacao-prova.repository';
import { ImportacaoProvaOrmEntity } from './infra/persistence/entities/importacao-prova.orm-entity';
import { QuestaoImportadaOrmEntity } from './infra/persistence/entities/questao-importada.orm-entity';
import { TypeOrmImportacaoProvaRepository } from './infra/persistence/repositories/typeorm-importacao-prova.repository';
import { ImportacoesController } from './presentation/controllers/importacoes.controller';
import { HttpExtratorProvaPdfService } from './infra/services/http-extrator-prova-pdf.service';

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
      provide: EXTRATOR_PROVA_PDF,
      useClass: HttpExtratorProvaPdfService,
    },
  ],
  exports: [ImportarProvaPdfPreviewUseCase],
})
export class ImportacoesModule {}
