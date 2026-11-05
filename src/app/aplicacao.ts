import { Component, OnDestroy, computed, signal } from '@angular/core';
import { LucideAnchor, LucideRadar, LucideWaves } from '@lucide/angular';
import { MotorDaPartida } from './jogo/motor';
import type { AtaqueHistorico, EstadoPartida } from './jogo/motor';
import { DIMENSAO_TABULEIRO } from './jogo/regras';
import type { Campo, Coordenada, ResultadoAtaque, TipoNavio } from './jogo/regras';
import { prepararPartidaAutomatica } from './jogo/preparacao';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LucideAnchor, LucideRadar, LucideWaves],
  templateUrl: './aplicacao.html',
})
export class Aplicacao implements OnDestroy {
  readonly linhas = Array.from({ length: DIMENSAO_TABULEIRO }, (_, indice) => indice);
  readonly colunas = this.linhas;
  readonly fase = signal<'inicio' | 'partida'>('inicio');
  readonly estadoPartida = signal<EstadoPartida>({ fase: 'preparando' });
  readonly mensagemTurno = computed(() => {
    const estado = this.estadoPartida();
    switch (estado.fase) {
      case 'preparando': return 'Prepare-se para iniciar sua partida.';
      case 'turno-do-jogador': return 'Sua vez: escolha uma coordenada no campo adversário.';
      case 'turno-do-computador': return 'O computador está escolhendo um alvo...';
      case 'encerrada': return estado.vencedor === 'jogador' ? 'Vitória! Você venceu a batalha.' : 'Derrota. O computador venceu a batalha.';
    }
  });
  readonly ultimaMensagem = computed(() => {
    const estado = this.estadoPartida();
    if (estado.fase === 'preparando' || estado.historico.length === 0) return '';
    const ataque = estado.historico[estado.historico.length - 1];
    const autor = ataque.participante === 'jogador' ? 'Seu disparo' : 'Disparo do computador';
    return `${autor} em ${this.nomeCoordenada(ataque.coordenada)}: ${this.nomeResultado(ataque.resultado)}.`;
  });

  private readonly motor = new MotorDaPartida();
  private temporizadorComputador: ReturnType<typeof setTimeout> | undefined;
  private versaoPartida = 0;

  iniciarPartida(): void {
    this.cancelarAtaquePendente();
    this.versaoPartida += 1;
    const cenario = prepararPartidaAutomatica();
    const estadoAnterior = this.estadoPartida();
    const resultado = estadoAnterior.fase === 'preparando'
      ? this.motor.iniciar(cenario)
      : this.motor.reiniciar(cenario);
    if (!resultado.aceito) return;
    this.estadoPartida.set(resultado.estado);
    this.fase.set('partida');
  }

  disparar(coordenada: Coordenada): void {
    const estadoAtual = this.estadoPartida();
    if (estadoAtual.fase !== 'turno-do-jogador') return;

    const resultado = this.motor.atacar('jogador', coordenada);
    if (!resultado.aceito) return;
    this.estadoPartida.set(resultado.estado);
    if (resultado.estado.fase === 'turno-do-computador') this.agendarAtaqueComputador();
  }

  estaAtacada(campo: Campo, coordenada: Coordenada): boolean {
    return campo.ataques.some((ataque) => this.mesmaCoordenada(ataque, coordenada));
  }

  temNavio(campo: Campo, coordenada: Coordenada): boolean {
    return campo.navios.some((navio) => navio.posicoes.some((posicao) => this.mesmaCoordenada(posicao, coordenada)));
  }

  resultadoNaCelula(estado: EstadoPartida, participante: 'jogador' | 'computador', coordenada: Coordenada): ResultadoAtaque | undefined {
    if (estado.fase === 'preparando') return undefined;
    return estado.historico.find((ataque) =>
      ataque.participante === participante && this.mesmaCoordenada(ataque.coordenada, coordenada))?.resultado;
  }

  classeCelulaPropria(estado: EstadoPartida, coordenada: Coordenada): string {
    if (estado.fase === 'preparando') return 'border-slate-700 bg-slate-900 text-slate-700';
    const resultado = this.resultadoNaCelula(estado, 'computador', coordenada);
    if (resultado?.tipo === 'agua') return 'border-slate-600 bg-slate-800 text-slate-300';
    if (resultado?.tipo === 'acerto') return 'border-rose-400 bg-rose-500/30 text-rose-200';
    if (resultado?.tipo === 'navio-afundado') return 'border-rose-300 bg-rose-600 text-white';
    if (this.temNavio(estado.campos.campoJogador, coordenada)) return 'border-cyan-500/40 bg-cyan-400/20 text-cyan-200';
    return 'border-slate-700 bg-slate-900 text-slate-700';
  }

  classeCelulaAdversaria(estado: EstadoPartida, coordenada: Coordenada): string {
    const resultado = this.resultadoNaCelula(estado, 'jogador', coordenada);
    if (resultado?.tipo === 'agua') return 'border-slate-600 bg-slate-800 text-slate-300';
    if (resultado?.tipo === 'acerto') return 'border-rose-400 bg-rose-500/30 text-rose-200';
    if (resultado?.tipo === 'navio-afundado') return 'border-rose-300 bg-rose-600 text-white';
    const habilitado = estado.fase === 'turno-do-jogador';
    return habilitado
      ? 'border-cyan-500/30 bg-slate-900 text-cyan-300 hover:border-cyan-300 hover:bg-cyan-300/15 focus-visible:outline-cyan-200'
      : 'border-slate-700 bg-slate-900 text-slate-600';
  }

  rotuloCelulaPropria(estado: EstadoPartida, coordenada: Coordenada): string {
    const lugar = this.nomeCoordenada(coordenada);
    if (estado.fase === 'preparando') return `${lugar}, sem partida`;
    const resultado = this.resultadoNaCelula(estado, 'computador', coordenada);
    if (resultado) return `${lugar}, ${this.nomeResultado(resultado)} pelo computador`;
    return `${lugar}, ${this.temNavio(estado.campos.campoJogador, coordenada) ? 'navio próprio' : 'água'}`;
  }

  rotuloCelulaAdversaria(estado: EstadoPartida, coordenada: Coordenada): string {
    const lugar = this.nomeCoordenada(coordenada);
    const resultado = this.resultadoNaCelula(estado, 'jogador', coordenada);
    if (resultado) return `${lugar}, ${this.nomeResultado(resultado)} pelo jogador`;
    return `${lugar}, ${estado.fase === 'turno-do-jogador' ? 'disparar' : 'não disponível'}`;
  }

  simboloCelulaPropria(estado: EstadoPartida, coordenada: Coordenada): string {
    const resultado = this.resultadoNaCelula(estado, 'computador', coordenada);
    if (resultado?.tipo === 'agua') return '·';
    if (resultado) return '×';
    return estado.fase !== 'preparando' && this.temNavio(estado.campos.campoJogador, coordenada) ? '■' : '';
  }

  simboloCelulaAdversaria(estado: EstadoPartida, coordenada: Coordenada): string {
    const resultado = this.resultadoNaCelula(estado, 'jogador', coordenada);
    if (resultado?.tipo === 'agua') return '·';
    if (resultado) return '×';
    return '·';
  }

  nomeCoordenada(coordenada: Coordenada): string {
    return `${String.fromCharCode(65 + coordenada.coluna)}${coordenada.linha + 1}`;
  }

  nomeColuna(coluna: number): string {
    return String.fromCharCode(65 + coluna);
  }

  ngOnDestroy(): void {
    this.cancelarAtaquePendente();
  }

  private agendarAtaqueComputador(): void {
    this.cancelarAtaquePendente();
    const versaoAgendada = this.versaoPartida;
    this.temporizadorComputador = setTimeout(() => {
      this.temporizadorComputador = undefined;
      if (versaoAgendada !== this.versaoPartida) return;
      this.executarAtaqueComputador();
    }, 450);
  }

  private executarAtaqueComputador(): void {
    const estado = this.estadoPartida();
    if (estado.fase !== 'turno-do-computador') return;

    const disponiveis: Coordenada[] = [];
    for (const linha of this.linhas) {
      for (const coluna of this.colunas) {
        const coordenada = { linha, coluna };
        if (!this.estaAtacada(estado.campos.campoJogador, coordenada)) disponiveis.push(coordenada);
      }
    }
    if (disponiveis.length === 0) return;

    const coordenada = disponiveis[Math.floor(Math.random() * disponiveis.length)];
    const resultado = this.motor.atacar('computador', coordenada);
    if (resultado.aceito) this.estadoPartida.set(resultado.estado);
  }

  private cancelarAtaquePendente(): void {
    if (this.temporizadorComputador !== undefined) clearTimeout(this.temporizadorComputador);
    this.temporizadorComputador = undefined;
  }

  private nomeResultado(resultado: ResultadoAtaque): string {
    if (resultado.tipo === 'agua') return 'água';
    const navio = this.nomeNavio(resultado.tipoNavio);
    return resultado.tipo === 'navio-afundado' ? `${navio} afundado` : `${navio} atingido`;
  }

  private nomeNavio(tipo: TipoNavio): string {
    const nomes: Record<TipoNavio, string> = {
      'porta-avioes': 'porta-aviões',
      encouracado: 'encouraçado',
      cruzador: 'cruzador',
      submarino: 'submarino',
      destroier: 'destroier',
    };
    return nomes[tipo] ?? 'navio';
  }

  private mesmaCoordenada(a: Coordenada, b: Coordenada): boolean {
    return a.linha === b.linha && a.coluna === b.coluna;
  }
}
