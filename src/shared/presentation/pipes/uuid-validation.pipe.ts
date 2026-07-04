import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class UuidValidationPipe implements PipeTransform<string, string> {
  private readonly uuidRegex =
    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;

  transform(value: string): string {
    if (!this.uuidRegex.test(value)) {
      throw new BadRequestException('ID inválido.');
    }
    return value;
  }
}
