import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoGabaritoValor } from '../../domain/value-objects/gabarito.vo';
import { TipoQuestaoValor } from '../../domain/value-objects/tipo-questao.vo';

class AlternativaDto {
  @IsString()
  @IsNotEmpty()
  texto: string;

  @IsString()
  @IsOptional()
  letra?: string;
}

class GabaritoDto {
  @IsEnum(TipoGabaritoValor)
  tipo: TipoGabaritoValor;

  @IsArray()
  @IsString({ each: true })
  valores: string[];
}

export class CriarQuestaoDto {
  @IsUUID()
  provaId: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  numero?: number;

  @IsString()
  @IsNotEmpty()
  enunciado: string;

  @IsEnum(TipoQuestaoValor)
  tipo: TipoQuestaoValor;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AlternativaDto)
  @IsOptional()
  alternativas?: AlternativaDto[];

  @ValidateNested()
  @Type(() => GabaritoDto)
  @IsOptional()
  gabarito?: GabaritoDto;

  @IsString()
  @IsOptional()
  disciplina?: string;

  @IsString()
  @IsOptional()
  assunto?: string;

  @IsString()
  @IsOptional()
  textoApoio?: string;
}
