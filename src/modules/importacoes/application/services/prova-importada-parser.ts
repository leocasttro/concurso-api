import { QuestaoImportada } from '../../domain/entities/questao-importada.entity';

export type ProvaImportadaParserInput = {
  texto: string;
};

export type ProvaImportadaParserOutput = {
  questoes: QuestaoImportada[];
  avisos: string[];
  erros: string[];
};

export interface ProvaImportadaParser {
  parse(input: ProvaImportadaParserInput): Promise<ProvaImportadaParserOutput>;
}
