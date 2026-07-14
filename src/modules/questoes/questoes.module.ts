import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnularQuestaoUseCase } from './application/use-cases/anular-questao.use-case';
import { BuscarQuestaoPorIdUseCase } from './application/use-cases/buscar-questao-por-id.use-case';
import { CriarQuestaoUseCase } from './application/use-cases/criar-questao.use-case';
import { EnviarQuestaoParaRevisaoUseCase } from './application/use-cases/enviar-questao-para-revisao.use-case';
import { ImportarQuestaoUseCase } from './application/use-cases/importar-questao.use-case';
import { ListarQuestoesPorProvaUseCase } from './application/use-cases/listar-questoes-por-prova.use-case';
import { PublicarQuestaoUseCase } from './application/use-cases/publicar-questao.use-case';
import { QUESTAO_REPOSITORY } from './domain/repositories/questao.repository';
import { AlternativaOrmEntity } from './infra/persistence/entities/alternativa.orm-entity';
import { QuestaoOrmEntity } from './infra/persistence/entities/questao.orm-entity';
import { TypeOrmQuestaoRepository } from './infra/persistence/repositories/typeorm-questao.repository';
import { QuestoesController } from './presentation/controllers/questoes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([QuestaoOrmEntity, AlternativaOrmEntity])],
  controllers: [QuestoesController],
  providers: [
    CriarQuestaoUseCase,
    ImportarQuestaoUseCase,
    ListarQuestoesPorProvaUseCase,
    BuscarQuestaoPorIdUseCase,
    PublicarQuestaoUseCase,
    EnviarQuestaoParaRevisaoUseCase,
    AnularQuestaoUseCase,
    {
      provide: QUESTAO_REPOSITORY,
      useClass: TypeOrmQuestaoRepository,
    },
  ],
})
export class QuestoesModule {}
