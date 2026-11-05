import { describe, expect, it } from 'vitest';
import { criarCoordenadasDeAgua, criarCenarioCompleto } from './motor-fixture';
import { MotorDaPartida } from './motor-da-partida';
import type { Participante } from './modelos';

describe('Motor da partida', () => {
  it('começa em preparação sem expor dados de partida', () => {
    const motor = new MotorDaPartida();

    expect(motor.consultarEstado()).toEqual({ fase: 'preparando' });
  });

  it('inicia com cenário preparado e concede o primeiro turno ao jogador', () => {
    const motor = new MotorDaPartida();
    const cenario = criarCenarioCompleto();

    const resultado = motor.iniciar(cenario);
    const estado = motor.consultarEstado();

    expect(resultado.aceito).toBe(true);
    expect(estado.fase).toBe('turno-do-jogador');
    if (estado.fase !== 'preparando') {
      expect(estado.historico).toEqual([]);
      expect(estado.campos.campoJogador).not.toBe(cenario.campoJogador);
      expect(estado.campos.campoComputador.navios).toHaveLength(5);
    }
  });

  it('rejeita ataques antes do início e fora do turno sem alterar o estado', () => {
    const motor = new MotorDaPartida();
    const antesDoInicio = motor.consultarEstado();

    expect(motor.atacar('jogador', { linha: 0, coluna: 0 })).toEqual({
      aceito: false, motivo: { tipo: 'partida-nao-iniciada' },
    });
    expect(motor.consultarEstado()).toEqual(antesDoInicio);

    motor.iniciar(criarCenarioCompleto());
    const antesDoTurnoInvalido = motor.consultarEstado();
    expect(motor.atacar('computador', { linha: 0, coluna: 0 })).toEqual({
      aceito: false, motivo: { tipo: 'fora-do-turno' },
    });
    expect(motor.consultarEstado()).toEqual(antesDoTurnoInvalido);
  });

  it('propaga ataque repetido pelas regras sem alterar o estado da partida', () => {
    const motor = new MotorDaPartida();
    motor.iniciar(criarCenarioCompleto());
    expect(motor.atacar('jogador', { linha: 9, coluna: 9 }).aceito).toBe(true);
    expect(motor.atacar('computador', { linha: 9, coluna: 0 }).aceito).toBe(true);
    const anterior = motor.consultarEstado();
    if (anterior.fase !== 'preparando') {
      expect(anterior.historico.map(({ sequencia, participante }) => [sequencia, participante])).toEqual([
        [1, 'jogador'], [2, 'computador'],
      ]);
    }

    expect(motor.atacar('jogador', { linha: 9, coluna: 9 })).toEqual({
      aceito: false,
      motivo: { tipo: 'ataque-rejeitado', motivoRegra: 'ataque-repetido' },
    });
    expect(motor.consultarEstado()).toEqual(anterior);
  });

  it('não oculta exceções inesperadas lançadas durante a validação das regras', () => {
    const motor = new MotorDaPartida();
    motor.iniciar(criarCenarioCompleto());
    const antes = motor.consultarEstado();
    const coordenadaQueFalha = new Proxy({ linha: 0, coluna: 0 }, {
      get(alvo, propriedade, receptor) {
        if (propriedade === 'linha') throw new Error('Falha inesperada das regras');
        return Reflect.get(alvo, propriedade, receptor);
      },
    });

    expect(() => motor.atacar('jogador', coordenadaQueFalha)).toThrow('Falha inesperada das regras');
    expect(motor.consultarEstado()).toEqual(antes);
  });
});

describe('Reinício da partida', () => {
  it('descarta campos e histórico de uma partida ativa', () => {
    const motor = new MotorDaPartida();
    const cenario = criarCenarioCompleto();
    motor.iniciar(cenario);
    const ataque = motor.atacar('jogador', { linha: 9, coluna: 9 });
    expect(ataque.aceito).toBe(true);

    const reinicio = motor.reiniciar(cenario);
    const estado = motor.consultarEstado();

    expect(reinicio.aceito).toBe(true);
    expect(estado.fase).toBe('turno-do-jogador');
    if (estado.fase !== 'preparando') {
      expect(estado.historico).toEqual([]);
      expect(estado.campos.campoComputador.ataques).toEqual([]);
    }
  });

  it('substitui estado encerrado e remove o vencedor', () => {
    const motor = new MotorDaPartida();
    const cenario = criarCenarioCompleto();
    motor.iniciar(cenario);
    const alvos = cenario.campoComputador.navios.flatMap((navio) => navio.posicoes);
    const aguasComputador = criarCoordenadasDeAgua(cenario.campoJogador);
    let proximaAgua = 0;

    for (const alvo of alvos) {
      const resultadoJogador = motor.atacar('jogador', alvo);
      expect(resultadoJogador.aceito).toBe(true);
      if (!resultadoJogador.aceito || resultadoJogador.estado.fase === 'encerrada') break;
      const respostaComputador = motor.atacar('computador', aguasComputador[proximaAgua++]);
      expect(respostaComputador.aceito).toBe(true);
    }

    const antesDoReinicio = motor.consultarEstado();
    expect(antesDoReinicio.fase).toBe('encerrada');
    const resultado = motor.reiniciar(cenario);
    const estado = motor.consultarEstado();

    expect(resultado.aceito).toBe(true);
    expect(estado.fase).toBe('turno-do-jogador');
    if (estado.fase !== 'preparando') {
      expect(estado.historico).toEqual([]);
      expect(estado.campos.campoComputador.ataques).toEqual([]);
      expect('vencedor' in estado).toBe(false);
    }
  });

  it('rejeita ataques depois do encerramento sem alterar o estado final', () => {
    const motor = new MotorDaPartida();
    const cenario = criarCenarioCompleto();
    motor.iniciar(cenario);
    const aguasComputador = criarCoordenadasDeAgua(cenario.campoJogador);
    let proximaAgua = 0;

    for (const alvo of cenario.campoComputador.navios.flatMap((navio) => navio.posicoes)) {
      const ataque = motor.atacar('jogador', alvo);
      if (!ataque.aceito || ataque.estado.fase === 'encerrada') break;
      motor.atacar('computador', aguasComputador[proximaAgua++]);
    }

    const estadoFinal = motor.consultarEstado();
    expect(estadoFinal.fase).toBe('encerrada');
    expect(motor.atacar('jogador', { linha: 9, coluna: 9 })).toEqual({
      aceito: false, motivo: { tipo: 'partida-encerrada' },
    });
    expect(motor.consultarEstado()).toEqual(estadoFinal);
  });
});

describe('Alternância após ataques aceitos', () => {
  it.each([
    ['jogador', 'agua', { linha: 9, coluna: 9 }, 'turno-do-computador'],
    ['jogador', 'acerto', { linha: 0, coluna: 0 }, 'turno-do-computador'],
    ['jogador', 'navio-afundado', { linha: 0, coluna: 4 }, 'turno-do-computador'],
    ['computador', 'agua', { linha: 9, coluna: 9 }, 'turno-do-jogador'],
    ['computador', 'acerto', { linha: 0, coluna: 0 }, 'turno-do-jogador'],
    ['computador', 'navio-afundado', { linha: 0, coluna: 4 }, 'turno-do-jogador'],
  ] as const)('alterna após %s obter %s', (participante, tipoResultado, alvo, proximaFase) => {
    const cenario = criarCenarioCompleto();
    const motor = new MotorDaPartida();
    motor.iniciar(cenario);

    if (tipoResultado === 'navio-afundado') {
      const posicoesAnteriores = [0, 1, 2, 3];
      for (const coluna of posicoesAnteriores) {
        const ataque = atacarNoTurno(motor, participante, { linha: 0, coluna }, cenario);
        expect(ataque.aceito).toBe(true);
      }
    }

    const resultado = atacarNoTurno(motor, participante, alvo, cenario);
    expect(resultado.aceito).toBe(true);
    if (resultado.aceito) {
      expect(resultado.estado.fase).toBe(proximaFase);
      if (resultado.estado.fase !== 'preparando' && resultado.estado.fase !== 'encerrada') {
        expect(resultado.estado.historico.at(-1)?.resultado.tipo).toBe(tipoResultado);
      }
    }
  });
});

describe('Encerramento da partida', () => {
  it('declara vitória do jogador após registrar o ataque final', () => {
    const cenario = criarCenarioCompleto();
    const motor = new MotorDaPartida();
    motor.iniciar(cenario);
    const alvos = cenario.campoComputador.navios.flatMap((navio) => navio.posicoes);

    const estadoFinal = vencerPartida(motor, 'jogador', alvos, cenario);

    expect(estadoFinal.fase).toBe('encerrada');
    if (estadoFinal.fase === 'encerrada') {
      expect(estadoFinal.vencedor).toBe('jogador');
      expect(estadoFinal.historico.at(-1)).toMatchObject({ participante: 'jogador', coordenada: alvos.at(-1) });
    }
  });

  it('declara vitória do computador após registrar o ataque final', () => {
    const cenario = criarCenarioCompleto();
    const motor = new MotorDaPartida();
    motor.iniciar(cenario);
    const alvos = cenario.campoJogador.navios.flatMap((navio) => navio.posicoes);

    const estadoFinal = vencerPartida(motor, 'computador', alvos, cenario);

    expect(estadoFinal.fase).toBe('encerrada');
    if (estadoFinal.fase === 'encerrada') {
      expect(estadoFinal.vencedor).toBe('computador');
      expect(estadoFinal.historico.at(-1)).toMatchObject({ participante: 'computador', coordenada: alvos.at(-1) });
      const estadoAntesDoAtaquePosterior = motor.consultarEstado();
      expect(motor.atacar('jogador', { linha: 9, coluna: 9 })).toEqual({
        aceito: false, motivo: { tipo: 'partida-encerrada' },
      });
      expect(motor.consultarEstado()).toEqual(estadoAntesDoAtaquePosterior);
    }
  });
});

describe('Snapshots defensivos do motor', () => {
  it('impede alterar fase, campos e histórico consultados', () => {
    const motor = new MotorDaPartida();
    motor.iniciar(criarCenarioCompleto());
    const snapshotInicial = motor.consultarEstado();
    if (snapshotInicial.fase === 'preparando') throw new Error('Partida não iniciou');

    expect(() => {
      (snapshotInicial as { fase: string }).fase = 'encerrada';
    }).toThrow();
    expect(() => {
      (snapshotInicial.campos.campoJogador.navios as unknown as unknown[]).pop();
    }).toThrow();

    motor.atacar('jogador', { linha: 9, coluna: 9 });
    const snapshotComHistorico = motor.consultarEstado();
    if (snapshotComHistorico.fase === 'preparando') throw new Error('Partida saiu de estado válido');
    expect(() => {
      (snapshotComHistorico.historico as unknown as unknown[]).push({});
    }).toThrow();
    expect(() => {
      (snapshotComHistorico.historico[0] as { sequencia: number }).sequencia = 99;
    }).toThrow();

    expect(motor.consultarEstado()).toEqual(snapshotComHistorico);
    expect(motor.consultarEstado()).not.toEqual(snapshotInicial);
  });
});

function atacarNoTurno(
  motor: MotorDaPartida,
  participante: Participante,
  coordenada: { linha: number; coluna: number },
  cenario: ReturnType<typeof criarCenarioCompleto>,
) {
  const estado = motor.consultarEstado();
  if (estado.fase !== 'preparando' && estado.fase !== 'encerrada') {
    const participanteAtual: Participante = estado.fase === 'turno-do-jogador' ? 'jogador' : 'computador';
    if (participanteAtual !== participante) {
      const campoAtacado = participanteAtual === 'jogador'
        ? cenario.campoComputador
        : cenario.campoJogador;
      const aguas = criarCoordenadasDeAgua(campoAtacado);
      const ataquesAnteriores = estado.historico.filter((ataque) => ataque.participante === participanteAtual).length;
      const resultado = motor.atacar(participanteAtual, aguas[ataquesAnteriores]);
      if (!resultado.aceito) throw new Error('Falha ao alternar turno no cenário de teste');
    }
  }
  return motor.atacar(participante, coordenada);
}

function vencerPartida(
  motor: MotorDaPartida,
  participante: Participante,
  alvos: readonly { linha: number; coluna: number }[],
  cenario: ReturnType<typeof criarCenarioCompleto>,
) {
  for (const alvo of alvos) {
    const resultado = atacarNoTurno(motor, participante, alvo, cenario);
    if (!resultado.aceito || resultado.estado.fase === 'encerrada') break;
  }
  return motor.consultarEstado();
}
