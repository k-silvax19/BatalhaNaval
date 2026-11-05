import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { Aplicacao } from './aplicacao';
import { configuracaoAplicacao } from './aplicacao.config';

describe('Inicialização da aplicação', () => {
  it('apresenta o modo contra o computador sem oferecer início de partida', async () => {
    await TestBed.configureTestingModule({
      imports: [Aplicacao],
      providers: configuracaoAplicacao.providers,
    }).compileComponents();

    const componente = TestBed.createComponent(Aplicacao);
    await componente.whenStable();

    const elemento = componente.nativeElement as HTMLElement;
    expect(elemento.querySelector('main')).not.toBeNull();
    expect(elemento.querySelector('h1')?.textContent).toContain('Batalha');
    expect(elemento.textContent).toContain('Jogador vs. computador');
    expect(elemento.textContent).toContain('partidas ainda estão em desenvolvimento');
    expect(elemento.querySelector('button:not([disabled]), a[href]')).toBeNull();
    expect(elemento.querySelectorAll('svg[aria-hidden="true"]').length).toBe(3);
  });
});
