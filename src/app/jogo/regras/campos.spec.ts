import { describe, expect, it } from 'vitest';
import { criarCoordenada } from './coordenadas';
import { COMPRIMENTOS_FROTA, criarCampo, posicionarNavio, validarCampoCompleto } from './campos';
import type { Coordenada, Navio, TipoNavio } from './modelos';

function coordenadas(linha: number, coluna: number, quantidade: number, vertical = false): Coordenada[] {
  return Array.from({ length: quantidade }, (_, indice) => {
    const resultado = criarCoordenada(linha + (vertical ? indice : 0), coluna + (vertical ? 0 : indice));
    if (!resultado.valida) throw new Error('Coordenada de teste inválida');
    return resultado.coordenada;
  });
}

function posicionarFrotaCompleta(): ReturnType<typeof criarCampo> {
  let campo = criarCampo();
  const posicionamentos: readonly [TipoNavio, number, number, boolean][] = [
    ['porta-avioes', 0, 0, false],
    ['encouracado', 2, 0, false],
    ['cruzador', 4, 0, false],
    ['submarino', 6, 0, false],
    ['destroier', 8, 0, false],
  ];

  for (const [tipo, linha, coluna, vertical] of posicionamentos) {
    const navio: Navio = {
      id: tipo,
      tipo,
      posicoes: coordenadas(linha, coluna, COMPRIMENTOS_FROTA[tipo], vertical),
    };
    const resultado = posicionarNavio(campo, navio);
    if (!resultado.aceito) throw new Error(`Falha ao posicionar ${tipo}: ${resultado.motivo}`);
    campo = resultado.campo;
  }
  return campo;
}

describe('Campos e posicionamento da frota', () => {
  it('define os comprimentos e valida uma frota completa', () => {
    expect(Object.values(COMPRIMENTOS_FROTA)).toEqual([5, 4, 3, 3, 2]);
    expect(validarCampoCompleto(posicionarFrotaCompleta())).toEqual({ valido: true });
  });

  it('aceita navios verticais e navios adjacentes sem sobreposição', () => {
    const primeiro = posicionarNavio(criarCampo(), {
      id: 'sub-1', tipo: 'submarino', posicoes: coordenadas(0, 0, 3, true),
    });
    expect(primeiro.aceito).toBe(true);
    if (!primeiro.aceito) return;

    const segundo = posicionarNavio(primeiro.campo, {
      id: 'sub-2', tipo: 'submarino', posicoes: coordenadas(0, 1, 3, true),
    });
    expect(segundo).toEqual({ aceito: false, motivo: 'tipo-duplicado' });
    const adjacente = posicionarNavio(primeiro.campo, {
      id: 'cruzador-1', tipo: 'cruzador', posicoes: coordenadas(0, 1, 3, true),
    });
    expect(adjacente.aceito).toBe(true);
  });

  it.each([
    { id: 'curto', tipo: 'submarino' as const, posicoes: coordenadas(0, 0, 2) },
    { id: 'fora', tipo: 'submarino' as const, posicoes: coordenadas(0, 0, 3).map((p) => ({ ...p, coluna: p.coluna + 8 })) },
    { id: 'dobrado', tipo: 'submarino' as const, posicoes: [{ linha: 0, coluna: 0 }, { linha: 1, coluna: 1 }, { linha: 2, coluna: 1 }] },
    { id: 'lacuna', tipo: 'submarino' as const, posicoes: [{ linha: 0, coluna: 0 }, { linha: 0, coluna: 2 }, { linha: 0, coluna: 3 }] },
  ])('rejeita posicionamento inválido sem alterar o campo', ({ id, tipo, posicoes }) => {
    const campo = criarCampo();
    const resultado = posicionarNavio(campo, { id, tipo, posicoes });

    expect(resultado.aceito).toBe(false);
    expect(campo.navios).toHaveLength(0);
  });

  it('rejeita sobreposição e sinaliza frota incompleta', () => {
    const inicial = posicionarNavio(criarCampo(), {
      id: 'primeiro', tipo: 'submarino', posicoes: coordenadas(0, 0, 3),
    });
    expect(inicial.aceito).toBe(true);
    if (!inicial.aceito) return;

    expect(posicionarNavio(inicial.campo, {
      id: 'cruzador', tipo: 'cruzador', posicoes: coordenadas(0, 2, 3),
    })).toEqual({ aceito: false, motivo: 'sobreposicao' });
    expect(validarCampoCompleto(inicial.campo)).toEqual({ valido: false, motivo: 'frota-incompleta' });
  });
});

export { posicionarFrotaCompleta };
