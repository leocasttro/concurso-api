import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { StatusProvaValor } from '../../domain/value-objects/status-prova.vo';

export class ListarProvasQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  banca?: string;

  @IsOptional()
  @IsString()
  cargo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  ano?: number;

  @IsOptional()
  @IsEnum(StatusProvaValor)
  status?: StatusProvaValor;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
