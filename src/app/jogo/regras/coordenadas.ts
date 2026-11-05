import type { Coordenada } from './modelos';

export const DIMENSAO_TABULEIRO = 10;

export type ResultadoCoordenada =
  | Readonly<{ valida: true; coordenada: Coordenada }>
  | Readonly<{ valida: false; motivo: 'coordenada-invalida' }>;

export function criarCoordenada(linha: number, coluna: number): ResultadoCoordenada {
  if (!Number.isInteger(linha) || !Number.isInteger(coluna)
    || linha < 0 || linha >= DIMENSAO_TABULEIRO
    || coluna < 0 || coluna >= DIMENSAO_TABULEIRO) {
    return Object.freeze({ valida: false, motivo: 'coordenada-invalida' });
  }

  return Object.freeze({
    valida: true,
    coordenada: Object.freeze({ linha, coluna }),
  });
}

export function ehCoordenadaValida(valor: unknown): valor is Coordenada {
  if (typeof valor !== 'object' || valor === null) return false;

  const coordenada = valor as Partial<Coordenada>;
  return Number.isInteger(coordenada.linha)
    && Number.isInteger(coordenada.coluna)
    && coordenada.linha! >= 0
    && coordenada.linha! < DIMENSAO_TABULEIRO
    && coordenada.coluna! >= 0
    && coordenada.coluna! < DIMENSAO_TABULEIRO;
}
