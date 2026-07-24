import type { Repository } from 'typeorm';

import { ImportacaoProva } from '../../../../domain/entities/importacao-prova.entity';
import { QuestaoImportada } from '../../../../domain/entities/questao-importada.entity';
import { StatusImportacaoValor } from '../../../../domain/value-objects/status-importacao.vo';
import { ImportacaoProvaOrmEntity } from '../../../../infra/persistence/entities/importacao-prova.orm-entity';
import { QuestaoImportadaOrmEntity } from '../../../../infra/persistence/entities/questao-importada.orm-entity';
import { TypeOrmImportacaoProvaRepository } from '../../../../infra/persistence/repositories/typeorm-importacao-prova.repository';
import { TipoQuestaoValor } from '../../../../../questoes/domain/value-objects/tipo-questao.vo';

describe('TypeOrmImportacaoProvaRepository', () => {
  let repository: TypeOrmImportacaoProvaRepository;
  let typeOrmRepository: jest.Mocked<
    Pick<Repository<ImportacaoProvaOrmEntity>, 'save' | 'findOne'>
  >;

  beforeEach(() => {
    typeOrmRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
    };

    repository = new TypeOrmImportacaoProvaRepository(
      typeOrmRepository as unknown as Repository<ImportacaoProvaOrmEntity>,
    );
  });

  it('deve salvar uma importação de prova', async () => {
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
      createdAt: new Date(),
    });

    const importacao = ImportacaoProva.reconstituir({
      id: '550e8400-e29b-41d4-a716-446655440000',
      nomeArquivo: 'prova.pdf',
      tipoArquivo: 'application/pdf',
      status: StatusImportacaoValor.AGUARDANDO_REVISAO,
      questoes: [questao],
      erros: [],
      avisos: ['Questão 1 precisa de revisão.'],
      createdAt: new Date(),
    });

    typeOrmRepository.save.mockImplementation((entity) =>
      Promise.resolve(entity as ImportacaoProvaOrmEntity),
    );

    const resultado = await repository.salvar(importacao);

    expect(typeOrmRepository.save).toHaveBeenCalledTimes(1);
    expect(typeOrmRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: importacao.id,
        nomeArquivo: 'prova.pdf',
        tipoArquivo: 'application/pdf',
        status: StatusImportacaoValor.AGUARDANDO_REVISAO,
        erros: [],
        avisos: ['Questão 1 precisa de revisão.'],
      }),
    );

    expect(resultado).toBeInstanceOf(ImportacaoProva);
    expect(resultado.id).toBe(importacao.id);
    expect(resultado.questoes).toHaveLength(1);
  });

  it('deve buscar uma importação por id quando ela existir', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';

    const questaoEntity = new QuestaoImportadaOrmEntity();
    questaoEntity.id = '550e8400-e29b-41d4-a716-446655440001';
    questaoEntity.importacaoId = id;
    questaoEntity.numero = 1;
    questaoEntity.enunciado = 'Texto da questão importada';
    questaoEntity.tipoSugerido = TipoQuestaoValor.MULTIPLA_ESCOLHA;
    questaoEntity.alternativas = [
      {
        letra: 'A',
        texto: 'Alternativa A',
      },
    ];
    questaoEntity.gabarito = undefined;
    questaoEntity.disciplina = 'Português';
    questaoEntity.assunto = 'Interpretação de texto';
    questaoEntity.textoApoio = undefined;
    questaoEntity.confianca = 0.75;
    questaoEntity.precisaRevisao = true;
    questaoEntity.createdAt = new Date();

    const entity = new ImportacaoProvaOrmEntity();
    entity.id = id;
    entity.nomeArquivo = 'prova.pdf';
    entity.tipoArquivo = 'application/pdf';
    entity.status = StatusImportacaoValor.AGUARDANDO_REVISAO;
    entity.questoes = [questaoEntity];
    entity.erros = [];
    entity.avisos = ['Questão 1 precisa de revisão.'];
    entity.createdAt = new Date();

    typeOrmRepository.findOne.mockResolvedValue(entity);

    const resultado = await repository.buscarPorId(id);

    expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
      where: { id },
    });

    expect(resultado).toBeInstanceOf(ImportacaoProva);
    expect(resultado?.id).toBe(id);
    expect(resultado?.questoes).toHaveLength(1);
    expect(resultado?.questoes[0]).toBeInstanceOf(QuestaoImportada);
  });

  it('deve retornar null quando a importação não existir', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';

    typeOrmRepository.findOne.mockResolvedValue(null);

    const resultado = await repository.buscarPorId(id);

    expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
      where: { id },
    });

    expect(resultado).toBeNull();
  });
});
