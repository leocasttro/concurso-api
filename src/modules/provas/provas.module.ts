import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CriarProvaUseCase } from './application/use-cases/criar-prova.use-case';
import { PROVA_REPOSITORY } from './domain/repositories/prova.repository';
import { ProvaOrmEntity } from './infra/persistence/entities/prova.orm-entity';
import { TypeOrmProvaRepository } from './infra/persistence/repositories/typeorm-prova.repository';
import { ProvasController } from './presentation/controllers/provas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProvaOrmEntity])],
  controllers: [ProvasController],
  providers: [
    CriarProvaUseCase,
    {
      provide: PROVA_REPOSITORY,
      useClass: TypeOrmProvaRepository,
    },
  ],
})
export class ProvasModule {}
