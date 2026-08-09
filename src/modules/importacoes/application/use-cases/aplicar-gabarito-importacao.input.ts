export type AplicarGabaritoImportacaoInput = {
  importacaoId: string;
  respostas: Array<{
    numero: number;
    valor: string;
  }>;
};
