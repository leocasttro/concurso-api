import { ImportacaoProva } from '../../domain/entities/importacao-prova.entity';
import { QuestaoImportada } from '../../domain/entities/questao-importada.entity';
import { ImportacaoProvaOrmEntity } from '../persistence/entities/importacao-prova.orm-entity';
import { QuestaoImportadaOrmEntity } from '../persistence/entities/questao-importada.orm-entity';

export class ImportacaoProvaMapper {
  static toDomain(entity: ImportacaoProvaOrmEntity): ImportacaoProva {
    return ImportacaoProva.reconstituir({
      id: entity.id,
      nomeArquivo: entity.nomeArquivo,
      tipoArquivo: entity.tipoArquivo,
      status: entity.status,
      questoes: (entity.questoes ?? []).map((questao) =>
        this.questaoToDomain(questao),
      ),
      erros: entity.erros ?? [],
      avisos: entity.avisos ?? [],
      createdAt: entity.createdAt,
      updateAt: entity.updatedAt,
    });
  }

  static toPersistence(importacao: ImportacaoProva): ImportacaoProvaOrmEntity {
    const entity = new ImportacaoProvaOrmEntity();

    entity.id = importacao.id;
    entity.nomeArquivo = importacao.nomeArquivo;
    entity.tipoArquivo = importacao.tipoArquivo;
    entity.status = importacao.status.valor;
    entity.questoes = importacao.questoes.map((questao) =>
      this.questaoToPersistence(questao, importacao.id),
    );
    entity.erros = importacao.erros;
    entity.avisos = importacao.avisos;
    entity.createdAt = importacao.createdAt;
    entity.updatedAt = importacao.updatedAt;

    return entity;
  }

  private static questaoToDomain(
    entity: QuestaoImportadaOrmEntity,
  ): QuestaoImportada {
    return QuestaoImportada.reconstituir({
      id: entity.id,
      numero: entity.numero,
      enunciado: entity.enunciado,
      tipoSugerido: entity.tipoSugerido,
      alternativas: entity.alternativas ?? [],
      gabarito: entity.gabarito,
      disciplina: entity.disciplina,
      assunto: entity.assunto,
      textoApoio: entity.textoApoio,
      confianca: entity.confianca,
      precisaRevisao: entity.precisaRevisao,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  private static questaoToPersistence(
    questao: QuestaoImportada,
    importacaoId: string,
  ): QuestaoImportadaOrmEntity {
    const entity = new QuestaoImportadaOrmEntity();

    entity.id = questao.id;
    entity.importacaoId = importacaoId;
    entity.numero = questao.numero;
    entity.enunciado = questao.enunciado;
    entity.tipoSugerido = questao.tipoSugerido;
    entity.alternativas = questao.alternativas;
    entity.gabarito = questao.gabarito;
    entity.disciplina = questao.disciplina;
    entity.assunto = questao.assunto;
    entity.textoApoio = questao.textoApoio;
    entity.confianca = questao.confianca;
    entity.precisaRevisao = questao.precisaRevisao;
    entity.createdAt = questao.createdAt;
    entity.updatedAt = questao.updatedAt;

    return entity;
  }
}
