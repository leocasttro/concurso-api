import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { TipoQuestaoValor } from '../../../questoes/domain/value-objects/tipo-questao.vo';

class AtualizarAlternativaImportadaDto {
  @IsOptional()
  @IsString()
  letra?: string;

  @IsString()
  texto: string;
}

class AtualizarGabaritoImportadoDto {
  @IsString()
  tipo: string;

  @IsArray()
  @IsString({ each: true })
  valores: string[];
}

export class AtualizarQuestaoImportadaDto {
  @IsOptional()
  @IsString()
  enunciado?: string;

  @IsOptional()
  @IsEnum(TipoQuestaoValor)
  tipoSugerido?: TipoQuestaoValor;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AtualizarAlternativaImportadaDto)
  alternativas?: AtualizarAlternativaImportadaDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => AtualizarGabaritoImportadoDto)
  gabarito?: AtualizarGabaritoImportadoDto;

  @IsOptional()
  @IsString()
  disciplina?: string;

  @IsOptional()
  @IsString()
  assunto?: string;

  @IsOptional()
  @IsString()
  textoApoio?: string;

  @IsOptional()
  @IsBoolean()
  precisaRevisao?: boolean;
}
