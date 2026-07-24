import { ImportacaoProva } from '../../../domain/entities/importacao-prova.entity';
import { QuestaoImportada } from '../../../domain/entities/questao-importada.entity';
import { StatusImportacaoValor } from '../../../domain/value-objects/status-importacao.vo';
import { ImportacaoProvaMapper } from '../../../infra/mappers/importacao-prova.mapper';
import { ImportacaoProvaOrmEntity } from '../../../infra/persistence/entities/importacao-prova.orm-entity';
import { QuestaoImportadaOrmEntity } from '../../../infra/persistence/entities/questao-importada.orm-entity';
import { TipoQuestaoValor } from '../../../../questoes/domain/value-objects/tipo-questao.vo';

describe('ImportacaoProvaMapper', () => {
  it('deve converter ImportacaoProvaOrmEntity para domínio', () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    const updatedAt = new Date('2024-01-02T00:00:00.000Z');

    const questaoEntity = new QuestaoImportadaOrmEntity();
    questaoEntity.id = '550e8400-e29b-41d4-a716-446655440001';
    questaoEntity.importacaoId = '550e8400-e29b-41d4-a716-446655440000';
    questaoEntity.numero = 1;
    questaoEntity.enunciado = 'Questão importada';
    questaoEntity.tipoSugerido = TipoQuestaoValor.CERTO_ERRADO;
    questaoEntity.alternativas = [];
    questaoEntity.gabarito = undefined;
    questaoEntity.disciplina = 'Direito Constitucional';
    questaoEntity.assunto = 'Constituição';
    questaoEntity.textoApoio = 'Texto de apoio';
    questaoEntity.confianca = 0.75;
    questaoEntity.precisaRevisao = true;
    questaoEntity.createdAt = createdAt;
    questaoEntity.updatedAt = updatedAt;

    const entity = new ImportacaoProvaOrmEntity();
    entity.id = '550e8400-e29b-41d4-a716-446655440000';
    entity.nomeArquivo = 'prova.pdf';
    entity.tipoArquivo = 'application/pdf';
    entity.status = StatusImportacaoValor.AGUARDANDO_REVISAO;
    entity.questoes = [questaoEntity];
    entity.erros = [];
    entity.avisos = ['Questão 1 precisa de revisão.'];
    entity.createdAt = createdAt;
    entity.updatedAt = updatedAt;

    const importacao = ImportacaoProvaMapper.toDomain(entity);

    expect(importacao).toBeInstanceOf(ImportacaoProva);
    expect(importacao.id).toBe(entity.id);
    expect(importacao.nomeArquivo).toBe('prova.pdf');
    expect(importacao.tipoArquivo).toBe('application/pdf');
    expect(importacao.status.valor).toBe(
      StatusImportacaoValor.AGUARDANDO_REVISAO,
    );
    expect(importacao.questoes).toHaveLength(1);
    expect(importacao.questoes[0]).toBeInstanceOf(QuestaoImportada);
    expect(importacao.questoes[0].numero).toBe(1);
    expect(importacao.questoes[0].enunciado).toBe('Questão importada');
    expect(importacao.avisos).toEqual(['Questão 1 precisa de revisão.']);
    expect(importacao.createdAt).toBe(createdAt);
    expect(importacao.updatedAt).toBe(updatedAt);
  });

  it('deve converter ImportacaoProva de domínio para ImportacaoProvaOrmEntity', () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    const updatedAt = new Date('2024-01-02T00:00:00.000Z');

    const questao = QuestaoImportada.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440001',
      numero: 1,
      enunciado: 'Questão importada',
      tipoSugerido: TipoQuestaoValor.CERTO_ERRADO,
      alternativas: [],
      gabarito: undefined,
      disciplina: 'Direito Constitucional',
      assunto: 'Constituição',
      textoApoio: 'Texto de apoio',
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

    const entity = ImportacaoProvaMapper.toPersistence(importacao);

    expect(entity).toBeInstanceOf(ImportacaoProvaOrmEntity);
    expect(entity.id).toBe(importacao.id);
    expect(entity.nomeArquivo).toBe('prova.pdf');
    expect(entity.tipoArquivo).toBe('application/pdf');
    expect(entity.status).toBe(StatusImportacaoValor.AGUARDANDO_REVISAO);
    expect(entity.questoes).toHaveLength(1);
    expect(entity.questoes[0]).toBeInstanceOf(QuestaoImportadaOrmEntity);
    expect(entity.questoes[0].importacaoId).toBe(importacao.id);
    expect(entity.questoes[0].numero).toBe(1);
    expect(entity.questoes[0].enunciado).toBe('Questão importada');
    expect(entity.avisos).toEqual(['Questão 1 precisa de revisão.']);
    expect(entity.createdAt).toBe(createdAt);
    expect(entity.updatedAt).toBe(updatedAt);
  });
});
