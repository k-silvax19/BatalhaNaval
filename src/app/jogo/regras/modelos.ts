export type Coordenada = Readonly<{
  linha: number;
  coluna: number;
}>;

export type TipoNavio =
  | 'porta-avioes'
  | 'encouracado'
  | 'cruzador'
  | 'submarino'
  | 'destroier';

export type Navio = Readonly<{
  id: string;
  tipo: TipoNavio;
  posicoes: readonly Coordenada[];
}>;

export type Campo = Readonly<{
  navios: readonly Navio[];
  ataques: readonly Coordenada[];
}>;

export type CenarioPreparado = Readonly<{
  campoJogador: Campo;
  campoComputador: Campo;
}>;

export type ResultadoAtaque =
  | Readonly<{ tipo: 'agua' }>
  | Readonly<{ tipo: 'acerto' | 'navio-afundado'; navioId: string; tipoNavio: TipoNavio }>;

export type RejeicaoPosicionamento =
  | 'coordenada-invalida'
  | 'comprimento-invalido'
  | 'posicao-irregular'
  | 'fora-do-tabuleiro'
  | 'sobreposicao'
  | 'id-duplicado'
  | 'tipo-duplicado';

export type ResultadoPosicionamento =
  | Readonly<{ aceito: true; campo: Campo }>
  | Readonly<{ aceito: false; motivo: RejeicaoPosicionamento }>;

export type MotivoAtaqueRejeitado = 'coordenada-invalida' | 'ataque-repetido';

export type ResultadoAplicacaoAtaque =
  | Readonly<{ aceito: true; campo: Campo; resultado: ResultadoAtaque; frotaDerrotada: boolean }>
  | Readonly<{ aceito: false; motivo: MotivoAtaqueRejeitado }>;

export type ResultadoCenario =
  | Readonly<{ aceito: true; cenario: CenarioPreparado }>
  | Readonly<{ aceito: false; motivo: 'campo-jogador-invalido' | 'campo-computador-invalido' }>;

export type ResultadoValidacaoCampo =
  | Readonly<{ valido: true }>
  | Readonly<{ valido: false; motivo: 'frota-incompleta' | 'frota-duplicada' | 'campo-invalido' }>;
