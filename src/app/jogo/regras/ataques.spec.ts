import { describe, expect, it } from 'vitest';
import { aplicarAtaque } from './ataques';
import { criarCampo, posicionarNavio } from './campos';
import { criarCoordenada } from './coordenadas';
import type { Campo, Coordenada } from './modelos';

function coordenada(linha: number, coluna: number): Coordenada {
  const resultado = criarCoordenada(linha, coluna);
  if (!resultado.valida) throw new Error('Coordenada de teste inválida');
  return resultado.coordenada;
}

function criarCampoComFrota(): Campo {
  const primeiro = posicionarNavio(criarCampo(), {
    id: 'destruidor-1', tipo: 'destroier', posicoes: [coordenada(0, 0), coordenada(0, 1)],
  });
  if (!primeiro.aceito) throw new Error('Falha ao criar destróier de teste');
  const segundo = posicionarNavio(primeiro.campo, {
    id: 'submarino-1', tipo: 'submarino', posicoes: [coordenada(2, 0), coordenada(2, 1), coordenada(2, 2)],
  });
  if (!segundo.aceito) throw new Error('Falha ao criar submarino de teste');
  return segundo.campo;
}

describe('Aplicação de ataques', () => {
  it('registra água em um campo novo', () => {
    const resultado = aplicarAtaque(criarCampoComFrota(), coordenada(9, 9));

    expect(resultado.aceito).toBe(true);
    if (resultado.aceito) {
      expect(resultado.resultado).toEqual({ tipo: 'agua' });
      expect(resultado.frotaDerrotada).toBe(false);
      expect(resultado.campo.ataques).toHaveLength(1);
    }
  });

  it('distingue acerto, navio afundado e derrota da frota', () => {
    const campo = criarCampoComFrota();
    const acerto = aplicarAtaque(campo, coordenada(0, 0));
    expect(acerto.aceito && acerto.resultado.tipo).toBe('acerto');
    expect(acerto.aceito && acerto.frotaDerrotada).toBe(false);

    const afundado = aplicarAtaque(acerto.aceito ? acerto.campo : campo, coordenada(0, 1));
    expect(afundado.aceito && afundado.resultado).toEqual({
      tipo: 'navio-afundado', navioId: 'destruidor-1', tipoNavio: 'destroier',
    });
    expect(afundado.aceito && afundado.frotaDerrotada).toBe(false);

    let final = afundado.aceito ? afundado.campo : campo;
    let resultadoFinal: ReturnType<typeof aplicarAtaque> | undefined;
    for (const posicao of [coordenada(2, 0), coordenada(2, 1), coordenada(2, 2)]) {
      const ataque = aplicarAtaque(final, posicao);
      expect(ataque.aceito).toBe(true);
      if (ataque.aceito) {
        final = ataque.campo;
        resultadoFinal = ataque;
      }
    }
    expect(resultadoFinal?.aceito && resultadoFinal.frotaDerrotada).toBe(true);
    expect(resultadoFinal?.aceito && resultadoFinal.resultado.tipo).toBe('navio-afundado');
    expect(aplicarAtaque(final, coordenada(2, 2))).toEqual({
      aceito: false, motivo: 'ataque-repetido',
    });
    expect(final.ataques).toHaveLength(5);
    expect(final.navios).toHaveLength(2);
  });

  it('rejeita ataque repetido ou coordenada inválida sem alterar o campo', () => {
    const campo = criarCampoComFrota();
    const primeiro = aplicarAtaque(campo, coordenada(9, 9));
    expect(primeiro.aceito).toBe(true);
    if (!primeiro.aceito) return;

    expect(aplicarAtaque(primeiro.campo, coordenada(9, 9))).toEqual({
      aceito: false, motivo: 'ataque-repetido',
    });
    expect(aplicarAtaque(primeiro.campo, { linha: 10, coluna: 0 })).toEqual({
      aceito: false, motivo: 'coordenada-invalida',
    });
    expect(primeiro.campo.ataques).toEqual([coordenada(9, 9)]);
    expect(campo.ataques).toEqual([]);
  });
});
