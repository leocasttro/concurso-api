import { Prova } from '../entities/prova.entity';
import { ListarProvasInput } from '../../application/use-cases/listar-provas.input';
import { PaginatedResult } from '../../../../shared/application/pagination/paginated-result';

export const PROVA_REPOSITORY = Symbol('PROVA_REPOSITORY');

export interface ProvaRepository {
  salvar(prova: Prova): Promise<Prova>;
  listar(input: ListarProvasInput): Promise<PaginatedResult<Prova>>;
  buscarPorId(id: string): Promise<Prova | null>;
  remover(id: string): Promise<void>;
}
