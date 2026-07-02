import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CriarProvaUseCase } from './application/use-cases/criar-prova.use-case';
import { PROVA_REPOSITORY } from './domain/repositories/prova.repository';
import { ProvaOrmEntity } from './infra/persistence/entities/prova.orm-entity';
import { TypeOrmProvaRepository } from './infra/persistence/repositories/typeorm-prova.repository';
import { ProvasController } from './presentation/controllers/provas.controller';
import { ListarProvasUseCase } from './application/use-cases/listar-provas.use-case';
import { BuscarProvaPorIdUseCase } from './application/use-cases/buscar-prova-por-id.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([ProvaOrmEntity])],
  controllers: [ProvasController],
  providers: [
    CriarProvaUseCase,
    ListarProvasUseCase,
    BuscarProvaPorIdUseCase,
    {
      provide: PROVA_REPOSITORY,
      useClass: TypeOrmProvaRepository,
    },
  ],
})
export class ProvasModule {}
