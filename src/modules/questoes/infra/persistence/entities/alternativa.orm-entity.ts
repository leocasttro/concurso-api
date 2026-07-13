import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { QuestaoOrmEntity } from './questao.orm-entity';

@Entity('alternativas')
export class AlternativaOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  texto: string;

  @Column({ nullable: true })
  letra?: string;

  @Column({ name: 'questao_id' })
  questaoId: string;

  @ManyToOne(() => QuestaoOrmEntity, (questao) => questao.alternativas, {
    onDelete: 'CASCADE',
  })
  questao: QuestaoOrmEntity;
}
