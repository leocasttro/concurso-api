import { ConfigService } from '@nestjs/config';

import { TipoQuestaoValor } from '../../../../questoes/domain/value-objects/tipo-questao.vo';
import { HttpExtratorProvaPdfService } from '../../../infra/services/http-extrator-prova-pdf.service';

describe('HttpExtratorProvaPdfService', () => {
  let service: HttpExtratorProvaPdfService;
  let fetchMock: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
    global.fetch = fetchMock;

    const configService = {
      get: jest.fn().mockReturnValue('http://extractor.test'),
    } as unknown as ConfigService;

    service = new HttpExtratorProvaPdfService(configService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve chamar o microserviço e mapear questões importadas', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        questoes: [
          {
            numero: 1,
            enunciado: 'Enunciado extraído pelo microserviço',
            tipo_sugerido: 'MULTIPLA_ESCOLHA',
            alternativas: [
              {
                letra: 'A',
                texto: 'Alternativa A',
              },
              {
                letra: 'B',
                texto: 'Alternativa B',
              },
            ],
            texto_apoio: 'Texto de apoio da questão.',
            disciplina: 'Português',
            assunto: 'Interpretação de texto',
            confianca: 0.9,
            precisa_revisao: false,
            avisos: [],
          },
        ],
        avisos: [],
        erros: [],
      }),
    } as unknown as Response);

    const fileBuffer = Buffer.from('pdf fake');

    const resultado = await service.extrair({
      nomeArquivo: 'prova.pdf',
      tipoArquivo: 'application/pdf',
      fileBuffer,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://extractor.test/extrair/questoes',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      }),
    );

    expect(resultado.avisos).toEqual([]);
    expect(resultado.erros).toEqual([]);
    expect(resultado.questoes).toHaveLength(1);
    expect(resultado.questoes[0].numero).toBe(1);
    expect(resultado.questoes[0].enunciado).toBe(
      'Enunciado extraído pelo microserviço',
    );
    expect(resultado.questoes[0].tipoSugerido).toBe(
      TipoQuestaoValor.MULTIPLA_ESCOLHA,
    );
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
    expect(resultado.questoes[0].textoApoio).toBe(
      'Texto de apoio da questão.',
    );
    expect(resultado.questoes[0].disciplina).toBe('Português');
    expect(resultado.questoes[0].assunto).toBe('Interpretação de texto');
    expect(resultado.questoes[0].confianca).toBe(0.9);
    expect(resultado.questoes[0].precisaRevisao).toBe(false);
  });

  it('deve retornar avisos e erros vindos do microserviço', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        questoes: [],
        avisos: ['Questão 10 precisa de revisão.'],
        erros: ['Nenhuma questão foi identificada.'],
      }),
    } as unknown as Response);

    const resultado = await service.extrair({
      nomeArquivo: 'prova.pdf',
      tipoArquivo: 'application/pdf',
      fileBuffer: Buffer.from('pdf fake'),
    });

    expect(resultado.questoes).toEqual([]);
    expect(resultado.avisos).toEqual(['Questão 10 precisa de revisão.']);
    expect(resultado.erros).toEqual(['Nenhuma questão foi identificada.']);
  });

  it('deve lançar erro quando o microserviço retornar falha HTTP', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      text: jest.fn().mockResolvedValue('erro interno'),
    } as unknown as Response);

    await expect(
      service.extrair({
        nomeArquivo: 'prova.pdf',
        tipoArquivo: 'application/pdf',
        fileBuffer: Buffer.from('pdf fake'),
      }),
    ).rejects.toThrow(
      'Falha ao extrair prova no microserviço. Status 500. erro interno',
    );
  });

  it('deve lançar erro quando a resposta do microserviço for inválida', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        data: [],
      }),
    } as unknown as Response);

    await expect(
      service.extrair({
        nomeArquivo: 'prova.pdf',
        tipoArquivo: 'application/pdf',
        fileBuffer: Buffer.from('pdf fake'),
      }),
    ).rejects.toThrow('Resposta inválida ao microserviço de extração');
  });
});
