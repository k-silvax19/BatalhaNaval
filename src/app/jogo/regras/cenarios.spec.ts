import { describe, expect, it } from 'vitest';
import { COMPRIMENTOS_FROTA, criarCampo, posicionarNavio } from './campos';
import { prepararCenario } from './cenarios';
import { criarCoordenada } from './coordenadas';
import type { TipoNavio } from './modelos';

function posicionarFrotaCompleta() {
  let campo = criarCampo();
  const tipos: readonly TipoNavio[] = ['porta-avioes', 'encouracado', 'cruzador', 'submarino', 'destroier'];
  tipos.forEach((tipo, indice) => {
    const posicoes = Array.from({ length: COMPRIMENTOS_FROTA[tipo] }, (_, passo) => {
      const coordenada = criarCoordenada(indice * 2, passo);
      if (!coordenada.valida) throw new Error('Coordenada de teste inválida');
      return coordenada.coordenada;
    });
    const resultado = posicionarNavio(campo, { id: tipo, tipo, posicoes });
    if (!resultado.aceito) throw new Error(`Falha ao posicionar ${tipo}`);
    campo = resultado.campo;
  });
  return campo;
}

describe('Preparação de cenário', () => {
  it('prepara cenário a partir de duas frotas completas sem alterar as entradas', () => {
    const campoJogador = posicionarFrotaCompleta();
    const campoComputador = posicionarFrotaCompleta();
    const naviosJogador = campoJogador.navios;

    const resultado = prepararCenario(campoJogador, campoComputador);

    expect(resultado.aceito).toBe(true);
    if (resultado.aceito) {
      expect(resultado.cenario.campoJogador.navios).toHaveLength(5);
      expect(resultado.cenario.campoComputador.navios).toHaveLength(5);
      expect(resultado.cenario.campoJogador.navios).not.toBe(naviosJogador);
      expect(campoJogador.navios).toBe(naviosJogador);
    }
  });

  it('rejeita campo incompleto de cada lado sem modificar os campos', () => {
    const campoIncompleto = criarCampo();
    const campoValido = posicionarFrotaCompleta();

    expect(prepararCenario(campoIncompleto, campoValido)).toEqual({
      aceito: false, motivo: 'campo-jogador-invalido',
    });
    expect(prepararCenario(campoValido, campoIncompleto)).toEqual({
      aceito: false, motivo: 'campo-computador-invalido',
    });
    expect(campoIncompleto.navios).toEqual([]);
  });
});
