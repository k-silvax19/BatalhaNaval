import { aplicarAtaque } from '../regras';
import type { Campo, CenarioPreparado, Coordenada } from '../regras';
import type {
  AtaqueHistorico,
  EstadoPartida,
  EstadoTurnoComputador,
  EstadoTurnoJogador,
  Participante,
  ResultadoComando,
} from './modelos';

export class MotorDaPartida {
  private estado: EstadoPartida = Object.freeze({ fase: 'preparando' });

  consultarEstado(): EstadoPartida {
    return copiarEstado(this.estado);
  }

  iniciar(cenario: CenarioPreparado): ResultadoComando {
    const campos = copiarCampos(cenario.campoJogador, cenario.campoComputador);
    this.estado = congelarProfundamente({
      fase: 'turno-do-jogador',
      campos,
      historico: [],
    });
    return aceitar(this.estado);
  }

  reiniciar(cenario: CenarioPreparado): ResultadoComando {
    return this.iniciar(cenario);
  }

  atacar(participante: Participante, coordenada: Coordenada): ResultadoComando {
    if (this.estado.fase === 'preparando') {
      return rejeitar({ tipo: 'partida-nao-iniciada' });
    }
    if (this.estado.fase === 'encerrada') {
      return rejeitar({ tipo: 'partida-encerrada' });
    }
    if (!participanteCorrespondeAoTurno(this.estado, participante)) {
      return rejeitar({ tipo: 'fora-do-turno' });
    }

    const campoAlvo = participante === 'jogador'
      ? this.estado.campos.campoComputador
      : this.estado.campos.campoJogador;
    const resultadoRegras = aplicarAtaque(campoAlvo, coordenada);
    if (!resultadoRegras.aceito) {
      return rejeitar({ tipo: 'ataque-rejeitado', motivoRegra: resultadoRegras.motivo });
    }

    const campos = participante === 'jogador'
      ? copiarCampos(this.estado.campos.campoJogador, resultadoRegras.campo)
      : copiarCampos(resultadoRegras.campo, this.estado.campos.campoComputador);
    const registro: AtaqueHistorico = congelarProfundamente({
      sequencia: this.estado.historico.length + 1,
      participante,
      coordenada: { linha: coordenada.linha, coluna: coordenada.coluna },
      resultado: resultadoRegras.resultado,
    });
    const historico = [...this.estado.historico, registro];

    this.estado = resultadoRegras.frotaDerrotada
      ? congelarProfundamente({ fase: 'encerrada', campos, historico, vencedor: participante })
      : criarEstadoDeTurno(
        participante === 'jogador' ? 'turno-do-computador' : 'turno-do-jogador',
        campos,
        historico,
      );
    return aceitar(this.estado);
  }
}

function participanteCorrespondeAoTurno(
  estado: EstadoTurnoJogador | EstadoTurnoComputador,
  participante: Participante,
): boolean {
  return (estado.fase === 'turno-do-jogador' && participante === 'jogador')
    || (estado.fase === 'turno-do-computador' && participante === 'computador');
}

function criarEstadoDeTurno(
  fase: 'turno-do-jogador' | 'turno-do-computador',
  campos: Readonly<{ campoJogador: Campo; campoComputador: Campo }>,
  historico: readonly AtaqueHistorico[],
): EstadoTurnoJogador | EstadoTurnoComputador {
  return congelarProfundamente({ fase, campos, historico });
}

function copiarCampos(campoJogador: Campo, campoComputador: Campo) {
  return congelarProfundamente({
    campoJogador: copiarCampo(campoJogador),
    campoComputador: copiarCampo(campoComputador),
  });
}

function copiarEstado(estado: EstadoPartida): EstadoPartida {
  if (estado.fase === 'preparando') return Object.freeze({ fase: 'preparando' });
  const campos = copiarCampos(estado.campos.campoJogador, estado.campos.campoComputador);
  const historico = estado.historico.map((ataque) => ({
    sequencia: ataque.sequencia,
    participante: ataque.participante,
    coordenada: { linha: ataque.coordenada.linha, coluna: ataque.coordenada.coluna },
    resultado: { ...ataque.resultado },
  }));
  return congelarProfundamente(estado.fase === 'encerrada'
    ? { fase: 'encerrada', campos, historico, vencedor: estado.vencedor }
    : { fase: estado.fase, campos, historico });
}

function copiarCampo(campo: Campo): Campo {
  return congelarProfundamente({
    navios: campo.navios.map((navio) => ({
      id: navio.id,
      tipo: navio.tipo,
      posicoes: navio.posicoes.map(({ linha, coluna }) => ({ linha, coluna })),
    })),
    ataques: campo.ataques.map(({ linha, coluna }) => ({ linha, coluna })),
  });
}

function aceitar(estado: EstadoPartida): ResultadoComando {
  return congelarProfundamente({ aceito: true, estado: copiarEstado(estado) });
}

function rejeitar(motivo: Extract<ResultadoComando, { aceito: false }>['motivo']): ResultadoComando {
  return congelarProfundamente({ aceito: false, motivo });
}

function congelarProfundamente<T>(valor: T): T {
  if (typeof valor !== 'object' || valor === null || Object.isFrozen(valor)) return valor;
  Object.freeze(valor);
  for (const propriedade of Object.values(valor)) congelarProfundamente(propriedade);
  return valor;
}
