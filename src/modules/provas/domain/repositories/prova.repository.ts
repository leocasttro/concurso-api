import { Prova } from '../entities/prova.entity';
import { ListarProvasInput } from '../../application/use-cases/listar-provas.input';

export const PROVA_REPOSITORY = Symbol('PROVA_REPOSITORY');

export interface ProvaRepository {
  salvar(prova: Prova): Promise<Prova>;
  listar(input: ListarProvasInput): Promise<Prova[]>;
  buscarPorId(id: string): Promise<Prova | null>;
  remover(id: string): Promise<void>;
}
