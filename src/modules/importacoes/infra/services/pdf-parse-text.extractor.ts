import { PDFParse } from 'pdf-parse';
import type { PdfTextExtractor } from '../../application/services/pdf-text-extractor';

export class PdfParseTextExtractor implements PdfTextExtractor {
  async extract(input: { fileBuffer: Buffer }): Promise<string> {
    const parser = new PDFParse({
      data: input.fileBuffer,
    });

    const result = await parser.getText();

    await parser.destroy();

    return result.text.trim();
  }
}
