export type PdfTextExtractorInput = {
  fileBuffer: Buffer;
};

export interface PdfTextExtractor {
  extract(input: PdfTextExtractorInput): Promise<string>;
}
