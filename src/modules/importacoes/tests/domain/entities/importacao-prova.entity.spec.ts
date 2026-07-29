import { ImportacaoProva } from '../../../domain/entities/importacao-prova.entity';
import { QuestaoImportada } from '../../../domain/entities/questao-importada.entity';
import { ImportacaoException } from '../../../domain/exceptions/importacao.exception';
import { StatusImportacaoValor } from '../../../domain/value-objects/status-importacao.vo';
import { TipoQuestaoValor } from '../../../../questoes/domain/value-objects/tipo-questao.vo';

describe('ImportacaoProva', () => {
  it('deve criar uma importação pendente', () => {
    const importacao = ImportacaoProva.criar({
      nomeArquivo: 'prova.pdf',
      tipoArquivo: 'application/pdf',
    });

    expect(importacao.id).toBeDefined();
    expect(importacao.nomeArquivo).toBe('prova.pdf');
    expect(importacao.tipoArquivo).toBe('application/pdf');
    expect(importacao.status.valor).toBe(StatusImportacaoValor.PENDENTE);
    expect(importacao.questoes).toEqual([]);
    expect(importacao.erros).toEqual([]);
    expect(importacao.avisos).toEqual([]);
  });

  it('deve impedir criação sem nome do arquivo', () => {
    expect(() =>
      ImportacaoProva.criar({
        nomeArquivo: '',
        tipoArquivo: 'application/pdf',
      }),
    ).toThrow(ImportacaoException);
  });

  it('deve iniciar processamento', () => {
    const importacao = ImportacaoProva.criar({
      nomeArquivo: 'prova.pdf',
      tipoArquivo: 'application/pdf',
    });

    importacao.iniciarProcessamento();

    expect(importacao.status.valor).toBe(StatusImportacaoValor.PROCESSANDO);
  });

  it('deve adicionar questão importada', () => {
    const importacao = ImportacaoProva.criar({
      nomeArquivo: 'prova.pdf',
      tipoArquivo: 'application/pdf',
    });

    const questao = QuestaoImportada.criar({
      numero: 1,
      enunciado: 'Questão importada',
      tipoSugerido: TipoQuestaoValor.CERTO_ERRADO,
      confianca: 0.95,
    });

    importacao.adicionarQuestao(questao);

    expect(importacao.questoes).toHaveLength(1);
    expect(importacao.questoes[0]).toBe(questao);
  });

  it('deve finalizar como concluída quando não houver avisos, erros ou revisão', () => {
    const importacao = ImportacaoProva.criar({
      nomeArquivo: 'prova.pdf',
      tipoArquivo: 'application/pdf',
    });

    const questao = QuestaoImportada.criar({
      numero: 1,
      enunciado: 'Questão importada',
      tipoSugerido: TipoQuestaoValor.CERTO_ERRADO,
      confianca: 0.95,
      precisaRevisao: false,
    });

    importacao.adicionarQuestao(questao);
    importacao.finalizarProcessamento();

    expect(importacao.status.valor).toBe(StatusImportacaoValor.CONCLUIDA);
  });

  it('deve finalizar aguardando revisão quando questão precisar revisão', () => {
    const importacao = ImportacaoProva.criar({
      nomeArquivo: 'prova.pdf',
      tipoArquivo: 'application/pdf',
    });

    const questao = QuestaoImportada.criar({
      numero: 1,
      enunciado: 'Questão importada',
      tipoSugerido: TipoQuestaoValor.CERTO_ERRADO,
      confianca: 0.5,
    });

    importacao.adicionarQuestao(questao);
    importacao.finalizarProcessamento();

    expect(importacao.status.valor).toBe(
      StatusImportacaoValor.AGUARDANDO_REVISAO,
    );
  });

  it('deve finalizar como falhou quando tiver erro e nenhuma questão', () => {
    const importacao = ImportacaoProva.criar({
      nomeArquivo: 'prova.pdf',
      tipoArquivo: 'application/pdf',
    });

    importacao.adicionarErro('Não foi possível extrair texto.');
    importacao.finalizarProcessamento();

    expect(importacao.status.valor).toBe(StatusImportacaoValor.FALHOU);
  });

  it('deve impedir cancelar importação concluída', () => {
    const importacao = ImportacaoProva.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      nomeArquivo: 'prova.pdf',
      tipoArquivo: 'application/pdf',
      status: StatusImportacaoValor.CONCLUIDA,
      questoes: [],
      erros: [],
      avisos: [],
      createdAt: new Date(),
    });

    expect(() => importacao.cancelar()).toThrow(ImportacaoException);
  });

  it('deve confirmar importação com questões e sem erros', () => {
    const questao = QuestaoImportada.criar({
      numero: 1,
      enunciado: 'Questão importada',
      tipoSugerido: TipoQuestaoValor.CERTO_ERRADO,
      confianca: 0.95,
      precisaRevisao: false,
    });

    const importacao = ImportacaoProva.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      nomeArquivo: 'prova.pdf',
      tipoArquivo: 'application/pdf',
      status: StatusImportacaoValor.AGUARDANDO_REVISAO,
      questoes: [questao],
      erros: [],
      avisos: [],
      createdAt: new Date(),
    });

    importacao.confirmar();

    expect(importacao.status.valor).toBe(StatusImportacaoValor.CONCLUIDA);
  });

  it('deve impedir confirmar importação sem questões', () => {
    const importacao = ImportacaoProva.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      nomeArquivo: 'prova.pdf',
      tipoArquivo: 'application/pdf',
      status: StatusImportacaoValor.FALHOU,
      questoes: [],
      erros: [],
      avisos: [],
      createdAt: new Date(),
    });

    expect(() => importacao.confirmar()).toThrow(
      new ImportacaoException(
        'Importação sem questões não pode ser confirmada.',
      ),
    );
  });

  it('deve impedir confirmar importação com erros', () => {
    const questao = QuestaoImportada.criar({
      numero: 1,
      enunciado: 'Questão importada',
      tipoSugerido: TipoQuestaoValor.CERTO_ERRADO,
      confianca: 0.95,
      precisaRevisao: false,
    });

    const importacao = ImportacaoProva.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      nomeArquivo: 'prova.pdf',
      tipoArquivo: 'application/pdf',
      status: StatusImportacaoValor.AGUARDANDO_REVISAO,
      questoes: [questao],
      erros: ['Erro na extração.'],
      avisos: [],
      createdAt: new Date(),
    });

    expect(() => importacao.confirmar()).toThrow(
      new ImportacaoException('Importação com erros não pode ser confirmada.'),
    );
  });

  it('deve impedir confirmar importação já concluída', () => {
    const questao = QuestaoImportada.criar({
      numero: 1,
      enunciado: 'Questão importada',
      tipoSugerido: TipoQuestaoValor.CERTO_ERRADO,
      confianca: 0.95,
      precisaRevisao: false,
    });

    const importacao = ImportacaoProva.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      nomeArquivo: 'prova.pdf',
      tipoArquivo: 'application/pdf',
      status: StatusImportacaoValor.CONCLUIDA,
      questoes: [questao],
      erros: [],
      avisos: [],
      createdAt: new Date(),
    });

    expect(() => importacao.confirmar()).toThrow(
      new ImportacaoException('Importação já foi confirmada.'),
    );
  });

  it('deve atualizar questão importada enquanto importação não estiver concluída', () => {
    const questao = QuestaoImportada.criar({
      numero: 1,
      enunciado: 'Questão importada original',
      tipoSugerido: TipoQuestaoValor.CERTO_ERRADO,
      alternativas: [],
      confianca: 0.65,
      precisaRevisao: true,
    });

    const importacao = ImportacaoProva.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      nomeArquivo: 'prova.pdf',
      tipoArquivo: 'application/pdf',
      status: StatusImportacaoValor.AGUARDANDO_REVISAO,
      questoes: [questao],
      erros: [],
      avisos: [],
      createdAt: new Date(),
    });

    const resultado = importacao.atualizarQuestaoImportada(questao.id, {
      enunciado: 'Questão importada corrigida',
      alternativas: [
        {
          letra: 'A',
          texto: 'Alternativa corrigida',
        },
      ],
      disciplina: 'Português',
      precisaRevisao: false,
    });

    expect(resultado).toBe(questao);
    expect(questao.enunciado).toBe('Questão importada corrigida');
    expect(questao.alternativas).toEqual([
      {
        letra: 'A',
        texto: 'Alternativa corrigida',
      },
    ]);
    expect(questao.disciplina).toBe('Português');
    expect(questao.precisaRevisao).toBe(false);
  });

  it('deve impedir atualizar questão importada inexistente', () => {
    const importacao = ImportacaoProva.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      nomeArquivo: 'prova.pdf',
      tipoArquivo: 'application/pdf',
      status: StatusImportacaoValor.AGUARDANDO_REVISAO,
      questoes: [],
      erros: [],
      avisos: [],
      createdAt: new Date(),
    });

    expect(() =>
      importacao.atualizarQuestaoImportada(
        '550e8400-e29b-41d4-a716-446655440001',
        {
          enunciado: 'Questão corrigida',
        },
      ),
    ).toThrow(new ImportacaoException('Questão importada não encontrada.'));
  });

  it('deve impedir atualizar questão importada de importação concluída', () => {
    const questao = QuestaoImportada.criar({
      numero: 1,
      enunciado: 'Questão importada original',
      tipoSugerido: TipoQuestaoValor.CERTO_ERRADO,
      confianca: 0.95,
      precisaRevisao: false,
    });

    const importacao = ImportacaoProva.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      nomeArquivo: 'prova.pdf',
      tipoArquivo: 'application/pdf',
      status: StatusImportacaoValor.CONCLUIDA,
      questoes: [questao],
      erros: [],
      avisos: [],
      createdAt: new Date(),
    });

    expect(() =>
      importacao.atualizarQuestaoImportada(questao.id, {
        enunciado: 'Questão corrigida',
      }),
    ).toThrow(
      new ImportacaoException('Importação concluída não pode ser alterada.'),
    );
  });
});
