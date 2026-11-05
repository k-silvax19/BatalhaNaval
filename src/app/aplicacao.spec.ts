import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Aplicacao } from './aplicacao';
import { configuracaoAplicacao } from './aplicacao.config';

describe('Partida contra o computador', () => {
  afterEach(() => vi.useRealTimers());

  it('inicia a partida e mostra tabuleiros sem revelar navios adversários', async () => {
    const fixture = await criarAplicacao();
    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.querySelector('h1')?.textContent).toContain('Batalha');
    expect(elemento.querySelector('button')?.textContent).toContain('Iniciar partida');
    elemento.querySelector<HTMLButtonElement>('button')?.click();
    fixture.detectChanges();

    const tabuleiros = elemento.querySelectorAll('[role="grid"]');
    const proprios = elemento.querySelector<HTMLElement>('[aria-label="Tabuleiro do jogador"]');
    const adversario = elemento.querySelector<HTMLElement>('[aria-label="Tabuleiro adversário"]');
    expect(tabuleiros).toHaveLength(2);
    expect(elemento.textContent).toContain('Sua vez: escolha uma coordenada');
    expect(proprios?.querySelectorAll('[role="gridcell"]')).toHaveLength(100);
    expect(adversario?.querySelectorAll('button[aria-label$=", disparar"]')).toHaveLength(100);
    expect(adversario?.textContent).not.toContain('■');
    expect([...adversario!.querySelectorAll('button')].some((botao) => botao.getAttribute('aria-label')?.includes('navio'))).toBe(false);

    fixture.destroy();
  });

  it('executa turnos do computador sem repetir ataques e permite concluir a partida', async () => {
    const fixture = await criarAplicacao();
    const componente = fixture.componentInstance;
    const elemento = fixture.nativeElement as HTMLElement;
    elemento.querySelector<HTMLButtonElement>('button')?.click();
    fixture.detectChanges();

    const estadoInicial = componente.estadoPartida();
    expect(estadoInicial.fase).toBe('turno-do-jogador');
    if (estadoInicial.fase === 'preparando') throw new Error('A partida deveria estar ativa.');
    const alvos = estadoInicial.campos.campoComputador.navios.flatMap((navio) => navio.posicoes);
    vi.useFakeTimers();

    for (const alvo of alvos) {
      const etiqueta = `${String.fromCharCode(65 + alvo.coluna)}${alvo.linha + 1}, disparar`;
      const botao = [...elemento.querySelectorAll<HTMLButtonElement>('[aria-label$=", disparar"]')]
        .find((candidato) => candidato.getAttribute('aria-label')?.startsWith(etiqueta));
      expect(botao, `deve haver botão disponível para ${etiqueta}`).toBeDefined();
      botao!.click();
      fixture.detectChanges();

      const estadoDepoisDoJogador = componente.estadoPartida();
      if (estadoDepoisDoJogador.fase === 'encerrada') break;
      expect(estadoDepoisDoJogador.fase).toBe('turno-do-computador');
      if (estadoDepoisDoJogador.fase !== 'preparando') {
        expect(estadoDepoisDoJogador.historico.at(-1)?.participante).toBe('jogador');
      }
      expect([...elemento.querySelectorAll<HTMLButtonElement>('[aria-label$=", disparar"]')]
        .every((disponivel) => disponivel.disabled)).toBe(true);

      await vi.advanceTimersByTimeAsync(450);
      fixture.detectChanges();
      const estadoDepoisDoComputador = componente.estadoPartida();
      if (estadoDepoisDoComputador.fase !== 'preparando') {
        expect(estadoDepoisDoComputador.historico.length).toBeGreaterThan(0);
        expect(estadoDepoisDoComputador.historico.at(-1)?.participante).toBe('computador');
        const ataquesComputador = estadoDepoisDoComputador.historico
          .filter((ataque) => ataque.participante === 'computador')
          .map(({ coordenada }) => `${coordenada.linha}:${coordenada.coluna}`);
        expect(new Set(ataquesComputador).size).toBe(ataquesComputador.length);
      }
    }

    expect(componente.estadoPartida().fase).toBe('encerrada');
    const estadoEncerrado = componente.estadoPartida();
    if (estadoEncerrado.fase === 'encerrada') {
      expect(estadoEncerrado.vencedor).toBe('jogador');
    }
    expect(elemento.textContent).toContain('Vitória! Você venceu a batalha.');
    expect(elemento.querySelector('button')?.textContent).toContain('Nova partida');

    elemento.querySelector<HTMLButtonElement>('button')?.click();
    fixture.detectChanges();
    const novoEstado = componente.estadoPartida();
    expect(novoEstado.fase).toBe('turno-do-jogador');
    if (novoEstado.fase !== 'preparando') expect(novoEstado.historico.length).toBe(0);

    fixture.destroy();
  });

  it('cancela a resposta pendente do computador quando a partida é reiniciada', async () => {
    const fixture = await criarAplicacao();
    const componente = fixture.componentInstance;
    const elemento = fixture.nativeElement as HTMLElement;
    elemento.querySelector<HTMLButtonElement>('button')?.click();
    fixture.detectChanges();
    vi.useFakeTimers();

    elemento.querySelector<HTMLButtonElement>('[aria-label$=", disparar"]')?.click();
    fixture.detectChanges();
    expect(componente.estadoPartida().fase).toBe('turno-do-computador');

    elemento.querySelector<HTMLButtonElement>('button')?.click();
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(450);
    fixture.detectChanges();

    const estado = componente.estadoPartida();
    expect(estado.fase).toBe('turno-do-jogador');
    if (estado.fase !== 'preparando') expect(estado.historico).toEqual([]);

    fixture.destroy();
  });
});

async function criarAplicacao() {
  await TestBed.configureTestingModule({
    imports: [Aplicacao],
    providers: configuracaoAplicacao.providers,
  }).compileComponents();

  const fixture = TestBed.createComponent(Aplicacao);
  fixture.detectChanges();
  return fixture;
}
