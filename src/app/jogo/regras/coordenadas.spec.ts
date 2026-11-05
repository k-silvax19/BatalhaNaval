import { describe, expect, it } from 'vitest';
import { criarCoordenada, ehCoordenadaValida } from './coordenadas';

describe('Coordenadas do tabuleiro', () => {
  it('cria coordenadas válidas e as protege contra mutação', () => {
    const resultado = criarCoordenada(0, 9);

    expect(resultado.valida).toBe(true);
    if (resultado.valida) {
      expect(ehCoordenadaValida(resultado.coordenada)).toBe(true);
      expect(Object.isFrozen(resultado.coordenada)).toBe(true);
    }
  });

  it.each([
    [-1, 0], [10, 0], [0, -1], [0, 10], [1.5, 2], [2, Number.NaN],
  ])('rejeita coordenada inválida %s,%s', (linha, coluna) => {
    const resultado = criarCoordenada(linha, coluna);

    expect(resultado).toEqual({ valida: false, motivo: 'coordenada-invalida' });
    expect(ehCoordenadaValida({ linha, coluna })).toBe(false);
  });
});
