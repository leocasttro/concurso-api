import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StatusImportacaoValor } from '../../../domain/value-objects/status-importacao.vo';
import { QuestaoImportadaOrmEntity } from './questao-importada.orm-entity';

@Entity('importacoes_provas')
export class ImportacaoProvaOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'nome_arquivo' })
  nomeArquivo: string;

  @Column({ name: 'tipo_arquivo' })
  tipoArquivo: string;

  @Column({
    type: 'enum',
    enum: StatusImportacaoValor,
  })
  status: StatusImportacaoValor;

  @OneToMany(() => QuestaoImportadaOrmEntity, (questao) => questao.importacao, {
    cascade: true,
    eager: true,
  })
  questoes: QuestaoImportadaOrmEntity[];

  @Column('text', {
    array: true,
    default: [],
  })
  erros: string[];

  @Column('text', {
    array: true,
    default: [],
  })
  avisos: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt?: Date;
}
