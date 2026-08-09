import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

class RespostaGabaritoImportacaoDto {
  @IsInt()
  @Min(1)
  numero!: number;

  @IsString()
  @IsNotEmpty()
  valor!: string;
}

export class AplicarGabaritoImportacaoDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RespostaGabaritoImportacaoDto)
  respostas!: RespostaGabaritoImportacaoDto[];
}
