import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class AtualizarProvaDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  cargo: string;

  @IsString()
  @IsNotEmpty()
  banca: string;

  @IsInt()
  @Min(1900)
  ano: number;

  @IsString()
  @IsNotEmpty()
  categoria: string;
}
