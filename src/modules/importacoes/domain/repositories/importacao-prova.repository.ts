import { ImportacaoProva } from '../entities/importacao-prova.entity';

export const IMPORTACAO_PROVA_REPOSITORY = Symbol(
  'IMPORTACAO_PROVA_REPOSITORY',
);

export interface ImportacaoProvaRepository {
  salvar(importacao: ImportacaoProva): Promise<ImportacaoProva>;
  buscarPorId(id: string): Promise<ImportacaoProva | null>;
}
