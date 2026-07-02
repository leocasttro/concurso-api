import { Prova } from '../entities/prova.entity';

export const PROVA_REPOSITORY = Symbol('PROVA_REPOSITORY');

export interface ProvaRepository {
  salvar(prova: Prova): Promise<Prova>;
  listar(): Promise<Prova[]>;
  buscarPorId(id: string): Promise<Prova | null>;
  remover(id: string): Promise<void>;
}
