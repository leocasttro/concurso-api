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
import { IMPORTACAO_PROVA_REVIEW_ANALYZER } from './application/services/importacao-prova-review-analyzer';
import { DefaultImportacaoProvaReviewAnalyzer } from './application/services/default-importacao-prova-review-analyzer';
import { QuestoesModule } from '../questoes/questoes.module';
import { ProvasModule } from '../provas/provas.module';
import { ConfirmarImportacaoProvaUseCase } from './application/use-cases/confirmar-importacao-prova.use-case';
import { AtualizarQuestaoImportadaUseCase } from './application/use-cases/atualizar-questao-importada.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ImportacaoProvaOrmEntity,
      QuestaoImportadaOrmEntity,
    ]),
    ProvasModule,
    QuestoesModule,
  ],
  controllers: [ImportacoesController],
  providers: [
    ImportarProvaPdfPreviewUseCase,
    ConfirmarImportacaoProvaUseCase,
    AtualizarQuestaoImportadaUseCase,
    {
      provide: IMPORTACAO_PROVA_REPOSITORY,
      useClass: TypeOrmImportacaoProvaRepository,
    },
    {
      provide: EXTRATOR_PROVA_PDF,
      useClass: HttpExtratorProvaPdfService,
    },
    {
      provide: IMPORTACAO_PROVA_REVIEW_ANALYZER,
      useClass: DefaultImportacaoProvaReviewAnalyzer,
    },
  ],
  exports: [
    ImportarProvaPdfPreviewUseCase,
    ConfirmarImportacaoProvaUseCase,
    AtualizarQuestaoImportadaUseCase,
  ],
})
export class ImportacoesModule {}
