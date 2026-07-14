import { Injectable } from '@nestjs/common';
import { QuestaoRepository } from '../../../domain/repositories/questao.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestaoOrmEntity } from '../entities/questao.orm-entity';
import { Repository } from 'typeorm';
import { Questao } from '../../../domain/entities/questao.entity';
import { QuestaoMapper } from '../../mappers/questao.mapper';

@Injectable()
export class TypeOrmQuestaoRepository implements QuestaoRepository {
  constructor(
    @InjectRepository(QuestaoOrmEntity)
    private readonly repository: Repository<QuestaoOrmEntity>,
  ) {}

  async salvar(questao: Questao): Promise<Questao> {
    const entity = QuestaoMapper.toPersistence(questao);

    const saved = await this.repository.save(entity);

    return QuestaoMapper.toDomain(saved);
  }

  async listarPorProvaId(provaId: string): Promise<Questao[]> {
    const entities = await this.repository.find({
      where: { provaId },
      order: {
        numero: 'ASC',
        createdAt: 'ASC',
      },
    });

    return entities.map((entity) => QuestaoMapper.toDomain(entity));
  }

  async buscarPorId(id: string): Promise<Questao | null> {
    const entity = await this.repository.findOne({
      where: { id },
    });

    return entity ? QuestaoMapper.toDomain(entity) : null;
  }
}
