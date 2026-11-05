import { describe, expect, it } from 'vitest';
import { aplicarAtaque } from './ataques';
import { criarCampo, posicionarNavio } from './campos';
import { prepararCenario } from './cenarios';
import { criarCoordenada } from './coordenadas';
import type { Campo, Coordenada, TipoNavio } from './modelos';

function criarFrota(tipo: TipoNavio = 'destroier'): Campo {
  let campo = criarCampo();
  const tamanhos: Record<TipoNavio, number> = {
    'porta-avioes': 5, encouracado: 4, cruzador: 3, submarino: 3, destroier: 2,
  };
  const linhas: Record<TipoNavio, number> = {
    'porta-avioes': 0, encouracado: 2, cruzador: 4, submarino: 6, destroier: 8,
  };
  const posicoes: Coordenada[] = Array.from({ length: tamanhos[tipo] }, (_, indice) => {
    const resultado = criarCoordenada(linhas[tipo], indice);
    if (!resultado.valida) throw new Error('Coordenada de teste inválida');
    return resultado.coordenada;
  });
  const navio = posicionarNavio(campo, { id: tipo, tipo, posicoes });
  if (!navio.aceito) throw new Error('Falha ao montar frota de teste');
  campo = navio.campo;

  for (const outroTipo of ['porta-avioes', 'encouracado', 'cruzador', 'submarino', 'destroier'] as const) {
    if (outroTipo === tipo) continue;
    const coordenadas = Array.from({ length: tamanhos[outroTipo] }, (_, indice) => {
      const resultado = criarCoordenada(linhas[outroTipo], indice);
      if (!resultado.valida) throw new Error('Coordenada de teste inválida');
      return resultado.coordenada;
    });
    const resultado = posicionarNavio(campo, { id: outroTipo, tipo: outroTipo, posicoes: coordenadas });
    if (!resultado.aceito) throw new Error('Falha ao completar frota de teste');
    campo = resultado.campo;
  }
  return campo;
}

describe('Imutabilidade dos valores de domínio', () => {
  it('protege coordenadas e campos criados ou retornados', () => {
    const coordenada = criarCoordenada(0, 0);
    expect(coordenada.valida).toBe(true);
    if (!coordenada.valida) return;

    expect(() => {
      (coordenada.coordenada as { linha: number }).linha = 9;
    }).toThrow();

    const campo = criarFrota();
    expect(() => {
      (campo.navios[0].posicoes[0] as { coluna: number }).coluna = 9;
    }).toThrow();
    expect(campo.navios[0].posicoes[0]).toEqual({ linha: 8, coluna: 0 });
  });

  it('protege cenários, campos atualizados e resultados de ataque', () => {
    const campoJogador = criarFrota();
    const campoComputador = criarFrota();
    const preparacao = prepararCenario(campoJogador, campoComputador);
    expect(preparacao.aceito).toBe(true);
    if (!preparacao.aceito) return;

    expect(Object.isFrozen(preparacao.cenario)).toBe(true);
    expect(() => {
      (preparacao.cenario.campoJogador.navios as unknown as unknown[]).pop();
    }).toThrow();

    const ataque = aplicarAtaque(preparacao.cenario.campoComputador, { linha: 9, coluna: 9 });
    expect(ataque.aceito).toBe(true);
    if (!ataque.aceito) return;
    expect(() => {
      (ataque.resultado as { tipo: string }).tipo = 'acerto';
    }).toThrow();
    expect(() => {
      (ataque.campo.ataques as unknown as unknown[]).push({ linha: 0, coluna: 0 });
    }).toThrow();
    expect(ataque.campo.ataques).toHaveLength(1);
  });
});
