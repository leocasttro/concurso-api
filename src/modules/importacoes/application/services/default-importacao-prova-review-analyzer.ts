import {
  ImportacaoProvaReviewAnalyzer,
  RevisaoImportacaoItem,
} from './importacao-prova-review-analyzer';
import { QuestaoImportada } from '../../domain/entities/questao-importada.entity';

export class DefaultImportacaoProvaReviewAnalyzer implements ImportacaoProvaReviewAnalyzer {
  analisar(questoes: QuestaoImportada[]): RevisaoImportacaoItem[] {
    const itens: RevisaoImportacaoItem[] = [];

    questoes.forEach((questao) => {
      itens.push(...this.analisarEnunciado(questao));
      itens.push(...this.analisarAlternativas(questao));
      itens.push(...this.analisarConfianca(questao));
    });

    return itens;
  }

  private analisarEnunciado(
    questao: QuestaoImportada,
  ): RevisaoImportacaoItem[] {
    const itens: RevisaoImportacaoItem[] = [];
    const enunciado = questao.enunciado.trim();

    if (enunciado.length < 20) {
      itens.push({
        questaoId: questao.id,
        numero: questao.numero,
        campo: 'enunciado',
        problema: 'Enunciado muito curto. Pode ter sido cortado na importação.',
        valorAtual: enunciado,
      });
    }

    if (this.temCaracteresSuspeitos(enunciado)) {
      itens.push({
        questaoId: questao.id,
        numero: questao.numero,
        campo: 'enunciado',
        problema: 'Enunciado possui caracteres suspeitos de OCR.',
        valorAtual: enunciado,
      });
    }

    return itens;
  }

  private analisarAlternativas(
    questao: QuestaoImportada,
  ): RevisaoImportacaoItem[] {
    const itens: RevisaoImportacaoItem[] = [];
    const totalAlternativas = questao.alternativas.length;

    if (totalAlternativas > 0 && totalAlternativas < 4) {
      itens.push({
        questaoId: questao.id,
        numero: questao.numero,
        campo: 'alternativas',
        problema: `Questão possui apenas ${totalAlternativas} alternativas.`,
        valorAtual: questao.alternativas
          .map(
            (alternativa) =>
              `${alternativa.letra ?? '-'}: ${alternativa.texto}`,
          )
          .join(' | '),
      });
    }

    if (totalAlternativas > 5) {
      itens.push({
        questaoId: questao.id,
        numero: questao.numero,
        campo: 'alternativas',
        problema: `Questão possui ${totalAlternativas} alternativas.`,
        valorAtual: questao.alternativas
          .map(
            (alternativa) =>
              `${alternativa.letra ?? '-'}: ${alternativa.texto}`,
          )
          .join(' | '),
      });
    }

    questao.alternativas.forEach((alternativa) => {
      if (!alternativa.texto.trim()) {
        itens.push({
          questaoId: questao.id,
          numero: questao.numero,
          campo: 'alternativas',
          problema: `Alternativa ${alternativa.letra ?? 'sem letra'} está vazia.`,
        });
      }

      if (this.temCaracteresSuspeitos(alternativa.texto)) {
        itens.push({
          questaoId: questao.id,
          numero: questao.numero,
          campo: 'alternativas',
          problema: `Alternativa ${alternativa.letra ?? 'sem letra'} possui caracteres suspeitos de OCR.`,
          valorAtual: alternativa.texto,
        });
      }
    });

    return itens;
  }

  private analisarConfianca(
    questao: QuestaoImportada,
  ): RevisaoImportacaoItem[] {
    if (questao.confianca >= 0.8) {
      return [];
    }

    return [
      {
        questaoId: questao.id,
        numero: questao.numero,
        campo: 'confianca',
        problema: `Questão possui baixa confiança de importação: ${questao.confianca}.`,
        valorAtual: String(questao.confianca),
      },
    ];
  }

  private temCaracteresSuspeitos(texto: string): boolean {
    return /[�]|[|]{2,}|[_]{3,}|[?]{2,}|[^\s\wÀ-ÿ.,;:!?()[\]{}"'“”‘’%ºª°+\-=/\\]/.test(
      texto,
    );
  }
}
