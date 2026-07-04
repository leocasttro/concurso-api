import { Prova } from '../../domain/entities/prova.entity';
import { StatusProvaValor } from '../../domain/value-objects/status-prova.vo';

export type ProvaHttpResponse = {
  id: string;
  titulo: string;
  cargo: string;
  banca: string;
  ano: number;
  status: StatusProvaValor;
  categoria: string;
  createdAt: Date;
};

export class ProvaPresenter {
  static toHTTP(prova: Prova): ProvaHttpResponse {
    return {
      id: prova.id,
      titulo: prova.titulo,
      cargo: prova.cargo,
      banca: prova.banca.valor,
      ano: prova.ano.valor,
      status: prova.status.valor,
      categoria: prova.categoria.valor,
      createdAt: prova.createdAt,
    };
  }
}
