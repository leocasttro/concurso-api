import { Injectable } from '@nestjs/common';
import {
  ExtrairProvaPdfInput,
  ExtrairProvaPdfOutput,
  ExtratorProvaPdf,
} from '../../application/services/extrator-prova-pdf';
import { ConfigService } from '@nestjs/config';
import { QuestaoImportada } from '../../domain/entities/questao-importada.entity';
import { TipoQuestaoValor } from '../../../questoes/domain/value-objects/tipo-questao.vo';

type MicroserviceAlternativaResponse = {
  letra: string | null;
  texto: string;
};

type MicroserviceQuestaoResponse = {
  numero: number | null;
  enunciado: string;
  tipo_sugerido: string;
  alternativas: MicroserviceAlternativaResponse[];
  texto_apoio: string | null;
  disciplina: string | null;
  assunto: string | null;
  confianca: number;
  precisa_revisao: boolean;
  avisos: string[];
};

type MicroserviceQuestoesResponse = {
  questoes: MicroserviceQuestaoResponse[];
  avisos: string[];
  erros: string[];
};

@Injectable()
export class HttpExtratorProvaPdfService implements ExtratorProvaPdf {
  constructor(private readonly configService: ConfigService) {}

  async extrair(input: ExtrairProvaPdfInput): Promise<ExtrairProvaPdfOutput> {
    const baseUrl =
      this.configService.get<string>('PDF_EXTRACTOR_URL') ??
      'http://localhost:8000';

    const formData = new FormData();

    formData.append(
      'file',
      new Blob([new Uint8Array(input.fileBuffer)], {
        type: input.tipoArquivo,
      }),
      input.nomeArquivo,
    );

    const response = await fetch(`${baseUrl}/extrair/questoes`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const detalhe = await response.text();

      throw new Error(
        `Falha ao extrair prova no microserviço. Status ${response.status}. ${detalhe}`,
      );
    }

    const body: unknown = await response.json();

    if (!this.isMicroserviceQuestoesResponse(body)) {
      throw new Error('Resposta inválida ao microserviço de extração');
    }

    return {
      questoes: body.questoes.map((questao) =>
        QuestaoImportada.criar({
          numero: questao.numero ?? undefined,
          enunciado: questao.enunciado,
          tipoSugerido: this.mapearTipoQuestao(questao.tipo_sugerido),
          alternativas: questao.alternativas.map((alternativa) => ({
            letra: alternativa.letra ?? undefined,
            texto: alternativa.texto,
          })),
          disciplina: questao.disciplina ?? undefined,
          assunto: questao.assunto ?? undefined,
          textoApoio: questao.texto_apoio ?? undefined,
          confianca: questao.confianca,
          precisaRevisao: questao.precisa_revisao,
        }),
      ),
      avisos: body.avisos,
      erros: body.erros,
    };
  }

  private mapearTipoQuestao(tipo: string): TipoQuestaoValor | undefined {
    const tiposValidos = Object.values(TipoQuestaoValor);

    if (tiposValidos.includes(tipo as TipoQuestaoValor)) {
      return tipo as TipoQuestaoValor;
    }

    return undefined;
  }

  private isMicroserviceQuestoesResponse(
    value: unknown,
  ): value is MicroserviceQuestoesResponse {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const response = value as Partial<MicroserviceQuestoesResponse>;

    return (
      Array.isArray(response.questoes) &&
      Array.isArray(response.avisos) &&
      Array.isArray(response.erros)
    );
  }
}
