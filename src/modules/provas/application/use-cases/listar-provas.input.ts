import { StatusProvaValor } from '../../domain/value-objects/status-prova.vo';

export type ListarProvasInput = {
  search?: string;
  banca?: string;
  cargo?: string;
  ano?: number;
  status?: StatusProvaValor;
  categoria?: string;
  page?: number;
  limit?: number;
};
