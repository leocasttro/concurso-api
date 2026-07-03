import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StatusProvaValor } from '../../../domain/value-objects/status-prova.vo';

@Entity('provas')
export class ProvaOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  titulo: string;

  @Column()
  cargo: string;

  @Column()
  banca: string;

  @Column()
  ano: number;

  @Column()
  categoria: string;

  @Column({
    type: 'enum',
    enum: StatusProvaValor,
    default: StatusProvaValor.RASCUNHO,
  })
  status: StatusProvaValor;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt?: Date;
}
