import { QuestaoImportada } from '../../domain/entities/questao-importada.entity';
import { TipoQuestaoValor } from '../../../questoes/domain/value-objects/tipo-questao.vo';
import type {
  ProvaImportadaParser,
  ProvaImportadaParserInput,
  ProvaImportadaParserOutput,
} from '../../application/services/prova-importada-parser';

export class SimpleProvaImportadaParser implements ProvaImportadaParser {
  async parse(
    input: ProvaImportadaParserInput,
  ): Promise<ProvaImportadaParserOutput> {
    const texto = input.texto.trim();

    if (!texto) {
      return {
        questoes: [],
        avisos: [],
        erros: ['Texto da prova está vazio.'],
      };
    }

    const blocos = this.separarBlocosDeQuestoes(texto);

    if (blocos.length === 0) {
      return {
        questoes: [],
        avisos: [],
        erros: ['Nenhuma questão foi identificada no texto.'],
      };
    }

    const questoes = blocos.map((bloco) =>
      QuestaoImportada.criar({
        numero: bloco.numero,
        enunciado: bloco.enunciado,
        alternativas: bloco.alternativas,
        tipoSugerido:
          bloco.alternativas.length > 0
            ? TipoQuestaoValor.MULTIPLA_ESCOLHA
            : TipoQuestaoValor.CERTO_ERRADO,
        confianca: bloco.alternativas.length > 0 ? 0.75 : 0.5,
      }),
    );

    const avisos = questoes
      .filter((questao) => questao.precisaRevisao)
      .map(
        (questao) =>
          `Questão ${questao.numero ?? 'sem número'} precisa de revisão.`,
      );

    return {
      questoes,
      avisos,
      erros: [],
    };
  }

  private separarBlocosDeQuestoes(texto: string): Array<{
    numero?: number;
    enunciado: string;
    alternativas: Array<{
      texto: string;
      letra?: string;
    }>;
  }> {
    const regexQuestao =
      /(?:^|\n)\s*(?:(?:QUEST[ÃA]O|Quest[ãa]o)\s*)?(\d{1,3})\s*[-.)]\s+/g;
    const matches = [...texto.matchAll(regexQuestao)];

    return matches
      .map((match, index) => {
        const inicio = match.index ?? 0;
        const fim = matches[index + 1]?.index ?? texto.length;
        const bloco = texto.slice(inicio, fim).trim();
        const numero = Number(match[1]);

        return {
          numero,
          enunciado: this.extrairEnunciado(bloco),
          alternativas: this.extrairAlternativas(bloco),
        };
      })
      .filter((questao) => questao.enunciado.length > 0);
  }

  private extrairEnunciado(bloco: string): string {
    const linhas = bloco
      .split('\n')
      .map((linha) => linha.trim())
      .filter(Boolean);

    const linhasSemTitulo = linhas.slice(1);
    const indicePrimeiraAlternativa = linhasSemTitulo.findIndex((linha) =>
      /^[A-Ea-e][).]\s+/.test(linha),
    );

    if (indicePrimeiraAlternativa === -1) {
      return linhasSemTitulo.join(' ').trim();
    }

    return linhasSemTitulo.slice(0, indicePrimeiraAlternativa).join(' ').trim();
  }

  private extrairAlternativas(bloco: string): Array<{
    texto: string;
    letra?: string;
  }> {
    const linhas = bloco
      .split('\n')
      .map((linha) => linha.trim())
      .filter(Boolean);

    return linhas
      .map((linha) => {
        const match = linha.match(/^([A-Ea-e])[).]\s+(.+)$/);

        if (!match) {
          return undefined;
        }

        return {
          letra: match[1].toUpperCase(),
          texto: match[2].trim(),
        };
      })
      .filter((alternativa): alternativa is { texto: string; letra: string } =>
        Boolean(alternativa),
      );
  }
}
