import { Alternativa } from '../../../domain/entities/alternativa.entity';
import { QuestaoException } from '../../../domain/exceptions/questao.exception';

describe('Alternativa', () => {
  it('deve criar um alternativa válida', () => {
    const alternativa = Alternativa.criar({
      letra: 'a',
      texto: 'Texto da alternativa A',
    });

    expect(alternativa.id).toBeDefined();
    expect(alternativa.letra).toBe('A');
    expect(alternativa.texto).toBe('Texto da alternativa A');
  });

  it('deve criar alternativa sem letra', () => {
    const alternativa = Alternativa.criar({
      texto: 'Alternativa sem letra detectada na importação',
    });

    expect(alternativa.id).toBeDefined();
    expect(alternativa.letra).toBeUndefined();
    expect(alternativa.texto).toBe(
      'Alternativa sem letra detectada na importação',
    );
  });

  it('deve remover espaços do texto e normalizar a letra', () => {
    const alternativa = Alternativa.criar({
      letra: ' b ',
      texto: ' Texto da alternativa B ',
    });

    expect(alternativa.letra).toBe('B');
    expect(alternativa.texto).toBe('Texto da alternativa B');
  });

  it('deve reconstituir uma alternativa existente', () => {
    const alternativa = Alternativa.reconstituir({
      id: 'alternativa-1',
      letra: 'c',
      texto: 'Texto salvo',
    });

    expect(alternativa.id).toBe('alternativa-1');
    expect(alternativa.letra).toBe('C');
    expect(alternativa.texto).toBe('Texto salvo');
  });

  it('deve lançar QuestaoException quando o texto for vazio', () => {
    expect(() =>
      Alternativa.criar({
        texto: '',
      }),
    ).toThrow(QuestaoException);
  });

  it('deve lançar QuestaoException quando o texto tiver apenas espaço', () => {
    expect(() =>
      Alternativa.criar({
        texto: '  ',
      }),
    ).toThrow(QuestaoException);
  });
});
