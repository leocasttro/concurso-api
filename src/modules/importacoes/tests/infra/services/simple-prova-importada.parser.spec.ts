import { TipoQuestaoValor } from '../../../../questoes/domain/value-objects/tipo-questao.vo';
import { SimpleProvaImportadaParser } from '../../../infra/services/simple-prova-importada.parser';

describe('SimpleProvaImportadaParser', () => {
  let parser: SimpleProvaImportadaParser;

  beforeEach(() => {
    parser = new SimpleProvaImportadaParser();
  });

  it('deve retornar erro quando o texto estiver vazio', async () => {
    const resultado = await parser.parse({
      texto: '   ',
    });

    expect(resultado.questoes).toEqual([]);
    expect(resultado.avisos).toEqual([]);
    expect(resultado.erros).toEqual(['Texto da prova está vazio.']);
  });

  it('deve retornar erro quando nenhuma questão for identificada', async () => {
    const resultado = await parser.parse({
      texto: 'Este é apenas um texto sem marcação de questão.',
    });

    expect(resultado.questoes).toEqual([]);
    expect(resultado.avisos).toEqual([]);
    expect(resultado.erros).toEqual([
      'Nenhuma questão foi identificada no texto.',
    ]);
  });

  it('deve extrair uma questão com alternativas', async () => {
    const texto = `
      QUESTÃO 1 -
      Qual alternativa está correta?
      A) Primeira alternativa
      B) Segunda alternativa
      C) Terceira alternativa
      `;

    const resultado = await parser.parse({ texto });

    expect(resultado.erros).toEqual([]);
    expect(resultado.questoes).toHaveLength(1);

    const questao = resultado.questoes[0];

    expect(questao.numero).toBe(1);
    expect(questao.enunciado).toBe('Qual alternativa está correta?');
    expect(questao.tipoSugerido).toBe(TipoQuestaoValor.MULTIPLA_ESCOLHA);
    expect(questao.alternativas).toEqual([
      {
        letra: 'A',
        texto: 'Primeira alternativa',
      },
      {
        letra: 'B',
        texto: 'Segunda alternativa',
      },
      {
        letra: 'C',
        texto: 'Terceira alternativa',
      },
    ]);
    expect(questao.confianca).toBe(0.75);
    expect(questao.precisaRevisao).toBe(true);
    expect(resultado.avisos).toEqual(['Questão 1 precisa de revisão.']);
  });

  it('deve extrair múltiplas questões', async () => {
    const texto = `
      QUESTÃO 1 -
      Texto da primeira questão.
      A) Alternativa A
      B) Alternativa B
      
      Questão 2 -
      Texto da segunda questão.
      A) Alternativa A
      B) Alternativa B
      `;

    const resultado = await parser.parse({ texto });

    expect(resultado.erros).toEqual([]);
    expect(resultado.questoes).toHaveLength(2);
    expect(resultado.questoes[0].numero).toBe(1);
    expect(resultado.questoes[0].enunciado).toBe('Texto da primeira questão.');
    expect(resultado.questoes[1].numero).toBe(2);
    expect(resultado.questoes[1].enunciado).toBe('Texto da segunda questão.');
  });

  it('deve sugerir CERTO_ERRADO quando a questão não tiver alternativas', async () => {
    const texto = `
      QUESTÃO 10 -
      A Constituição Federal de 1988 é rígida.
      `;

    const resultado = await parser.parse({ texto });

    expect(resultado.erros).toEqual([]);
    expect(resultado.questoes).toHaveLength(1);
    expect(resultado.questoes[0].numero).toBe(10);
    expect(resultado.questoes[0].tipoSugerido).toBe(
      TipoQuestaoValor.CERTO_ERRADO,
    );
    expect(resultado.questoes[0].alternativas).toEqual([]);
    expect(resultado.questoes[0].confianca).toBe(0.5);
    expect(resultado.questoes[0].precisaRevisao).toBe(true);
  });

  it('deve aceitar QUESTAO sem acento', async () => {
    const texto = `
      QUESTAO 3 -
      Texto da questão sem acento.
      A) Alternativa A
      B) Alternativa B
      `;

    const resultado = await parser.parse({ texto });

    expect(resultado.erros).toEqual([]);
    expect(resultado.questoes).toHaveLength(1);
    expect(resultado.questoes[0].numero).toBe(3);
    expect(resultado.questoes[0].enunciado).toBe(
      'Texto da questão sem acento.',
    );
  });

  it('deve aceitar alternativas com ponto', async () => {
    const texto = `
      QUESTÃO 4 -
      Texto da questão.
      A. Alternativa A
      B. Alternativa B
      `;

    const resultado = await parser.parse({ texto });

    expect(resultado.erros).toEqual([]);
    expect(resultado.questoes).toHaveLength(1);
    expect(resultado.questoes[0].alternativas).toEqual([
      {
        letra: 'A',
        texto: 'Alternativa A',
      },
      {
        letra: 'B',
        texto: 'Alternativa B',
      },
    ]);
  });
});
