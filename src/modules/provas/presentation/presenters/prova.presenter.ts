import { Prova } from '../../domain/entities/prova.entity';

export class ProvaPresenter {
  static toHTTP(prova: Prova) {
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
