import type {
  Campo,
  Coordenada,
  MotivoAtaqueRejeitado,
  ResultadoAtaque,
} from '../regras';

export type Participante = 'jogador' | 'computador';

export type AtaqueHistorico = Readonly<{
  sequencia: number;
  participante: Participante;
  coordenada: Coordenada;
  resultado: ResultadoAtaque;
}>;

export type EstadoPreparando = Readonly<{
  fase: 'preparando';
}>;

type EstadoTurno<NomeFase extends 'turno-do-jogador' | 'turno-do-computador'> = Readonly<{
  fase: NomeFase;
  campos: Readonly<{
    campoJogador: Campo;
    campoComputador: Campo;
  }>;
  historico: readonly AtaqueHistorico[];
}>;

export type EstadoTurnoJogador = EstadoTurno<'turno-do-jogador'>;
export type EstadoTurnoComputador = EstadoTurno<'turno-do-computador'>;

export type EstadoEncerrado = Readonly<{
  fase: 'encerrada';
  campos: Readonly<{
    campoJogador: Campo;
    campoComputador: Campo;
  }>;
  historico: readonly AtaqueHistorico[];
  vencedor: Participante;
}>;

export type EstadoPartida =
  | EstadoPreparando
  | EstadoTurnoJogador
  | EstadoTurnoComputador
  | EstadoEncerrado;

export type MotivoRejeicaoComando =
  | Readonly<{ tipo: 'partida-nao-iniciada' }>
  | Readonly<{ tipo: 'partida-encerrada' }>
  | Readonly<{ tipo: 'fora-do-turno' }>
  | Readonly<{ tipo: 'ataque-rejeitado'; motivoRegra: MotivoAtaqueRejeitado }>;

export type ResultadoComando =
  | Readonly<{ aceito: true; estado: EstadoPartida }>
  | Readonly<{ aceito: false; motivo: MotivoRejeicaoComando }>;
