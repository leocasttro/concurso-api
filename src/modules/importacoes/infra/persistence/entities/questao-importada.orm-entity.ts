import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TipoQuestaoValor } from '../../../../questoes/domain/value-objects/tipo-questao.vo';
import { ImportacaoProvaOrmEntity } from './importacao-prova.orm-entity';

@Entity('questoes_importadas')
export class QuestaoImportadaOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'importacao_id' })
  importacaoId: string;

  @Column({ nullable: true })
  numero?: number;

  @Column('text')
  enunciado: string;

  @Column({
    name: 'tipo_sugerido',
    type: 'enum',
    enum: TipoQuestaoValor,
    nullable: true,
  })
  tipoSugerido?: TipoQuestaoValor;

  @Column('jsonb', { default: [] })
  alternativas: Array<{
    texto: string;
    letra?: string;
  }>;

  @Column('jsonb', { nullable: true })
  gabarito?: {
    tipo: string;
    valores: string[];
  };

  @Column({ nullable: true })
  disciplina?: string;

  @Column({ nullable: true })
  assunto?: string;

  @Column({ name: 'texto_apoio', type: 'text', nullable: true })
  textoApoio?: string;

  @Column('float')
  confianca: number;

  @Column({ name: 'precisa_revisao' })
  precisaRevisao: boolean;

  @ManyToOne(
    () => ImportacaoProvaOrmEntity,
    (importacao: ImportacaoProvaOrmEntity) => importacao.questoes,
    {
      onDelete: 'CASCADE',
    },
  )
  importacao: ImportacaoProvaOrmEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt?: Date;
}
