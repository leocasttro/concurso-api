import { QuestaoOrmEntity } from '../persistence/entities/questao.orm-entity';
import { Questao } from '../../domain/entities/questao.entity';
import { AlternativaOrmEntity } from '../persistence/entities/alternativa.orm-entity';
import { Alternativa } from '../../domain/entities/alternativa.entity';
import {
  Gabarito,
  GabaritoCertoErradoValor,
  TipoGabaritoValor,
} from '../../domain/value-objects/gabarito.vo';

export class QuestaoMapper {
  static toDomain(entity: QuestaoOrmEntity): Questao {
    return Questao.reconstituir({
      id: entity.id,
      provaId: entity.provaId,
      numero: entity.numero,
      enunciado: entity.enunciado,
      tipo: entity.tipo,
      status: entity.status,
      alternativas: (entity.alternativas ?? []).map((alternativa) =>
        this.alternativaToDomain(alternativa),
      ),
      gabarito: this.gabaritoToDomain(entity),
      disciplina: entity.disciplina,
      assunto: entity.assunto,
      textoApoio: entity.textoApoio,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toPersistence(questao: Questao): QuestaoOrmEntity {
    const entity = new QuestaoOrmEntity();

    entity.id = questao.id;
    entity.provaId = questao.provaId;
    entity.numero = questao.numero;
    entity.enunciado = questao.enunciado;
    entity.tipo = questao.tipo.valor;
    entity.status = questao.status.valor;
    entity.alternativas = questao.alternativas.map((alternativa) =>
      this.alternativaToPersistence(alternativa, questao.id),
    );
    entity.gabaritoTipo = questao.gabarito?.tipo;
    entity.gabaritoValores = questao.gabarito?.valores;
    entity.disciplina = questao.disciplina;
    entity.assunto = questao.assunto;
    entity.textoApoio = questao.textoApoio;
    entity.createdAt = questao.createdAt;
    entity.updatedAt = questao.updatedAt;

    return entity;
  }

  private static alternativaToDomain(
    entity: AlternativaOrmEntity,
  ): Alternativa {
    return Alternativa.reconstituir({
      id: entity.id,
      texto: entity.texto,
      letra: entity.letra,
    });
  }

  private static alternativaToPersistence(
    alternativa: Alternativa,
    questaoId: string,
  ): AlternativaOrmEntity {
    const entity = new AlternativaOrmEntity();

    entity.id = alternativa.id;
    entity.questaoId = questaoId;
    entity.texto = alternativa.texto;
    entity.letra = alternativa.letra;

    return entity;
  }

  private static gabaritoToDomain(
    entity: QuestaoOrmEntity,
  ): Gabarito | undefined {
    if (!entity.gabaritoTipo || !entity.gabaritoValores?.length) {
      return undefined;
    }

    if (entity.gabaritoTipo === TipoGabaritoValor.ALTERNATIVAS) {
      return Gabarito.alternativas(entity.gabaritoValores);
    }

    if (entity.gabaritoTipo === TipoGabaritoValor.CERTO_ERRADO) {
      return Gabarito.certoErrado(
        entity.gabaritoValores[0] as GabaritoCertoErradoValor,
      );
    }

    if (entity.gabaritoTipo === TipoGabaritoValor.DISCURSIVO) {
      return Gabarito.discursivo(entity.gabaritoValores[0]);
    }

    return undefined;
  }
}
