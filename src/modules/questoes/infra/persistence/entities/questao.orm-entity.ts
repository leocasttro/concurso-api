import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TipoQuestaoValor } from '../../../domain/value-objects/tipo-questao.vo';
import { StatusQuestaoValor } from '../../../domain/value-objects/status-questao.vo';
import { AlternativaOrmEntity } from './alternativa.orm-entity';
import { TipoGabaritoValor } from '../../../domain/value-objects/gabarito.vo';

@Entity('questoes')
export class QuestaoOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'prova_id' })
  provaId: string;

  @Column({ nullable: true })
  numero?: number;

  @Column('text')
  enunciado: string;

  @Column({
    type: 'enum',
    enum: TipoQuestaoValor,
  })
  tipo: TipoQuestaoValor;

  @Column({
    type: 'enum',
    enum: StatusQuestaoValor,
  })
  status: StatusQuestaoValor;

  @OneToMany(() => AlternativaOrmEntity, (alternativa) => alternativa.questao, {
    cascade: true,
    eager: true,
  })
  alternativas: AlternativaOrmEntity[];

  @Column({
    name: 'gabarito_tipo',
    type: 'enum',
    enum: TipoGabaritoValor,
    nullable: true,
  })
  gabaritoTipo?: TipoGabaritoValor;

  @Column('text', {
    name: 'gabarito_valores',
    array: true,
    nullable: true,
  })
  gabaritoValores?: string[];

  @Column({ nullable: true })
  disciplina?: string;

  @Column({ nullable: true })
  assunto?: string;

  @Column('text', { name: 'texto_apoio', nullable: true })
  textoApoio?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt?: Date;
}
