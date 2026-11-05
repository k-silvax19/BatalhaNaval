import { aplicarAtaque } from '../regras';
import { MotorDaPartida } from '../motor';
import { gerarCampoAleatorio, prepararPartidaAutomatica } from './preparacao-automatica';
import { validarCampoCompleto } from '../regras';
import { describe, expect, it } from 'vitest';

function criarFonte(semente: number): () => number {
  let estado = semente >>> 0;
  return () => {
    estado = (estado * 1664525 + 1013904223) >>> 0;
    return estado / 0x1_0000_0000;
  };
}

describe('Preparação automática da partida', () => {
  it('gera um campo completo, válido e sem ataques', () => {
    const campo = gerarCampoAleatorio(criarFonte(1));

    expect(validarCampoCompleto(campo)).toEqual({ valido: true });
    expect(campo.ataques).toEqual([]);
    expect(campo.navios.map(({ tipo }) => tipo).sort()).toEqual([
      'cruzador', 'destroier', 'encouracado', 'porta-avioes', 'submarino',
    ]);
  });

  it('gera uma disposição reproduzível com a mesma sequência de escolhas', () => {
    const primeiro = gerarCampoAleatorio(criarFonte(42));
    const segundo = gerarCampoAleatorio(criarFonte(42));

    expect(segundo).toEqual(primeiro);
  });

  it('pode produzir disposições válidas diferentes com sequências distintas', () => {
    const primeiro = gerarCampoAleatorio(criarFonte(1));
    const segundo = gerarCampoAleatorio(criarFonte(2));

    expect(segundo.navios).not.toEqual(primeiro.navios);
    expect(validarCampoCompleto(segundo)).toEqual({ valido: true });
  });

  it('termina com fonte constante e rejeita escolhas inválidas', () => {
    expect(() => gerarCampoAleatorio(() => 0)).not.toThrow();
    expect(validarCampoCompleto(gerarCampoAleatorio(() => 0))).toEqual({ valido: true });
    expect(() => gerarCampoAleatorio(() => Number.NaN)).toThrow(RangeError);
    expect(() => gerarCampoAleatorio(() => 1)).toThrow(RangeError);
  });

  it('devolve campos independentes num cenário utilizável para iniciar e reiniciar o motor', () => {
    const cenario = prepararPartidaAutomatica(() => 0);
    const coordenadaAtaque = cenario.campoComputador.navios[0].posicoes[0];
    const resultadoAtaque = aplicarAtaque(cenario.campoComputador, coordenadaAtaque);

    expect(resultadoAtaque.aceito).toBe(true);
    expect(cenario.campoJogador).not.toBe(cenario.campoComputador);
    expect(cenario.campoJogador.navios).not.toBe(cenario.campoComputador.navios);
    expect(cenario.campoJogador.navios).toEqual(cenario.campoComputador.navios);
    expect(resultadoAtaque.aceito && resultadoAtaque.campo.ataques).toHaveLength(1);
    expect(cenario.campoComputador.ataques).toHaveLength(0);
    expect(cenario.campoJogador.ataques).toHaveLength(0);
    expect(validarCampoCompleto(cenario.campoJogador)).toEqual({ valido: true });
    expect(validarCampoCompleto(cenario.campoComputador)).toEqual({ valido: true });
  });

  it('inicia e reinicia o motor com cenários novos, descartando o histórico anterior', () => {
    const primeiroCenario = prepararPartidaAutomatica(criarFonte(23));
    const motor = new MotorDaPartida();

    expect(motor.iniciar(primeiroCenario).aceito).toBe(true);
    const coordenadaAtaque = primeiroCenario.campoComputador.navios[0].posicoes[0];
    expect(motor.atacar('jogador', coordenadaAtaque).aceito).toBe(true);
    const estadoAnterior = motor.consultarEstado();
    expect(estadoAnterior.fase).toBe('turno-do-computador');
    if (estadoAnterior.fase === 'preparando') throw new Error('A partida deveria ter iniciado.');
    expect(estadoAnterior.historico).toHaveLength(1);

    const novoCenario = prepararPartidaAutomatica(criarFonte(24));
    expect(motor.reiniciar(novoCenario).aceito).toBe(true);

    const novoEstado = motor.consultarEstado();
    expect(novoEstado.fase).toBe('turno-do-jogador');
    if (novoEstado.fase === 'preparando') throw new Error('A partida deveria ter reiniciado.');
    expect(novoEstado.historico).toEqual([]);
    expect(novoEstado.campos.campoJogador).toEqual(novoCenario.campoJogador);
    expect(novoEstado.campos.campoComputador).toEqual(novoCenario.campoComputador);
    expect(novoEstado.campos.campoComputador.ataques).toEqual([]);
    expect(estadoAnterior.historico).toHaveLength(1);
  });

  it('não permite que mutações externas alterem o cenário retornado', () => {
    const cenario = prepararPartidaAutomatica(criarFonte(9));
    const coordenada = cenario.campoJogador.navios[0].posicoes[0];

    expect(() => {
      (coordenada as { linha: number }).linha = 99;
    }).toThrow(TypeError);
    expect(validarCampoCompleto(cenario.campoJogador)).toEqual({ valido: true });
  });
});
