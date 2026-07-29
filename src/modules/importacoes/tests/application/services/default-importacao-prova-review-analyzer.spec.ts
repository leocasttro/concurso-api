import { TipoQuestaoValor } from '../../../../questoes/domain/value-objects/tipo-questao.vo';
import { DefaultImportacaoProvaReviewAnalyzer } from '../../../application/services/default-importacao-prova-review-analyzer';
import { QuestaoImportada } from '../../../domain/entities/questao-importada.entity';

describe('DefaultImportacaoProvaReviewAnalyzer', () => {
  let analyzer: DefaultImportacaoProvaReviewAnalyzer;

  beforeEach(() => {
    analyzer = new DefaultImportacaoProvaReviewAnalyzer();
  });

  it('não deve retornar pendências quando a questão estiver confiável', () => {
    const questao = QuestaoImportada.criar({
      numero: 1,
      enunciado: 'Qual alternativa apresenta a interpretação correta do texto?',
      tipoSugerido: TipoQuestaoValor.MULTIPLA_ESCOLHA,
      alternativas: [
        { letra: 'A', texto: 'Primeira alternativa válida.' },
        { letra: 'B', texto: 'Segunda alternativa válida.' },
        { letra: 'C', texto: 'Terceira alternativa válida.' },
        { letra: 'D', texto: 'Quarta alternativa válida.' },
        { letra: 'E', texto: 'Quinta alternativa válida.' },
      ],
      confianca: 0.9,
      precisaRevisao: false,
    });

    const resultado = analyzer.analisar([questao]);

    expect(resultado).toEqual([]);
  });

  it('deve apontar enunciado muito curto', () => {
    const questao = QuestaoImportada.criar({
      numero: 2,
      enunciado: 'Texto curto.',
      tipoSugerido: TipoQuestaoValor.MULTIPLA_ESCOLHA,
      alternativas: [
        { letra: 'A', texto: 'Primeira alternativa válida.' },
        { letra: 'B', texto: 'Segunda alternativa válida.' },
        { letra: 'C', texto: 'Terceira alternativa válida.' },
        { letra: 'D', texto: 'Quarta alternativa válida.' },
      ],
      confianca: 0.9,
      precisaRevisao: false,
    });

    const resultado = analyzer.analisar([questao]);

    expect(resultado).toEqual([
      {
        questaoId: questao.id,
        numero: 2,
        campo: 'enunciado',
        problema: 'Enunciado muito curto. Pode ter sido cortado na importação.',
        valorAtual: 'Texto curto.',
      },
    ]);
  });

  it('deve apontar caracteres suspeitos no enunciado', () => {
    const questao = QuestaoImportada.criar({
      numero: 3,
      enunciado: 'Qual alternativa interpreta corretamente o texto � extraído?',
      tipoSugerido: TipoQuestaoValor.MULTIPLA_ESCOLHA,
      alternativas: [
        { letra: 'A', texto: 'Primeira alternativa válida.' },
        { letra: 'B', texto: 'Segunda alternativa válida.' },
        { letra: 'C', texto: 'Terceira alternativa válida.' },
        { letra: 'D', texto: 'Quarta alternativa válida.' },
      ],
      confianca: 0.9,
      precisaRevisao: false,
    });

    const resultado = analyzer.analisar([questao]);

    expect(resultado).toEqual([
      {
        questaoId: questao.id,
        numero: 3,
        campo: 'enunciado',
        problema: 'Enunciado possui caracteres suspeitos de OCR.',
        valorAtual: 'Qual alternativa interpreta corretamente o texto � extraído?',
      },
    ]);
  });

  it('deve apontar questão com menos de quatro alternativas', () => {
    const questao = QuestaoImportada.criar({
      numero: 4,
      enunciado: 'Qual alternativa apresenta a interpretação correta do texto?',
      tipoSugerido: TipoQuestaoValor.MULTIPLA_ESCOLHA,
      alternativas: [
        { letra: 'A', texto: 'Primeira alternativa válida.' },
        { letra: 'B', texto: 'Segunda alternativa válida.' },
        { letra: 'C', texto: 'Terceira alternativa válida.' },
      ],
      confianca: 0.9,
      precisaRevisao: false,
    });

    const resultado = analyzer.analisar([questao]);

    expect(resultado).toEqual([
      {
        questaoId: questao.id,
        numero: 4,
        campo: 'alternativas',
        problema: 'Questão possui apenas 3 alternativas.',
        valorAtual:
          'A: Primeira alternativa válida. | B: Segunda alternativa válida. | C: Terceira alternativa válida.',
      },
    ]);
  });

  it('deve apontar questão com mais de cinco alternativas', () => {
    const questao = QuestaoImportada.criar({
      numero: 5,
      enunciado: 'Qual alternativa apresenta a interpretação correta do texto?',
      tipoSugerido: TipoQuestaoValor.MULTIPLA_ESCOLHA,
      alternativas: [
        { letra: 'A', texto: 'Primeira alternativa válida.' },
        { letra: 'B', texto: 'Segunda alternativa válida.' },
        { letra: 'C', texto: 'Terceira alternativa válida.' },
        { letra: 'D', texto: 'Quarta alternativa válida.' },
        { letra: 'E', texto: 'Quinta alternativa válida.' },
        { letra: 'F', texto: 'Sexta alternativa suspeita.' },
      ],
      confianca: 0.9,
      precisaRevisao: false,
    });

    const resultado = analyzer.analisar([questao]);

    expect(resultado).toEqual([
      {
        questaoId: questao.id,
        numero: 5,
        campo: 'alternativas',
        problema: 'Questão possui 6 alternativas.',
        valorAtual:
          'A: Primeira alternativa válida. | B: Segunda alternativa válida. | C: Terceira alternativa válida. | D: Quarta alternativa válida. | E: Quinta alternativa válida. | F: Sexta alternativa suspeita.',
      },
    ]);
  });

  it('deve apontar alternativa vazia e alternativa com caracteres suspeitos', () => {
    const questao = QuestaoImportada.criar({
      numero: 6,
      enunciado: 'Qual alternativa apresenta a interpretação correta do texto?',
      tipoSugerido: TipoQuestaoValor.MULTIPLA_ESCOLHA,
      alternativas: [
        { letra: 'A', texto: 'Primeira alternativa válida.' },
        { letra: 'B', texto: '   ' },
        { letra: 'C', texto: 'Terceira alternativa com OCR � suspeito.' },
        { letra: 'D', texto: 'Quarta alternativa válida.' },
      ],
      confianca: 0.9,
      precisaRevisao: false,
    });

    const resultado = analyzer.analisar([questao]);

    expect(resultado).toEqual([
      {
        questaoId: questao.id,
        numero: 6,
        campo: 'alternativas',
        problema: 'Alternativa B está vazia.',
      },
      {
        questaoId: questao.id,
        numero: 6,
        campo: 'alternativas',
        problema: 'Alternativa C possui caracteres suspeitos de OCR.',
        valorAtual: 'Terceira alternativa com OCR � suspeito.',
      },
    ]);
  });

  it('deve apontar baixa confiança de importação', () => {
    const questao = QuestaoImportada.criar({
      numero: 7,
      enunciado: 'Qual alternativa apresenta a interpretação correta do texto?',
      tipoSugerido: TipoQuestaoValor.MULTIPLA_ESCOLHA,
      alternativas: [
        { letra: 'A', texto: 'Primeira alternativa válida.' },
        { letra: 'B', texto: 'Segunda alternativa válida.' },
        { letra: 'C', texto: 'Terceira alternativa válida.' },
        { letra: 'D', texto: 'Quarta alternativa válida.' },
      ],
      confianca: 0.65,
      precisaRevisao: true,
    });

    const resultado = analyzer.analisar([questao]);

    expect(resultado).toEqual([
      {
        questaoId: questao.id,
        numero: 7,
        campo: 'confianca',
        problema: 'Questão possui baixa confiança de importação: 0.65.',
        valorAtual: '0.65',
      },
    ]);
  });
});
