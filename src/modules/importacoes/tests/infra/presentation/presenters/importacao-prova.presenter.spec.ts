import { QuestaoImportada } from '../../../../domain/entities/questao-importada.entity';
import { TipoQuestaoValor } from '../../../../../questoes/domain/value-objects/tipo-questao.vo';
import { ImportacaoProva } from '../../../../domain/entities/importacao-prova.entity';
import { StatusImportacaoValor } from '../../../../domain/value-objects/status-importacao.vo';
import { ImportacaoProvaPresenter } from '../../../../presentation/presenters/importacao-prova.presenter';

describe('ImportacaoProvaPresenter', () => {
  it('deve converter uma importação de prova para resposta HTTP', () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    const updatedAt = new Date('2024-01-02T00:00:00.000Z');

    const questao = QuestaoImportada.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440001',
      numero: 1,
      enunciado: 'Texto da questão importada',
      tipoSugerido: TipoQuestaoValor.MULTIPLA_ESCOLHA,
      alternativas: [
        {
          letra: 'A',
          texto: 'Alternativa A',
        },
      ],
      gabarito: undefined,
      disciplina: 'Português',
      assunto: 'Interpretação de texto',
      textoApoio: undefined,
      confianca: 0.75,
      precisaRevisao: true,
      createdAt,
      updatedAt,
    });

    const importacao = ImportacaoProva.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      nomeArquivo: 'prova.pdf',
      tipoArquivo: 'application/pdf',
      status: StatusImportacaoValor.AGUARDANDO_REVISAO,
      questoes: [questao],
      erros: [],
      avisos: ['Questão 1 precisa de revisão.'],
      createdAt,
      updateAt: updatedAt,
    });

    const resultado = ImportacaoProvaPresenter.toHTTP(importacao);

    expect(resultado).toEqual({
      id: '550e8400-e29b-41d4-a716-446655440000',
      nomeArquivo: 'prova.pdf',
      tipoArquivo: 'application/pdf',
      status: StatusImportacaoValor.AGUARDANDO_REVISAO,
      questoes: [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          numero: 1,
          enunciado: 'Texto da questão importada',
          tipoSugerido: TipoQuestaoValor.MULTIPLA_ESCOLHA,
          alternativas: [
            {
              letra: 'A',
              texto: 'Alternativa A',
            },
          ],
          gabarito: undefined,
          disciplina: 'Português',
          assunto: 'Interpretação de texto',
          textoApoio: undefined,
          confianca: 0.75,
          precisaRevisao: true,
          createdAt,
          updatedAt,
        },
      ],
      erros: [],
      avisos: ['Questão 1 precisa de revisão.'],
      createdAt,
      updatedAt,
    });
  });

  it('deve retornar lista vazia quando a importação não possuir questões', () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');

    const importacao = ImportacaoProva.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      nomeArquivo: 'prova.pdf',
      tipoArquivo: 'application/pdf',
      status: StatusImportacaoValor.FALHOU,
      questoes: [],
      erros: ['Não foi possível extrair questões.'],
      avisos: [],
      createdAt,
    });

    const resultado = ImportacaoProvaPresenter.toHTTP(importacao);

    expect(resultado.questoes).toEqual([]);
    expect(resultado.erros).toEqual(['Não foi possível extrair questões.']);
    expect(resultado.status).toBe(StatusImportacaoValor.FALHOU);
  });
});
