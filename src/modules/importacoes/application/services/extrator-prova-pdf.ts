import { QuestaoImportada } from '../../domain/entities/questao-importada.entity';

export type ExtrairProvaPdfInput = {
  nomeArquivo: string;
  tipoArquivo: string;
  fileBuffer: Buffer;
};

export type ExtrairProvaPdfOutput = {
  questoes: QuestaoImportada[];
  avisos: string[];
  erros: string[];
};

export interface ExtratorProvaPdf {
  extrair(input: ExtrairProvaPdfInput): Promise<ExtrairProvaPdfOutput>;
}
