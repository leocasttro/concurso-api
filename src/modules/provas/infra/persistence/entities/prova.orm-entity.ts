import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
