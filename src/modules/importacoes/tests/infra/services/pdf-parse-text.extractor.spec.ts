import { PDFParse } from 'pdf-parse';

import { PdfParseTextExtractor } from '../../../infra/services/pdf-parse-text.extractor';

const mockGetText = jest.fn();
const mockDestroy = jest.fn();

jest.mock('pdf-parse', () => ({
  PDFParse: jest.fn().mockImplementation(() => ({
    getText: mockGetText,
    destroy: mockDestroy,
  })),
}));

describe('PdfParseTextExtractor', () => {
  let extractor: PdfParseTextExtractor;

  beforeEach(() => {
    jest.clearAllMocks();

    extractor = new PdfParseTextExtractor();
  });

  it('deve extrair texto de um buffer PDF', async () => {
    const fileBuffer = Buffer.from('conteudo do pdf');

    mockGetText.mockResolvedValue({
      text: '  Texto extraído do PDF  ',
    });

    const resultado = await extractor.extract({ fileBuffer });

    expect(PDFParse).toHaveBeenCalledWith({
      data: fileBuffer,
    });
    expect(mockGetText).toHaveBeenCalledTimes(1);
    expect(mockDestroy).toHaveBeenCalledTimes(1);
    expect(resultado).toBe('Texto extraído do PDF');
  });
});
